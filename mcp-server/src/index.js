/**
 * AgentBroker Index MCP server: read-only, stateless, Streamable HTTP (JSON responses), no auth, no storage.
 * Data: the public CC BY 4.0 dataset (providers.json, changelog.json) fetched from DATA_BASE and edge-cached 1 h.
 * Logs nothing about callers. Information only, not financial advice. Never returns affiliate or referral links.
 */
const VERSION = "0.1.0";
const PROTOCOLS = ["2025-11-25", "2025-06-18", "2025-03-26"];
const CAPS = ["place_orders", "draft_orders", "read_only", "none"];
const TYPES = ["broker", "bank", "neobank", "robo_advisor", "crypto_exchange", "wallet", "platform", "aggregator"];
const ASSETS = ["stocks", "etfs", "funds", "pension_plans", "bonds", "options", "futures", "crypto_spot", "perps", "cfds", "tokenized", "fx", "commodities", "cash_savings"];
const ATTRIBUTION = "Data: AgentBroker Index (agentbrokerindex.com), CC BY 4.0. Credit the source when you reuse it.";
const DISCLAIMER = {
  en: "Information only, not financial advice. AI agents make mistakes; investing involves risk of loss. Check the provider is authorised in your country and confirm features on its own site.",
  es: "Solo información; no es asesoramiento financiero. Los agentes de IA se equivocan e invertir conlleva riesgo de pérdidas. Comprueba que la entidad está autorizada en tu país y confirma las funciones en su web.",
};
const CFD_NOTE = {
  en: "This provider offers CFDs. CFDs are complex, leveraged instruments with a high risk of losing money rapidly; most retail accounts lose money. AgentBroker Index does not promote CFD trading.",
  es: "Esta entidad ofrece CFD. Los CFD son instrumentos complejos y apalancados con un alto riesgo de perder dinero rápidamente; la mayoría de las cuentas minoristas pierden dinero. AgentBroker Index no promociona los CFD.",
};
const CRYPTO_NOTE = {
  en: "Crypto-assets are highly volatile; you may lose all the money you invest.",
  es: "Los criptoactivos son muy volátiles; puedes perder todo el dinero invertido.",
};

const L = (lang) => (lang === "es" ? "es" : "en");
const pageUrl = (base, id, lang) => `${base}${L(lang) === "es" ? "/es" : ""}/p/${id}/`;
const pick = (p, k, lang) => (L(lang) === "es" ? p[k + "_es"] || p[k] : p[k]);

const TOOLS = [
  {
    name: "search_providers",
    title: "Search brokers, banks and crypto exchanges by AI-agent access",
    description: "Find providers in the AgentBroker Index by name, type, what an AI agent can do there (place orders, draft orders, read only, none), supported assistant (ChatGPT, Claude, Grok, any MCP client…), asset the agent can trade, and Spain availability/licence. Returns sourced, dated summaries. Read-only; information, not advice.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free text matched against name, id and aliases, e.g. 'degiro', 'ibkr'." },
        type: { type: "string", enum: TYPES },
        capability: { type: "string", enum: CAPS, description: "What the agent can do." },
        assistant: { type: "string", description: "e.g. 'ChatGPT', 'Claude', 'Grok', 'MCP'." },
        asset: { type: "string", enum: ASSETS, description: "Asset the agent can trade (documented officially)." },
        authorised_in_spain: { type: "boolean", description: "Only providers authorised to serve Spain (CNMV / Banco de España / ESMA MiCA registers)." },
        agent_access_in_spain: { type: "boolean", description: "Exclude providers whose agent feature is documented as not available in Spain (keeps 'available' and 'operates in Spain, agent feature unconfirmed')." },
        official_only: { type: "boolean", description: "Only official, first-party agent integrations." },
        lang: { type: "string", enum: ["en", "es"], default: "en" },
        limit: { type: "integer", minimum: 1, maximum: 25, default: 10 },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false, idempotentHint: true },
  },
  {
    name: "get_provider",
    title: "Get one provider's full, sourced entry",
    description: "Full AgentBroker Index entry for one provider: integrations (hosted/local MCP, ChatGPT app, Claude connector, API, CLI, skill), supported assistants, what the agent can do, documented limits and approvals, availability by market, legal entity and licence status in Spain, assets, source URLs and check dates.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string", description: "Provider id or name, e.g. 'interactive-brokers', 'Scalable Capital', 'bit2me'." }, lang: { type: "string", enum: ["en", "es"], default: "en" } },
      required: ["id"], additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false, idempotentHint: true },
  },
  {
    name: "compare_providers",
    title: "Compare 2 to 4 providers side by side",
    description: "Side-by-side comparison of AI-agent access for 2-4 providers: capability, integrations, assistants, limits, Spain availability and licence, sources. Order follows your input; this is not a ranking.",
    inputSchema: {
      type: "object",
      properties: { ids: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 }, lang: { type: "string", enum: ["en", "es"], default: "en" } },
      required: ["ids"], additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false, idempotentHint: true },
  },
  {
    name: "list_changes",
    title: "Recent launches and changes in AI-agent access",
    description: "Dated changelog of launches and changes (new MCP servers, connectors, permission changes), each with its source URL. Filter by date or provider.",
    inputSchema: {
      type: "object",
      properties: {
        since: { type: "string", description: "YYYY-MM-DD; only entries on or after this date." },
        provider: { type: "string", description: "Provider id or name." },
        lang: { type: "string", enum: ["en", "es"], default: "en" },
        limit: { type: "integer", minimum: 1, maximum: 50, default: 15 },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false, idempotentHint: true },
  },
  {
    name: "dataset_info",
    title: "About the dataset",
    description: "Counts, last full check date, licence (CC BY 4.0), attribution text, download links and methodology page.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false, idempotentHint: true },
  },
];

async function loadData(env, ctx) {
  const base = (env && env.DATA_BASE) || "https://agentbrokerindex.com";
  const get = async (path) => {
    const r = await fetch(base + path, { cf: { cacheTtl: 3600, cacheEverything: true }, headers: { "user-agent": "agentbroker-index-mcp/" + VERSION } });
    if (!r.ok) throw new Error(`dataset fetch failed: ${path} HTTP ${r.status}`);
    return r.json();
  };
  const [providers, changelog] = await Promise.all([get("/data/providers.json"), get("/data/changelog.json")]);
  return { base, providers, changelog };
}

function findProvider(P, q) {
  const s = String(q || "").trim().toLowerCase();
  if (!s) return null;
  return P.find((p) => p.id === s) || P.find((p) => p.name.toLowerCase() === s) ||
    P.find((p) => (p.aliases || []).map((a) => a.toLowerCase()).includes(s)) ||
    P.find((p) => p.id.includes(s.replace(/\s+/g, "-")) || p.name.toLowerCase().includes(s)) || null;
}

function notesFor(p, lang) {
  const n = [];
  if (p.licence && p.licence.cfd) n.push(CFD_NOTE[L(lang)]);
  if (p.type === "crypto_exchange" || p.type === "wallet") n.push(CRYPTO_NOTE[L(lang)]);
  return n;
}

function summary(p, D, lang) {
  return {
    id: p.id, name: p.name, type: p.type, hq: p.hq,
    agent_can: p.capability, official: p.official, integrations: p.integration, assistants: p.assistants,
    availability: p.availability, authorised_in_spain: p.licence.es_authorised, legal_entity: p.licence.legal_entity, regulator: p.licence.regulator,
    limits: pick(p, "limits", lang), last_checked: p.last_checked, source_url: p.source_url, page_url: pageUrl(D.base, p.id, lang),
    risk_notes: notesFor(p, lang),
  };
}

function full(p, D, lang) {
  const { affiliate_url, aliases, ...rest } = p;   // never expose affiliate fields
  return { ...rest, limits: pick(p, "limits", lang), notes: pick(p, "notes", lang), page_url: pageUrl(D.base, p.id, lang), risk_notes: notesFor(p, lang) };
}

const hasAssistant = (p, a) => {
  const s = a.toLowerCase();
  if (s === "mcp" || s.includes("mcp client")) return p.integration.some((i) => i.startsWith("mcp_")) || p.assistants.some((x) => /mcp/i.test(x));
  return p.assistants.some((x) => x.toLowerCase() === s || x.toLowerCase().startsWith(s + " ")) ||
    (s === "chatgpt" && p.integration.includes("chatgpt_app")) || (s === "claude" && p.integration.includes("claude_connector"));
};
const CAPRANK = (c) => CAPS.indexOf(c);

const TOOL_IMPL = {
  search_providers(a, D) {
    let ps = D.providers.slice();
    if (a.query) { const s = a.query.toLowerCase(); ps = ps.filter((p) => p.id.includes(s.replace(/\s+/g, "-")) || p.name.toLowerCase().includes(s) || (p.aliases || []).some((x) => x.toLowerCase().includes(s))); }
    if (a.type) ps = ps.filter((p) => p.type === a.type);
    if (a.capability) ps = ps.filter((p) => p.capability === a.capability);
    if (a.assistant) ps = ps.filter((p) => hasAssistant(p, a.assistant));
    if (a.asset) ps = ps.filter((p) => p.assets && p.assets[a.asset] && p.assets[a.asset].agent === "trade");
    if (a.authorised_in_spain) ps = ps.filter((p) => p.licence.es_authorised === "yes");
    if (a.agent_access_in_spain) ps = ps.filter((p) => ["yes", "account_only"].includes(p.availability.spain));
    if (a.official_only) ps = ps.filter((p) => p.official);
    ps.sort((x, y) => CAPRANK(x.capability) - CAPRANK(y.capability) || x.name.localeCompare(y.name));
    const limit = Math.min(Math.max(a.limit || 10, 1), 25);
    return { total_matches: ps.length, results: ps.slice(0, limit).map((p) => summary(p, D, a.lang)), sort: "by what the agent can do, then name (not a ranking)", attribution: ATTRIBUTION, disclaimer: DISCLAIMER[L(a.lang)] };
  },
  get_provider(a, D) {
    const p = findProvider(D.providers, a.id);
    if (!p) return { error: `No provider matches '${a.id}'. Try search_providers.`, attribution: ATTRIBUTION };
    return { provider: full(p, D, a.lang), attribution: ATTRIBUTION, disclaimer: DISCLAIMER[L(a.lang)] };
  },
  compare_providers(a, D) {
    const ids = (a.ids || []).slice(0, 4);
    if (ids.length < 2) return { error: "Pass 2 to 4 provider ids or names." };
    const found = ids.map((i) => ({ q: i, p: findProvider(D.providers, i) }));
    const missing = found.filter((x) => !x.p).map((x) => x.q);
    return { compared: found.filter((x) => x.p).map((x) => summary(x.p, D, a.lang)), not_found: missing, note: "Order follows your input; this is not a ranking.", attribution: ATTRIBUTION, disclaimer: DISCLAIMER[L(a.lang)] };
  },
  list_changes(a, D) {
    let cl = D.changelog.slice().sort((x, y) => (x.date < y.date ? 1 : -1));
    if (a.since) cl = cl.filter((c) => c.date >= a.since);
    if (a.provider) { const p = findProvider(D.providers, a.provider); cl = p ? cl.filter((c) => c.provider_id === p.id) : []; }
    const limit = Math.min(Math.max(a.limit || 15, 1), 50);
    return { total: cl.length, changes: cl.slice(0, limit).map((c) => ({ date: c.date, provider_id: c.provider_id, title: L(a.lang) === "es" ? c.title_es : c.title_en, source_url: c.source_url })), attribution: ATTRIBUTION };
  },
  dataset_info(a, D) {
    const P = D.providers;
    const count = (f) => P.filter(f).length;
    return {
      providers: P.length, changelog_entries: D.changelog.length,
      by_capability: Object.fromEntries(CAPS.map((c) => [c, count((p) => p.capability === c)])),
      authorised_in_spain: count((p) => p.licence.es_authorised === "yes"),
      last_full_check: P.reduce((m, p) => (p.last_checked < m ? p.last_checked : m), "9999-12-31"),
      licence: "CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)", attribution: ATTRIBUTION,
      downloads: [D.base + "/data/providers.json", D.base + "/data/providers.csv", D.base + "/data/changelog.json"],
      methodology: D.base + "/about/", repository: "https://github.com/oteroag01/agentbroker-index-data",
      disclaimer: DISCLAIMER.en,
    };
  },
};

const rpcResult = (id, result) => ({ jsonrpc: "2.0", id, result });
const rpcError = (id, code, message) => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type, mcp-protocol-version, mcp-session-id, accept", "access-control-allow-methods": "POST, GET, OPTIONS", "access-control-expose-headers": "mcp-protocol-version" };
const json = (obj, status = 200, extra = {}) => new Response(obj === null ? null : JSON.stringify(obj), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...CORS, ...extra } });

async function handleRpc(msg, env, ctx, state) {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") return rpcError(msg && msg.id, -32600, "Invalid Request");
  const isNotification = msg.id === undefined || msg.id === null;
  switch (msg.method) {
    case "initialize": {
      const asked = msg.params && msg.params.protocolVersion;
      const v = PROTOCOLS.includes(asked) ? asked : PROTOCOLS[0];
      return rpcResult(msg.id, {
        protocolVersion: v,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "agentbroker-index", title: "AgentBroker Index", version: VERSION, websiteUrl: "https://agentbrokerindex.com/" },
        instructions: "Read-only data on which brokers, banks and crypto exchanges let AI agents connect (MCP, ChatGPT, Claude…) and what they can do, with sources, check dates and licence status in Spain. Always pass on the source URL, check date and disclaimer. Not financial advice; never present results as a recommendation or ranking.",
      });
    }
    case "notifications/initialized": case "notifications/cancelled": return null;
    case "ping": return rpcResult(msg.id, {});
    case "tools/list": return rpcResult(msg.id, { tools: TOOLS });
    case "tools/call": {
      const name = msg.params && msg.params.name; const args = (msg.params && msg.params.arguments) || {};
      if (!TOOL_IMPL[name]) return rpcError(msg.id, -32602, `Unknown tool: ${name}`);
      try {
        state.data = state.data || (await loadData(env, ctx));
        const out = TOOL_IMPL[name](args, state.data);
        return rpcResult(msg.id, { content: [{ type: "text", text: JSON.stringify(out, null, 1) }], structuredContent: out, isError: Boolean(out.error) });
      } catch (e) {
        return rpcResult(msg.id, { content: [{ type: "text", text: "Dataset temporarily unavailable: " + e.message }], isError: true });
      }
    }
    default: return isNotification ? null : rpcError(msg.id, -32601, `Method not found: ${msg.method}`);
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (url.pathname === "/" && request.method === "GET")
      return json({ name: "AgentBroker Index MCP server", version: VERSION, endpoint: url.origin + "/mcp", transport: "streamable-http (stateless, JSON responses)", tools: TOOLS.map((t) => t.name), read_only: true, auth: "none", attribution: ATTRIBUTION, disclaimer: DISCLAIMER.en, website: "https://agentbrokerindex.com/" });
    if (url.pathname !== "/mcp") return json({ error: "Not found. MCP endpoint: /mcp" }, 404);
    if (request.method === "GET" || request.method === "DELETE") return json(null, 405, { allow: "POST, OPTIONS" });   // no SSE stream, no sessions
    if (request.method !== "POST") return json(null, 405, { allow: "POST, OPTIONS" });
    const len = Number(request.headers.get("content-length") || 0);
    if (len > 65536) return json(rpcError(null, -32600, "Request too large"), 413);
    let body;
    try { body = await request.json(); } catch { return json(rpcError(null, -32700, "Parse error"), 400); }
    const state = {};
    if (Array.isArray(body)) {
      if (body.length === 0 || body.length > 20) return json(rpcError(null, -32600, "Invalid batch"), 400);
      const out = (await Promise.all(body.map((m) => handleRpc(m, env, ctx, state)))).filter(Boolean);
      return out.length ? json(out) : new Response(null, { status: 202, headers: CORS });
    }
    const out = await handleRpc(body, env, ctx, state);
    return out ? json(out) : new Response(null, { status: 202, headers: CORS });
  },
};
