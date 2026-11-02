# Fases 7 a 9 — Supervisión, revisión y gates

Lee [ORCHESTRATOR.md](../../ORCHESTRATOR.md). Aplica [04-integracion.md](04-integracion.md) solo después de estos gates.

## Fase 7 — Ejecución, supervisión y recuperación

Mantén un registro de estado por tarea:

`BACKLOG` → `READY` → `RUNNING` → `BLOCKED` / `REVIEW` → `APPROVED` → `MERGED` → `DONE`

Estados de error: `FAILED`, `CANCELLED`, `NEEDS_HUMAN_REVIEW`.

Supervisa:

- Inicio y fin de cada agente.
- Archivos modificados.
- Commits y diffs.
- Tests ejecutados y su resultado.
- Uso de herramientas y errores.
- Agentes sin progreso o bloqueados.
- Conflictos de archivos, puertos, bases de datos y recursos.

Si un agente falla:

1. Conserva sus logs y sus cambios.
2. Determina si el problema es de código, prompt, herramienta, autenticación, cuota o dependencia.
3. Reintenta solo si existe una corrección concreta. Evita loops indefinidos.
4. Reasigna a otro runtime si está disponible y es compatible.
5. No elimines su worktree ni su rama hasta preservar cualquier trabajo útil.

Los agentes reportan resultados estructurados. No marques una tarea como terminada solo porque el proceso terminó. Comprueba entregables y tests.

## Fase 8 — Revisión técnica independiente

Cada rama pasa por una revisión independiente del agente que implementó el cambio cuando el riesgo y el alcance lo justifiquen.

El revisor inspecciona el diff y comprueba:

- Cumplimiento del objetivo y de los criterios de aceptación.
- Correctitud funcional y edge cases.
- Calidad de diseño, acoplamiento y complejidad añadida.
- Seguridad, autorización y privacidad.
- Aislamiento multi-tenant.
- Manejo de errores, reintentos e idempotencia.
- Migraciones y compatibilidad de datos.
- Tests suficientes y confiables.
- Dependencias, licencias y costos.
- Ausencia de secretos, de datos reales sensibles y de cambios no relacionados.

La revisión es crítica. No se limita a aceptar el resumen del implementador. Cada hallazgo incluye severidad, archivo y línea, impacto y recomendación.

Cambios de riesgo `alto` o `crítico` quedan en `NEEDS_HUMAN_REVIEW`. La lista mínima está en [04-integracion.md](04-integracion.md).

## Fase 9 — Gates de calidad antes de integrar

Ejecuta los checks que correspondan al repositorio, por ejemplo:

- Formatter.
- Linter.
- Typecheck.
- Unit tests.
- Integration tests.
- Contract tests.
- E2E o smoke tests.
- Build de frontend y backend.
- Migraciones en base de datos de prueba.
- Validaciones de seguridad y dependencias.
- Tests de aislamiento multi-tenant y autorización para cambios de seguridad o datos.

No inventes comandos. Inspecciona `package.json`, scripts, `Makefile`, CI y documentación. Si un check no existe, informa la ausencia. No lo declares aprobado.

Marca cada check como:

- `PASS`: ejecutado y aprobado.
- `FAIL`: ejecutado y falló.
- `NOT_RUN`: no ejecutado.
- `BLOCKED`: no ejecutable por dependencia o entorno.

No integres una rama con fallos relevantes sin resolver, ni con checks esenciales en `NOT_RUN` o `BLOCKED`.
