# AgentBroker Index: open dataset

Which brokers, banks and crypto exchanges let an AI agent (ChatGPT, Claude, Grok, MCP clients) read your account, draft orders or place orders, and whether each one is authorised to serve customers in Spain. Each record links to its sources.

[Español](README.es.md) · Website: https://agentbrokerindex.com/ · Licence: [CC BY 4.0](LICENSE)

| | |
|---|---|
| Providers | 68 (43 with an official AI-agent product) |
| Capability | place_orders 40, none 21, read_only 5, draft_orders 2 |
| Authorised to serve Spain | 38 (checked against CNMV, Banco de España and ESMA registers) |
| ESMA interim MiCA register | 373 authorised CASPs (checked 2026-10-19) |
| Data version | 2026-10-20 (records last re-checked 2026-10-20) |

## Files
- `data/providers.json`: full records (nested licence object).
- `data/providers.csv`: the same records, flattened (UTF-8, lists joined with `;` or `|`).
- `data/changelog.json`: dated launches and changes, each with a source.
- `datapackage.json`: Frictionless Data descriptor.

## Fields
| Field | Meaning |
|---|---|
| `id` | Stable slug, also the page path /p/<id>/ |
| `name, type, hq` | Provider name, kind (broker, bank, crypto_exchange…), headquarters |
| `integration` | Official agent surfaces: mcp_hosted, mcp_local, chatgpt_app, claude_connector, api, cli, skill, none |
| `official` | true if the provider itself ships it |
| `capability` | Most the agent can do: none, read_only, draft_orders, place_orders |
| `limits / limits_es` | Guardrails (approval per order, caps, scopes) |
| `availability` | spain / eu / us / ar (Argentina) / mx (Mexico): yes, account_only, no, unknown |
| `licence.latam` | ar / mx local registration: status (cnv_agent, cnv_psav = CNV virtual-asset registration, not a licence; cnbv_casa_de_bolsa, crypto_not_cnbv = crypto platform, no CNBV/Banxico financial authorisation found; unknown), entity, register_no, register_url, note_en/es, source, checked |
| `licence` | Legal entity, regulator, es_status, es_authorised, register_url, mica_status, cfd, cfd_only, leveraged, authorisation_checked |
| `source_url, evidence_urls, source_http_status` | Primary sources and their HTTP status at last check |
| `last_checked` | Date the record was last re-checked |
| `date_modified` | Date the record's content last changed (not just re-checked) |
| `license` | CC-BY-4.0 |

## Method
- **Sources:** every fact comes from the provider's own docs, press release or terms, or from an official register. Third-party sources are named in `notes`.
- **Licence status:** checked by hand against the CNMV, Banco de España and ESMA registers. The date is in `licence.authorisation_checked`.
- **Updates:** records are re-checked weekly. `date_modified` changes only when the content changes, which a content fingerprint detects.
- **CFD providers** are flagged (`licence.cfd`, `licence.cfd_only`). CFDs are high risk; most retail accounts lose money with them.

**Not financial advice.** This is information only. No provider pays to be listed, and there are no affiliate links. Corrections: open an issue, citing a source.

## Licence and citation
Data: [CC BY 4.0](LICENSE). Credit "AgentBroker Index (agentbrokerindex.com)", link to the licence and say if you changed anything. Provider names and trademarks belong to their owners.

```
AgentBroker Index (2026). AgentBroker Index dataset: AI-agent access to brokers, banks and crypto exchanges (version 2026-10-20). https://agentbrokerindex.com/ . Licensed CC BY 4.0.
```
See also [CITATION.cff](CITATION.cff). The canonical, live version is https://agentbrokerindex.com/data/providers.json.
