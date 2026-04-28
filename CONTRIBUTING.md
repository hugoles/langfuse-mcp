# Contributing

Thanks for considering a contribution. This project is small on purpose; the goal is to keep it a clean, focused MCP wrapper around the Langfuse REST API.

## Development setup

```bash
git clone https://github.com/hugoles/langfuse-mcp.git
cd langfuse-mcp
npm install
cp .env.example .env   # fill in your Langfuse keys
npm run dev            # runs src/index.ts via tsx
```

## Local checks

Before opening a pull request, the same gates that run in CI must pass locally:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run build
npm test
```

`npm run format` rewrites files with Prettier if `format:check` fails.

## Commit style

Use [Conventional Commits](https://www.conventionalcommits.org/). Common prefixes:

- `feat:` user-visible feature
- `fix:` bug fix
- `docs:` documentation only
- `chore:` tooling / build / dependency changes
- `test:` test-only changes
- `refactor:` code change that is neither a feature nor a fix

## Adding a new tool

1. Add the tool registration in [`src/tools.ts`](src/tools.ts) using the existing tools as a reference. Reuse the shared shapes from [`src/schemas.ts`](src/schemas.ts) where possible.
2. Append the tool name to the `TOOL_NAMES` array in `src/tools.ts`.
3. Update the tools table in [`README.md`](README.md).
4. Add a line to [`CHANGELOG.md`](CHANGELOG.md) under the next unreleased version.
5. The existing `tools.test.ts` will catch the new name automatically.

## Reporting issues

Please include:

- Your Node.js version (`node --version`).
- Your Langfuse deployment (cloud EU / cloud US / self-hosted).
- The exact tool call and the error message (with secrets redacted).
