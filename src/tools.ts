import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { LangfuseClient } from "./client.js";
import { paginationShape, timeRangeShape } from "./schemas.js";

const asJson = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
});

export function registerTools(server: McpServer, client: LangfuseClient): void {
  server.registerTool(
    "listTraces",
    {
      title: "List traces",
      description:
        "List Langfuse traces with filters. Returns summary metadata (use getTrace for the full observation tree).",
      inputSchema: {
        ...paginationShape,
        ...timeRangeShape,
        userId: z.string().optional(),
        sessionId: z.string().optional(),
        name: z.string().optional().describe("Exact trace name match"),
        environment: z.string().optional(),
        tags: z.array(z.string()).optional(),
        orderBy: z.string().optional().describe("e.g. 'timestamp.desc' (default)"),
      },
    },
    async (args) => asJson(await client.get("/api/public/traces", args)),
  );

  server.registerTool(
    "getTrace",
    {
      title: "Get trace with full observation tree",
      description: "Fetch a single trace by id including all nested observations.",
      inputSchema: { traceId: z.string().min(1) },
    },
    async ({ traceId }) =>
      asJson(await client.get(`/api/public/traces/${encodeURIComponent(traceId)}`)),
  );

  server.registerTool(
    "listObservations",
    {
      title: "List observations",
      description: "List observations (spans, generations, events) with filters.",
      inputSchema: {
        ...paginationShape,
        traceId: z.string().optional(),
        name: z.string().optional(),
        userId: z.string().optional(),
        type: z.enum(["SPAN", "GENERATION", "EVENT"]).optional(),
        level: z.enum(["DEBUG", "DEFAULT", "WARNING", "ERROR"]).optional(),
        parentObservationId: z.string().optional(),
        fromStartTime: z.string().datetime().optional(),
        toStartTime: z.string().datetime().optional(),
        environment: z.string().optional(),
      },
    },
    async (args) => asJson(await client.get("/api/public/observations", args)),
  );

  server.registerTool(
    "getObservation",
    {
      title: "Get observation by id",
      description: "Fetch a single observation by id.",
      inputSchema: { observationId: z.string().min(1) },
    },
    async ({ observationId }) =>
      asJson(await client.get(`/api/public/observations/${encodeURIComponent(observationId)}`)),
  );

  server.registerTool(
    "listSessions",
    {
      title: "List sessions",
      description: "List sessions within a time range.",
      inputSchema: {
        ...paginationShape,
        ...timeRangeShape,
        environment: z.string().optional(),
      },
    },
    async (args) => asJson(await client.get("/api/public/sessions", args)),
  );

  server.registerTool(
    "getSession",
    {
      title: "Get session with its traces",
      description: "Fetch a session by id, including its traces.",
      inputSchema: { sessionId: z.string().min(1) },
    },
    async ({ sessionId }) =>
      asJson(await client.get(`/api/public/sessions/${encodeURIComponent(sessionId)}`)),
  );

  server.registerTool(
    "listScores",
    {
      title: "List scores",
      description: "List scores with filters.",
      inputSchema: {
        ...paginationShape,
        userId: z.string().optional(),
        name: z.string().optional(),
        traceId: z.string().optional(),
        fromTimestamp: z.string().datetime().optional(),
        toTimestamp: z.string().datetime().optional(),
      },
    },
    async (args) => asJson(await client.get("/api/public/scores", args)),
  );
}

export const TOOL_NAMES = [
  "listTraces",
  "getTrace",
  "listObservations",
  "getObservation",
  "listSessions",
  "getSession",
  "listScores",
] as const;
