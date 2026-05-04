# Examples

Ready-to-paste MCP client config snippets and example prompts.

## Client config snippets

Each file is a minimal, working config for one MCP client. Copy the contents into the matching file on your machine and replace the `pk-lf-…` / `sk-lf-…` placeholders with your real Langfuse keys.

| File                             | Where it goes                                                                                                                     |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `claude_desktop_config.json`     | macOS: `~/Library/Application Support/Claude/claude_desktop_config.json` · Windows: `%APPDATA%\Claude\claude_desktop_config.json` |
| `mcp.json` (project Claude Code) | `./.mcp.json` in your project root                                                                                                |
| `cursor.mcp.json`                | `.cursor/mcp.json` in your project root, or `~/.cursor/mcp.json`                                                                  |
| `continue.config.json`           | `~/.continue/config.json` (`mcpServers` array)                                                                                    |
| `cline.settings.json`            | VS Code `settings.json` (`cline.mcpServers` key)                                                                                  |

## Example prompts

Once wired up, try asking your assistant:

1. "Use the `getHealth` tool to confirm langfuse-mcp is connected."
2. "List the 5 most recent traces with `level=ERROR`."
3. "Show me trace `abc123` with all its observations and tell me where it failed."
4. "What scores did user `alice@example.com` receive this week?"
5. "Get the production version of prompt `customer-support`."
6. "List dataset runs for `eval-2026-q1` and tell me which had the highest accuracy score."
7. "Use `getDailyMetrics` to summarize today's generation cost broken down by model."
