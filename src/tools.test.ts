import { describe, it, expect } from "vitest";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LangfuseClient } from "./client.js";
import { registerTools, TOOL_NAMES } from "./tools.js";

class FakeMcpServer {
  readonly registered: string[] = [];

  registerTool(name: string, _options: unknown, _handler: unknown): void {
    this.registered.push(name);
  }
}

describe("registerTools", () => {
  it("registers exactly the expected 7 tools", () => {
    const fakeServer = new FakeMcpServer();
    const client = new LangfuseClient({
      publicKey: "pk",
      secretKey: "sk",
      baseUrl: "https://cloud.langfuse.com",
    });

    registerTools(fakeServer as unknown as McpServer, client);

    expect(fakeServer.registered).toEqual([...TOOL_NAMES]);
    expect(fakeServer.registered).toHaveLength(7);
  });
});
