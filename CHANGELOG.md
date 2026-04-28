# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-04-28

### Added

- Initial release.
- MCP server over stdio that wraps the Langfuse REST API.
- Seven read tools: `listTraces`, `getTrace`, `listObservations`, `getObservation`, `listSessions`, `getSession`, `listScores`.
- Environment-based configuration with Zod validation.
- `--version` and `--help` CLI flags.
- Vitest test suite covering config, HTTP client, and tool registration.
- GitHub Actions CI for Node 20 and 22.

[0.1.0]: https://github.com/hugoles/langfuse-mcp/releases/tag/v0.1.0
