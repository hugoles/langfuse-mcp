# langfuse-mcp

[![npm version](https://img.shields.io/npm/v/langfuse-mcp.svg)](https://www.npmjs.com/package/langfuse-mcp)
[![CI](https://github.com/hugoles/langfuse-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/hugoles/langfuse-mcp/actions/workflows/ci.yml)
[![Node](https://img.shields.io/node/v/langfuse-mcp.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An [MCP](https://modelcontextprotocol.io) server that exposes the [Langfuse](https://langfuse.com) REST API as tools, so Claude (or any MCP client) can query your traces, observations, sessions, and scores during a conversation.

Useful when you want to ask things like _"what happened in the last failing trace for user X?"_ or _"summarize today's generation errors"_ without leaving your assistant.

## Tools

| Tool               | Description                                                     | Key arguments                                                                                                                       |
| ------------------ | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `listTraces`       | List traces with filters. Returns summary metadata.             | `userId`, `sessionId`, `name`, `tags`, `environment`, `fromTimestamp`, `toTimestamp`, `orderBy`, `page`, `limit`                    |
| `getTrace`         | Fetch a single trace by id including the full observation tree. | `traceId`                                                                                                                           |
| `listObservations` | List spans, generations, and events with filters.               | `traceId`, `type`, `level`, `parentObservationId`, `userId`, `name`, `fromStartTime`, `toStartTime`, `environment`, `page`, `limit` |
| `getObservation`   | Fetch a single observation by id.                               | `observationId`                                                                                                                     |
| `listSessions`     | List sessions within a time range.                              | `fromTimestamp`, `toTimestamp`, `environment`, `page`, `limit`                                                                      |
| `getSession`       | Fetch a session by id, including its traces.                    | `sessionId`                                                                                                                         |
| `listScores`       | List scores with filters.                                       | `userId`, `name`, `traceId`, `fromTimestamp`, `toTimestamp`, `page`, `limit`                                                        |

All tools call the [Langfuse Public API](https://api.reference.langfuse.com) over HTTPS using your project keys for Basic Auth.

## Install

Zero install with `npx`:

```bash
npx -y langfuse-mcp
```

Or install globally:

```bash
npm i -g langfuse-mcp
langfuse-mcp --version
```

## Configuration

The server reads three environment variables:

| Variable              | Required | Description                                                                                             |
| --------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `LANGFUSE_PUBLIC_KEY` | yes      | Project public key (`pk-lf-…`).                                                                         |
| `LANGFUSE_SECRET_KEY` | yes      | Project secret key (`sk-lf-…`).                                                                         |
| `LANGFUSE_BASE_URL`   | yes      | e.g. `https://cloud.langfuse.com` (EU) or `https://us.cloud.langfuse.com` (US) or your self-hosted URL. |
| `LANGFUSE_ENV_FILE`   | no       | Optional path to a `.env` file to load instead of `./.env`.                                             |

If a `.env` file exists in the working directory it will be loaded automatically. See [`.env.example`](.env.example) for a starter file.

## Use with Claude Desktop

Add the server to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "langfuse": {
      "command": "npx",
      "args": ["-y", "langfuse-mcp"],
      "env": {
        "LANGFUSE_PUBLIC_KEY": "pk-lf-…",
        "LANGFUSE_SECRET_KEY": "sk-lf-…",
        "LANGFUSE_BASE_URL": "https://cloud.langfuse.com"
      }
    }
  }
}
```

## Use with Claude Code

Project-level (`./.mcp.json`):

```json
{
  "mcpServers": {
    "langfuse": {
      "command": "npx",
      "args": ["-y", "langfuse-mcp"],
      "env": {
        "LANGFUSE_PUBLIC_KEY": "pk-lf-…",
        "LANGFUSE_SECRET_KEY": "sk-lf-…",
        "LANGFUSE_BASE_URL": "https://cloud.langfuse.com"
      }
    }
  }
}
```

User-level config lives at `~/.claude.json` and uses the same shape.

## Use with other MCP clients

The server speaks MCP over stdio. Any MCP client can launch it as a subprocess:

```bash
LANGFUSE_PUBLIC_KEY=pk-lf-… \
LANGFUSE_SECRET_KEY=sk-lf-… \
LANGFUSE_BASE_URL=https://cloud.langfuse.com \
npx -y langfuse-mcp
```

## Development

```bash
git clone https://github.com/hugoles/langfuse-mcp.git
cd langfuse-mcp
npm install
cp .env.example .env       # fill in real keys
npm run dev                # tsx src/index.ts (no build step)
```

Other scripts:

| Script                                    | What it does                   |
| ----------------------------------------- | ------------------------------ |
| `npm run build`                           | Compile TypeScript to `dist/`. |
| `npm start`                               | Run the built server.          |
| `npm run typecheck`                       | `tsc --noEmit`.                |
| `npm run lint`                            | ESLint.                        |
| `npm run format` / `npm run format:check` | Prettier write / check.        |
| `npm test`                                | Vitest.                        |

## Roadmap

Possible future tools — open an issue if you want one of these (or another):

- Prompt management (`listPrompts`, `getPrompt`).
- Datasets and dataset items.
- Aggregated metrics endpoints.
- Score creation (write tools, opt-in).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © Hugoles.
