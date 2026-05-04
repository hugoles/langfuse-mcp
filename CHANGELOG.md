# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2026-05-04

First public release on npm. Versions `1.0.0` and `1.1.0` were short-lived prototypes published on 2025-11-08 and unpublished the same day; their version numbers are permanently retired by npm policy. This release is the first stable, tested, documented version.

### Added

- 20 new read tools covering the rest of the Langfuse public API surface:
  - Scores: `getScore`, `listScoreConfigs`, `getScoreConfig`.
  - Prompts: `listPrompts`, `getPrompt` (with optional `version` / `label`).
  - Datasets: `listDatasets`, `getDataset`, `listDatasetItems`, `getDatasetItem`, `listDatasetRuns`, `getDatasetRun`.
  - Metrics: `getMetrics` (custom JSON queries), `getDailyMetrics`.
  - Models: `listModels`, `getModel`.
  - Misc: `listProjects`, `listComments`, `getComment`, `getMedia`, `getHealth`.
- README sections for Cursor, Cline, Continue, and Windsurf MCP client config.
- README "Try it" section with example prompts and a "Troubleshooting" section covering 401, npx cache staleness, region mismatch, self-hosted base URL, and Node version errors.
- Stderr startup line so MCP clients can confirm the server actually connected.
- `SECURITY.md`, `CODE_OF_CONDUCT.md`, GitHub issue/PR templates, Dependabot config, and a tag-triggered npm publish workflow with provenance.
- `smithery.yaml` for one-click install via [Smithery](https://smithery.ai).
- `examples/` directory with ready-to-paste MCP client snippets.

### Changed

- `LANGFUSE_BASE_URL` validation error now hints that a missing `https://` scheme is the most common cause.
- `tools.test.ts` now asserts URL construction and zod schema validation per tool, not just registration count.

## [0.1.0] - 2026-04-28

Pre-release tagged in git only (never published to npm).

### Added

- Initial TypeScript port of the project.
- MCP server over stdio that wraps the Langfuse REST API.
- Seven read tools: `listTraces`, `getTrace`, `listObservations`, `getObservation`, `listSessions`, `getSession`, `listScores`.
- Environment-based configuration with Zod validation.
- `--version` and `--help` CLI flags.
- Vitest test suite covering config, HTTP client, and tool registration.
- GitHub Actions CI for Node 20 and 22.

[Unreleased]: https://github.com/hugoles/langfuse-mcp/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/hugoles/langfuse-mcp/compare/v0.1.0...v1.2.0
[0.1.0]: https://github.com/hugoles/langfuse-mcp/releases/tag/v0.1.0
