# Validación de specs, skills, agentes y requisitos

Fecha: 2026-11-02. Rama: `docs/01-modelo-dominio`, desde `28b2f40`. Worktree: `payerAI-docs-01`.

Esta validación es de solo lectura sobre el producto y el contrato. No ejecutó código de producto, no usó `orchestrator integrate` y no hizo merge a `main`.

## Alcance

Leídos completos:

- `docs/documento-maestro.md`, `docs/glosario.md`, `docs/decisiones/adoptadas.md` y `docs/decisiones/abiertas.md`.
- `docs/tareas/01` a `11`.
- `AGENTS.md`, `ORCHESTRATOR.md`, `docs/README.md` y `docs/orchestrator/01` a `05`.
- `docs/orchestrator/asignaciones.md`, `inventario-sesion.md`, `inventario-entorno.md` y los informes `00`, `01`, `02`, `03` y `05`.
- Los 11 archivos de `.cursor/agents/`.

No hay código de producto. No existen `package.json`, `Makefile` ni `.github/`. Los gates automáticos de la Fase 9 no tienen comandos que ejecutar en este repositorio.

## Veredicto

- **Especificaciones de producto:** coherentes. Las tareas 01–04 ya están cubiertas por `docs/modelo/01-dominio.md`, `02-ingesta.md`, `03-proveedores.md` y `04-validacion.md`. Las tareas 05–11 mantienen correctamente sus puntos abiertos.
- **Agentes:** los 11 archivos existen, tienen frontmatter válido y coinciden con la tabla de `asignaciones.md`.
- **Skills:** las 11 rutas resuelven a un `SKILL.md` real. Nueve están registradas en la herramienta `skill` de OpenCode. `karpathy-guidelines` y `review-security` no lo están, pero pueden leerse por ruta absoluta.
- **Requisitos:** los funcionales y no funcionales están definidos. No hay contradicciones de dominio. Los huecos son los ya declarados como abiertos, más cuatro conflictos de proceso y siete inconsistencias.

## Matriz tarea, agente y skill

| Tarea | Agente | Skill | Ruta en disco | OpenCode | Estado |
| --- | --- | --- | --- | --- | --- |
| 01 Dominio | `dominio-estados` | `architect` | Sí | Registrada | Hecha |
| 02 Ingesta | `ingesta-documentos` | `principle-make-operations-idempotent` | Sí | Registrada | Hecha |
| 03 Proveedores | `proveedores-identidad` | `principle-boundary-discipline` | Sí | Registrada | Hecha |
| 04 Validación | `validacion-facturas` | `principle-explain-the-number` | Sí | Registrada | Hecha |
| 05 Workflows | `workflows-aprobacion` | `principle-separate-before-serializing-shared-state` | Sí | Registrada | Orden 07 → 05 |
| 06 Spend | `spend-intelligence` | `show-me-your-work` | Sí | Registrada | Lista |
| 07 Autoridad | `autoridad-ia` | `karpathy-guidelines` | Sí | No registrada; leer por ruta | Orden 07 → 05 |
| 08 Arquitectura | `arquitectura-separacion` | `how` | Sí | Registrada | Bloqueada por 07 |
| 09 Infraestructura | `infraestructura-costo` | `figure-it-out` | Sí | Registrada | Opcional |
| 10 Seguridad | `seguridad-tenancy` | `review-security` | Sí | No registrada; sin subagente `security-review` | Lista con fallback |
| 11 Edge cases | `edge-cases-pruebas` | `interrogate` | Sí | Registrada; sin revisores multi-modelo | Bloqueada por 01–10 |

Comprobaciones:

- Las 11 rutas de `.cursor/agents/<nombre>.md` existen.
- Las 11 rutas de skill citadas por los agentes existen. Las dos no estándar se comprobaron en:
  - `/Users/juanluisguevarabustamante/.claude/plugins/cache/karpathy-skills/andrej-karpathy-skills/1.0.0/skills/karpathy-guidelines/SKILL.md`
  - `/Users/juanluisguevarabustamante/.cursor/skills-cursor/review-security/SKILL.md`
- Los agentes son formato Cursor. No son subagentes del Task tool de OpenCode. Se siguen como instrucciones, no se lanzan como agentes.

## Hallazgos y resolución

| ID | Severidad | Hallazgo | Evidencia | Resolución |
| --- | --- | --- | --- | --- |
| B1 | Alta | `MASTER_PROMPT_FINANCIAL_OPERATIONS.md` no existe y el contrato detenía todo cambio | `ORCHESTRATOR.md`, Fase 0, `docs/README.md`; `product-guard` | Resuelto en `f6b178a`: se permite discovery y documentación; producto y código siguen bloqueados. No se creó ni se sustituyó el archivo |
| B2 | Alta | Dependencia circular 05 ↔ 07 | Cabeceras de ambas tareas | Resuelto en `c50898b`: 07 antes de 05. 07 ya no depende de 05 |
| B3 | Alta | El contrato manda merge y push a la rama principal | `04-integracion.md` | Aceptado como override de esta rama: solo se pushea la rama de trabajo, nunca `main`. No se usa el flujo de integración |
| B4 | Alta | Los agentes son Cursor y dos skills no están en OpenCode | `.cursor/agents/`; lista de skills de la sesión | Mitigado en `fe19082`: 07 y 10 leen el `SKILL.md` por ruta y 10/11 no simulan subagentes. Siguen sin ser subagentes nativos |
| I1 | Media | `karpathy-guidelines` y `review-security` no están en la herramienta `skill` | Lista de skills de la sesión | Mitigado en `fe19082`: lectura manual por ruta |
| I2 | Media | `karpathy-guidelines` vive en una ruta de caché con versión fija | Ruta `.../1.0.0/...` | Abierto. La ruta puede cambiar al actualizar el plugin |
| I3 | Media | Estados, `REVIEW`/`CANCELLED` y `crítico`/`critico` no coinciden con el CLI | Fase 7; informes 01, 03 y 05 | Abierto. No afecta mientras no se use el CLI |
| I4 | Media | La Fase 9 pide gates que el CLI no registra y el repo no tiene | Fase 9; informe 05 | Abierto. En docs la validación es revisión manual y `git diff` |
| I5 | Baja | `AGENTS.md` y `docs/modelo/01–04` solo existen en esta rama | `git cat-file` sobre `main` | Aceptado: no hay merge a `main` en esta tarea. Un worktree desde `main` no los verá |
| I6 | Baja | Inventarios e informes están desactualizados | SHA de `main`, “no hay remoto”, agentes en Task tool | Abierto. Se corrige cuando se cierre la rama |
| I7 | Baja | La numeración del orquestador no coincide con las fases | `ORCHESTRATOR.md` e índice | Abierto. Cosmético |

Los huecos de seguridad H1–H9 del informe `02-seguridad.md` siguen abiertos. Reforzan la regla de no usar `python3 -m orchestrator integrate`.

## Requisitos funcionales

| ID | Requisito | Fuente | Estado |
| --- | --- | --- | --- |
| FR-01 | Ingesta y clasificación de mensajes y documentos por tenant, idempotente | 5.2, 6; tarea 02 | Definido; clave exacta abierta |
| FR-02 | Extracción y normalización solo con campos presentes; ausencia explícita | 5.2; tareas 01, 02 y 04 | Definido |
| FR-03 | Identificación híbrida de proveedor; identificar no habilita para cobrar | 7; tarea 03 | Definido; umbrales y roles abiertos |
| FR-04 | Validación en cinco pasos: extracción, historial, contrato, confirmación y políticas | 8; tarea 04 | Definido |
| FR-05 | Duplicado exacto y probable como hallazgos distintos; discrepancia no es fraude ni aprobación | 14; tareas 04 y 11 | Definido; umbrales abiertos |
| FR-06 | Workflow configurable: aprobar, rechazar, pedir información, escalar y bloquear | 5.2 y 9; tarea 05 | Definido; quorum y delegación abiertos |
| FR-07 | Ciclo de obligación y pago con situaciones separadas; el MVP no mueve dinero | 9 y 13; tareas 01 y 07 | Definido; momento de obligación y catálogo de estados abiertos |
| FR-08 | Spend intelligence con evidencia y ahorro potencial, validado y realizado | 5.2 B; tarea 06 | Definido; profundidad de datos abierta |
| FR-09 | Autoridad L0–L3; la IA no recibe autoridad; registro de uso | 9 y 11; tarea 07 | Definido; modelo, JEV y roles abiertos |
| FR-10 | Auditoría reconstruible por decisión | 13; tareas 05 y 10 | Definido; append-only abierto |
| FR-11 | Multi-tenant en backend y persistencia | 13; tarea 10 | Definido; esquema de identidad abierto |
| FR-12 | Fuera del MVP: AR, nómina, reembolsos, órdenes de compra completas, custodia, transferencia y cancelación automática | 5.3 | Definido |

## Requisitos no funcionales

| ID | Requisito | Fuente | Estado |
| --- | --- | --- | --- |
| NFR-01 | Aislamiento multi-tenant; denegar sin revelar si el recurso ajeno existe | 13; tarea 10 | Firme; mecanismo abierto |
| NFR-02 | Autenticación distinta de autorización; roles, maker-checker, delegación, quorum y override | 13 | Firme; esquema abierto |
| NFR-03 | Idempotencia en correo, documentos, webhooks, eventos y ejecución | 13 | Firme; clave abierta |
| NFR-04 | Concurrencia sin last-write-wins | 13; tareas 05 y 11 | Firme; mecanismo abierto |
| NFR-05 | Timeout no es fallo; verificar la fuente de verdad; no simular éxito | 13; glosario | Firme |
| NFR-06 | Trazabilidad y audit log append-only o equivalente; sin secretos ni datos personales de más | 13 | Firme; implementación abierta |
| NFR-07 | Costo cercano a cero; free tiers con fecha; no activar recursos de pago sin costo escrito | 11, 12; tarea 09 | Firme; cifras a reverificar |
| NFR-08 | Serverless y scale-to-zero, sin máquina ni contenedor permanente | 12 | Preferencia, no dogma |
| NFR-09 | 10 ms de CPU en Workers frente a extracción de PDF | 12; tarea 09 | Tensión no medida |
| NFR-10 | Portabilidad y salida de proveedor de base, correo e inferencia | 12; tarea 09 | Abierto |
| NFR-11 | Observabilidad con logs estructurados, correlation ID y errores accionables | 15 | Firme |
| NFR-12 | Datos de demo sintéticos; nunca reales; sin cachés ni embeddings compartidos | 13 y 15 | Firme |
| NFR-13 | Modular monolith; sin microservicios, bus ni base vectorial sin requisito | 10 y 15 | Firme |
| NFR-14 | Pruebas de reglas, persistencia, workflows, contrato, multi-tenant y autorización; 23 edge cases | 14 y 15; tarea 11 | Firme; la suite no existe |
| NFR-15 | Retención, borrado y jurisdicción | 13; tarea 10 | Abierto |

## Decisiones registradas en esta validación

1. Sin `MASTER_PROMPT_FINANCIAL_OPERATIONS.md`, discovery y documentación siguen; producto y código quedan bloqueados. El archivo no se inventa ni se sustituye.
2. Orden de las tareas 07 y 05: 07 primero, 05 después.
3. Esta rama no hace merge a `main`. Solo publica `docs/01-modelo-dominio`.
4. No se usa `python3 -m orchestrator integrate`.
5. Los agentes 07, 10 y 11 tienen fallback para OpenCode: leen el `SKILL.md` por ruta y no simulan subagentes inexistentes.
6. `AGENTS.md` y `docs/modelo/` quedan en esta rama hasta que se decida integrarlos.

## Actualización posterior

- 2026-11-02: por decisión del responsable, `docs/01-modelo-dominio` y `fix/forbid-huecos` se integraron en `main` con merges `--no-ff`. Los puntos 3 y 6 quedan superados. La tarea 06 parte de `main` actualizado.

## Evidencia ejecutada

- `git ls-remote origin docs/01-modelo-dominio` y `git rev-parse HEAD`: local y remoto coinciden en cada push.
- `test -f` sobre las rutas de `karpathy-guidelines`, `review-security`, `show-me-your-work` y `figure-it-out`.
- `git cat-file -e main:AGENTS.md`, `main:docs/modelo/01-dominio.md` y `main:MASTER_PROMPT_FINANCIAL_OPERATIONS.md`: los tres faltan en `main`.
- `rg` sobre tareas, agentes, asignaciones, informes e inventarios para cruzar referencias.
- Lectura completa de las tareas 01–11 y de las fases 01–05.

No se ejecutaron pruebas de producto porque no hay código de producto. No se ejecutó la suite del orquestador en esta pasada.

## Siguiente paso

1. Tarea 06, única con dependencias satisfechas y sin bloqueo de proceso.
2. Tarea 07 y después 05.
3. Tarea 08 después de 07. Tarea 10 con el fallback sin diff. Tarea 11 después de 01–10.
4. Tarea 09 queda opcional y, si se hace, solo compara opciones.
