#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { LangfuseClient } from "./client.js";
import { loadConfig } from "./config.js";
import { registerTools } from "./tools.js";

const PACKAGE_NAME = "langfuse-mcp";

function readVersion(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const pkgPath = resolve(here, "..", "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version?: string };
  return pkg.version ?? "0.0.0";
}

function printHelp(version: string): void {
  process.stdout.write(
    `${PACKAGE_NAME} v${version}

MCP server exposing the Langfuse REST API as tools.

Usage:
  ${PACKAGE_NAME}              Run the server over stdio (for MCP clients).
  ${PACKAGE_NAME} --version    Print the version and exit.
  ${PACKAGE_NAME} --help       Print this message and exit.

Configuration (environment variables):
  LANGFUSE_PUBLIC_KEY    Required. Project public key.
  LANGFUSE_SECRET_KEY    Required. Project secret key.
  LANGFUSE_BASE_URL      Required. e.g. https://cloud.langfuse.com
  LANGFUSE_ENV_FILE      Optional. Path to a .env file to load instead of ./.env

Docs: https://github.com/hugoles/langfuse-mcp
`,
  );
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--version") || args.includes("-v")) {
    process.stdout.write(`${readVersion()}\n`);
    return;
  }

  if (args.includes("--help") || args.includes("-h")) {
    printHelp(readVersion());
    return;
  }

  const config = loadConfig();
  const client = new LangfuseClient(config);
  const version = readVersion();
  const server = new McpServer({ name: PACKAGE_NAME, version });
  registerTools(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  process.stderr.write(`${PACKAGE_NAME} v${version} connected (base=${config.baseUrl})\n`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${PACKAGE_NAME}: ${message}\n`);
  process.exit(1);
});
