import { describe, it, expect, vi, beforeEach } from "vitest";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LangfuseClient } from "./client.js";
import { registerTools, TOOL_NAMES } from "./tools.js";

interface RegisteredTool {
  name: string;
  options: {
    title?: string;
    description?: string;
    inputSchema?: Record<string, unknown>;
  };
  handler: (...args: unknown[]) => unknown;
}

class FakeMcpServer {
  readonly tools: RegisteredTool[] = [];

  registerTool(name: string, options: unknown, handler: unknown): void {
    this.tools.push({
      name,
      options: options as RegisteredTool["options"],
      handler: handler as RegisteredTool["handler"],
    });
  }

  byName(name: string): RegisteredTool {
    const tool = this.tools.find((t) => t.name === name);
    if (!tool) throw new Error(`tool not registered: ${name}`);
    return tool;
  }
}

const config = {
  publicKey: "pk-test",
  secretKey: "sk-test",
  baseUrl: "https://cloud.langfuse.com",
};

function setup(): { server: FakeMcpServer; getCalls: { url: string }[] } {
  const getCalls: { url: string }[] = [];
  const fakeFetch = vi.fn(async (input: URL | string) => {
    const url = typeof input === "string" ? input : input.toString();
    getCalls.push({ url });
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => "{}",
    } as Response;
  });
  vi.stubGlobal("fetch", fakeFetch);

  const server = new FakeMcpServer();
  const client = new LangfuseClient(config);
  registerTools(server as unknown as McpServer, client);
  return { server, getCalls };
}

describe("registerTools", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("registers all expected tools with no duplicates", () => {
    const { server } = setup();
    expect(server.tools.map((t) => t.name)).toEqual([...TOOL_NAMES]);
    const unique = new Set(server.tools.map((t) => t.name));
    expect(unique.size).toBe(server.tools.length);
  });

  it("every tool has a title, description, and an input schema", () => {
    const { server } = setup();
    for (const tool of server.tools) {
      expect(tool.options.title, `${tool.name} title`).toBeTruthy();
      expect(tool.options.description, `${tool.name} description`).toBeTruthy();
      expect(tool.options.inputSchema, `${tool.name} inputSchema`).toBeDefined();
    }
  });
});

describe("tool URL construction", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  const cases: Array<{
    tool: string;
    args: Record<string, unknown>;
    expectedPath: string;
    expectedQuery?: Record<string, string | string[]>;
  }> = [
    { tool: "listTraces", args: { userId: "u1" }, expectedPath: "/api/public/traces" },
    { tool: "getTrace", args: { traceId: "t/1" }, expectedPath: "/api/public/traces/t%2F1" },
    { tool: "listObservations", args: {}, expectedPath: "/api/public/observations" },
    {
      tool: "getObservation",
      args: { observationId: "o-1" },
      expectedPath: "/api/public/observations/o-1",
    },
    { tool: "listSessions", args: {}, expectedPath: "/api/public/sessions" },
    { tool: "getSession", args: { sessionId: "s 1" }, expectedPath: "/api/public/sessions/s%201" },
    { tool: "listScores", args: {}, expectedPath: "/api/public/scores" },
    { tool: "getScore", args: { scoreId: "sc1" }, expectedPath: "/api/public/scores/sc1" },
    { tool: "listScoreConfigs", args: {}, expectedPath: "/api/public/score-configs" },
    {
      tool: "getScoreConfig",
      args: { configId: "cfg1" },
      expectedPath: "/api/public/score-configs/cfg1",
    },
    { tool: "listPrompts", args: {}, expectedPath: "/api/public/v2/prompts" },
    {
      tool: "getPrompt",
      args: { promptName: "my prompt", label: "production" },
      expectedPath: "/api/public/v2/prompts/my%20prompt",
      expectedQuery: { label: "production" },
    },
    { tool: "listDatasets", args: {}, expectedPath: "/api/public/v2/datasets" },
    {
      tool: "getDataset",
      args: { datasetName: "ds1" },
      expectedPath: "/api/public/v2/datasets/ds1",
    },
    { tool: "listDatasetItems", args: {}, expectedPath: "/api/public/dataset-items" },
    {
      tool: "getDatasetItem",
      args: { itemId: "item1" },
      expectedPath: "/api/public/dataset-items/item1",
    },
    {
      tool: "listDatasetRuns",
      args: { datasetName: "ds1" },
      expectedPath: "/api/public/datasets/ds1/runs",
    },
    {
      tool: "getDatasetRun",
      args: { datasetName: "ds1", runName: "run1" },
      expectedPath: "/api/public/datasets/ds1/runs/run1",
    },
    {
      tool: "getMetrics",
      args: { query: '{"view":"traces"}' },
      expectedPath: "/api/public/metrics",
      expectedQuery: { query: '{"view":"traces"}' },
    },
    { tool: "getDailyMetrics", args: {}, expectedPath: "/api/public/metrics/daily" },
    { tool: "listModels", args: {}, expectedPath: "/api/public/models" },
    { tool: "getModel", args: { modelId: "gpt-4" }, expectedPath: "/api/public/models/gpt-4" },
    { tool: "listProjects", args: {}, expectedPath: "/api/public/projects" },
    { tool: "listComments", args: {}, expectedPath: "/api/public/comments" },
    {
      tool: "getComment",
      args: { commentId: "c1" },
      expectedPath: "/api/public/comments/c1",
    },
    { tool: "getMedia", args: { mediaId: "m1" }, expectedPath: "/api/public/media/m1" },
    { tool: "getHealth", args: {}, expectedPath: "/api/public/health" },
  ];

  for (const { tool, args, expectedPath, expectedQuery } of cases) {
    it(`${tool} hits ${expectedPath}`, async () => {
      const { server, getCalls } = setup();
      const handler = server.byName(tool).handler;
      await handler(args, undefined);

      expect(getCalls).toHaveLength(1);
      const url = new URL(getCalls[0]!.url);
      expect(url.pathname).toBe(expectedPath);

      if (expectedQuery) {
        for (const [key, value] of Object.entries(expectedQuery)) {
          if (Array.isArray(value)) {
            expect(url.searchParams.getAll(key)).toEqual(value);
          } else {
            expect(url.searchParams.get(key)).toBe(value);
          }
        }
      }
    });
  }

  it("listTraces forwards array tags as repeated params", async () => {
    const { server, getCalls } = setup();
    const handler = server.byName("listTraces").handler;
    await handler({ tags: ["a", "b"] }, undefined);

    const url = new URL(getCalls[0]!.url);
    expect(url.searchParams.getAll("tags")).toEqual(["a", "b"]);
  });

  it("listObservations rejects an invalid level via its zod schema", () => {
    const { server } = setup();
    const tool = server.byName("listObservations");
    const schema = tool.options.inputSchema as Record<
      string,
      { safeParse: (v: unknown) => { success: boolean } }
    >;
    expect(schema["level"]!.safeParse("bogus").success).toBe(false);
    expect(schema["level"]!.safeParse("ERROR").success).toBe(true);
  });

  it("paginationShape limit rejects values above 100", () => {
    const { server } = setup();
    const tool = server.byName("listTraces");
    const schema = tool.options.inputSchema as Record<
      string,
      { safeParse: (v: unknown) => { success: boolean } }
    >;
    expect(schema["limit"]!.safeParse(150).success).toBe(false);
    expect(schema["limit"]!.safeParse(50).success).toBe(true);
    expect(schema["limit"]!.safeParse(0).success).toBe(false);
  });

  it("getTrace requires a non-empty traceId", () => {
    const { server } = setup();
    const tool = server.byName("getTrace");
    const schema = tool.options.inputSchema as Record<
      string,
      { safeParse: (v: unknown) => { success: boolean } }
    >;
    expect(schema["traceId"]!.safeParse("").success).toBe(false);
    expect(schema["traceId"]!.safeParse("t1").success).toBe(true);
  });
});
