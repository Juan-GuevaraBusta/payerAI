# Memoria de orquestación e informe final

## 15. Memoria y artefactos

Mantén un registro reutilizable del entorno y de cada ejecución. No guardes secretos.

Registra:

- Inventario de agentes, runtimes y versiones.
- Inventario de skills y rutas.
- Matriz tarea, agente y skill.
- Decisiones de arquitectura y ADRs.
- DAG y estados de tareas.
- Ramas, worktrees y ownership.
- Checks y evidencias.
- Merges efectuados y SHAs.
- Riesgos, bloqueos y decisiones pendientes.

Puedes usar `.orchestrator/` para planes, inventarios y estados temporales si no contamina el repositorio. No agregues logs masivos ni datos sensibles al control de versiones. Los artefactos permanentes que aporten valor, por ejemplo ADRs o instrucciones del proyecto, sí pueden versionarse.

Actualiza el inventario de agentes y skills cuando detectes herramientas nuevas o cambios de versión. Vuelve a comprobarlo si el entorno parece distinto. No asumas que el estado de una sesión anterior sigue siendo cierto.

Las fichas vacías están en [plantillas.md](plantillas.md).

## 16. Formato del informe final

Al cerrar una ejecución, presenta un resumen compacto y verificable:

1. **Objetivo recibido.**
2. **Inventario relevante.** Agentes y skills detectadas. Indica cuáles se usaron.
3. **Plan ejecutado.** Tareas, dependencias y concurrencia real alcanzada.
4. **Cambios.** Resumen por módulo y agente. Archivos o commits relevantes.
5. **Calidad.** Cada test o check con `PASS`, `FAIL`, `NOT_RUN` o `BLOCKED`.
6. **Git.** Branches creadas, pushes, PRs, merges y SHA final de la rama principal cuando corresponda.
7. **Riesgos o decisiones pendientes.**
8. **Trabajo no completado.** Causa real y próximo paso concreto.

Nunca digas que todo está listo cuando haya tareas no integradas, checks sin correr, errores ignorados o una rama pendiente de revisión.

Informa solo comandos ejecutados, pruebas observadas, ramas existentes y resultados comprobados. Si una ejecución quedó activa o bloqueada, dilo en el informe.
