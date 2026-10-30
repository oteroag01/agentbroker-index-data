# AgentBroker Index: datos abiertos

Qué brokers, bancos y exchanges de crypto dejan que un agente de IA (ChatGPT, Claude, Grok o cualquier cliente MCP) consulte tu cuenta, prepare órdenes u opere, y si cada entidad está autorizada para dar servicio en España. Desde el 20 oct 2026 incluye también un **piloto para Argentina y México**: disponibilidad allí y registro local de cada proveedor (CNV en Argentina, CNBV en México). Cada registro enlaza a sus fuentes.

[English](README.md) · Web: https://agentbrokerindex.com/es/ · Licencia: [CC BY 4.0](LICENSE)

| | |
|---|---|
| Proveedores | 68 (43 con producto oficial para agentes de IA) |
| Autorizados en España | 38 (comprobado en los registros de la CNMV, el Banco de España y ESMA) |
| Registro MiCA provisional de ESMA | 373 CASP autorizados (revisado 2026-10-19) |
| Argentina / México (piloto) | 4 proveedores con datos de Argentina y 4 con datos de México (Interactive Brokers, IOL invertironline, Ripio, Bitso, Webull México) |
| Tipos de activo (nuevo) | 42 de 43 entidades oficiales con al menos un activo con fuente; 405 de 602 casillas siguen sin confirmar |
| Versión de los datos | 2026-10-26 (última revisión 2026-10-26) |

## Servidor MCP
Los asistentes de IA pueden consultar estos datos directamente con un servidor MCP gratuito y de solo lectura en `https://mcp.agentbrokerindex.com/mcp`. En el registro oficial de MCP figura como `com.agentbrokerindex/agentbroker-index`. Código e instrucciones: [mcp-server/](mcp-server/).

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
| `availability` | Disponibilidad en España / UE / EE. UU. / Argentina (ar) / México (mx) |
| `licence.latam` | Registro local en Argentina / México (CNV, CNBV); una inscripción PSAV no es una licencia |
| `licence` | Entidad, regulador, autorización en España (CNMV/BdE/ESMA), MiCA, CFD |
| `assets` | Por tipo de activo: agent = trade (opera) | read (solo lectura) | no (no disponible para el agente) | unknown (sin confirmar); platform = si la plataforma lo ofrece; source obligatoria salvo en unknown; note / note_es |
| `fractional, fractional_meta` | Órdenes fraccionadas para el agente: true | false | null, con fuente y nota |
| `assets_checked` | Fecha de la última revisión de los tipos de activo |
| `CSV: assets_trade, assets_read, assets_no, asset_<key>` | Capa de activos aplanada: claves por estado unidas con `;` y una columna por activo |
| `source_url, evidence_urls, source_http_status` | Fuentes primarias y su estado HTTP |
| `last_checked` | Fecha de la última revisión |
| `date_modified` | Fecha del último cambio real del contenido |
| `license` | CC-BY-4.0 |

## Método
- **Fuentes:** cada dato sale de la documentación, nota de prensa o condiciones del propio proveedor, o de un registro oficial.
- **Autorización:** se comprueba a mano en la CNMV, el Banco de España y ESMA. La fecha está en `licence.authorisation_checked`.
- **Argentina / México:** registro local tal como lo publica cada proveedor y, cuando existe, el registro de la CNV o la CNBV (`licence.latam.*.checked`). Una inscripción PSAV en la CNV es a efectos de prevención del lavado de activos y **no** es una licencia; las plataformas de crypto en México se marcan `crypto_not_cnbv`, nunca como «autorizadas». Guías: https://agentbrokerindex.com/es/latinoamerica/argentina/ y https://agentbrokerindex.com/es/latinoamerica/mexico/.
- **Revisión:** semanal. `date_modified` solo cambia cuando cambia el contenido.
- **Tipos de activo (desde el 20 oct 2026):** una casilla es `trade` o `read` solo si la documentación oficial muestra al agente haciéndolo, y `no` solo si la entidad lo dice o el activo no figura en su catálogo de herramientas completo y publicado. Todo lo demás queda en `unknown`: nunca lo deducimos de lo que vende la entidad en general. `platform` se recoge aparte, porque muchos brokers venden productos a los que su conexión para agentes no llega. Explicación: https://agentbrokerindex.com/es/about/#activos.
- **CFD:** los proveedores de CFD están marcados (`licence.cfd`, `licence.cfd_only`). Los CFD son de alto riesgo; la mayoría de las cuentas minoristas pierden dinero con ellos.

**No es asesoramiento financiero.** Solo información. Ningún proveedor paga por aparecer y no hay enlaces de afiliado. Correcciones: abre un issue citando una fuente.

## Licencia y cita
Datos con licencia [CC BY 4.0](LICENSE): cita "AgentBroker Index (agentbrokerindex.com)", enlaza la licencia e indica si hiciste cambios.

```
AgentBroker Index (2026). Datos abiertos de AgentBroker Index: acceso de agentes de IA a brokers, bancos y exchanges de crypto (versión 2026-10-26). https://agentbrokerindex.com/es/ . Licencia CC BY 4.0.
```
