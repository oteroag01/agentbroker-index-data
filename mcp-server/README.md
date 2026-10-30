# AgentBroker Index MCP server

Free, read-only [MCP](https://modelcontextprotocol.io/) server over the AgentBroker Index dataset in this repo.

- **Endpoint:** `https://mcp.agentbrokerindex.com/mcp` (Streamable HTTP, stateless, JSON responses, no auth)
- **Official MCP Registry:** `com.agentbrokerindex/agentbroker-index`
- **Tools** (all read-only):
  - `search_providers`: filter by text, type, capability, assistant, asset, authorised in Spain, official only
  - `get_provider`: one full record by id, name or alias
  - `compare_providers`: 2–4 providers side by side. This is not a ranking.
  - `list_changes`: dated changelog entries, each with its source
  - `dataset_info`: counts, last check date, licence

The server can't place orders or touch any account. It stores no requests and has no affiliate links. Every response carries the sources, the check dates, a "not financial advice" notice and the CC BY 4.0 credit.

## Add it to a client
Add a remote MCP server or custom connector with the URL `https://mcp.agentbrokerindex.com/mcp`, for example in Claude, ChatGPT developer mode or Cursor.

## Run it yourself
It's a plain Cloudflare Worker with no dependencies:

    npx wrangler dev --local --port 8787            # reads the live dataset from DATA_BASE
    node test/smoke.mjs http://localhost:8787       # 13 protocol and compliance checks

The code is MIT-licensed ([LICENSE](LICENSE)). The data is CC BY 4.0 (see the repo root).
