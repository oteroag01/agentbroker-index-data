# AgentBroker Index: datos abiertos

Qué brokers, bancos y exchanges cripto permiten que un agente de IA (ChatGPT, Claude, Grok, clientes MCP) consulte tu cuenta, prepare órdenes o las ejecute, y si cada proveedor está autorizado para operar con clientes en España. Cada registro enlaza a sus fuentes.

[English](README.md) · Web: https://agentbrokerindex.com/es/ · Licencia: [CC BY 4.0](LICENSE)

| | |
|---|---|
| Proveedores | 64 (40 con producto oficial para agentes de IA) |
| Autorizados en España | 38 (comprobado en los registros de la CNMV, el Banco de España y ESMA) |
| Registro MiCA provisional de ESMA | 373 CASP autorizados (revisado 2026-10-19) |
| Versión de los datos | 2026-10-19 (última revisión 2026-10-19) |

## Archivos
- `data/providers.json`: registros completos.
- `data/providers.csv`: los mismos registros, aplanados (UTF-8).
- `data/changelog.json`: lanzamientos y cambios con fecha y fuente.
- `datapackage.json`: descriptor Frictionless Data.

## Campos
| Campo | Significado |
|---|---|
| `id` | Slug estable; también la ruta /p/<id>/ |
| `name, type, hq` | Nombre, tipo, sede |
| `integration` | Vías oficiales para agentes |
| `official` | true si lo publica el propio proveedor |
| `capability` | Lo máximo que puede hacer el agente |
| `limits / limits_es` | Salvaguardas (aprobación por orden, límites, permisos) |
| `availability` | Disponibilidad en España / UE / EE. UU. |
| `licence` | Entidad, regulador, autorización en España (CNMV/BdE/ESMA), MiCA, CFD |
| `source_url, evidence_urls, source_http_status` | Fuentes primarias y su estado HTTP |
| `last_checked` | Fecha de la última revisión |
| `date_modified` | Fecha del último cambio real del contenido |
| `license` | CC-BY-4.0 |

## Método
- **Fuentes:** cada dato sale de la documentación, nota de prensa o condiciones del propio proveedor, o de un registro oficial.
- **Autorización:** se comprueba a mano en la CNMV, el Banco de España y ESMA. La fecha está en `licence.authorisation_checked`.
- **Revisión:** semanal. `date_modified` solo cambia cuando cambia el contenido.
- **CFD:** los proveedores de CFD están marcados (`licence.cfd`, `licence.cfd_only`). Los CFD son de alto riesgo; la mayoría de las cuentas minoristas pierden dinero con ellos.

**No es asesoramiento financiero.** Solo información. Ningún proveedor paga por aparecer y no hay enlaces de afiliado. Correcciones: abre un issue citando una fuente.

## Licencia y cita
Datos con licencia [CC BY 4.0](LICENSE): cita "AgentBroker Index (agentbrokerindex.com)", enlaza la licencia e indica si hiciste cambios.

```
AgentBroker Index (2026). Datos abiertos de AgentBroker Index: acceso de agentes de IA a brokers, bancos y exchanges cripto (versión 2026-10-19). https://agentbrokerindex.com/es/ . Licencia CC BY 4.0.
```
