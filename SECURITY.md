# Security Policy

## Supported Versions

Only the latest minor release receives security fixes.

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |
| older   | :x:                |

## Reporting a Vulnerability

**Please do not open public issues for security problems.**

Report vulnerabilities privately by either:

1. **GitHub Security Advisories** (preferred): use the **"Report a vulnerability"** button at <https://github.com/hugoles/langfuse-mcp/security/advisories/new>. This creates a private channel between you and the maintainers.
2. **Email:** open a placeholder issue asking for a private contact, or reach the maintainer through GitHub profile contact details. Avoid including reproduction details until a private channel is established.

When reporting, please include:

- A description of the issue and its impact.
- Steps to reproduce or a proof-of-concept.
- Affected versions, if known.
- Any suggested mitigations.

You should expect:

- Acknowledgement within **3 business days**.
- A status update within **7 business days**.
- Coordinated disclosure once a fix is available, with credit (unless you ask to remain anonymous).

## Scope

This MCP server reads Langfuse credentials from environment variables and forwards authenticated requests to the Langfuse REST API. Particular concerns we take seriously:

- Credential leakage (logging, error messages, stdout/stderr).
- Path traversal or URL injection in tool arguments that reach `LangfuseClient.get`.
- Dependency-chain vulnerabilities in `@modelcontextprotocol/sdk`, `dotenv`, or `zod`.

Out of scope:

- Vulnerabilities in the Langfuse server itself — please report those at <https://github.com/langfuse/langfuse/security>.
