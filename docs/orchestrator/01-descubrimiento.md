# Fases 0 a 3 — Contexto, inventario y capacidad

Lee [ORCHESTRATOR.md](../../ORCHESTRATOR.md) antes de este documento. No lances agentes durante estas fases.

## Fase 0 — Cargar contexto e instrucciones

Antes de cambiar archivos:

1. Lee completo `MASTER_PROMPT_FINANCIAL_OPERATIONS.md`.
2. Inspecciona las instrucciones del repositorio y del entorno. Busca, cuando existan:
   - `AGENTS.md` y variantes por subdirectorio.
   - `CLAUDE.md`, `.claude/` y reglas de Claude Code.
   - `.cursor/rules/`, `.cursorrules` y configuraciones de Cursor.
   - `GEMINI.md` y configuraciones de Gemini.
   - `CODEX.md`, `AGENTS.md` y configuración de Codex.
   - `.github/copilot-instructions.md`, instrucciones de Copilot y guías de PR.
   - `CONTRIBUTING.md`, `README.md`, ADRs, documentación de arquitectura y scripts de CI.
3. Identifica el package manager, lenguajes, frameworks, estructura, comandos de test, lint, typecheck y build, estado de Git, ramas y remotes.
4. No asumas que `main` existe o es la rama por defecto. Comprueba el default branch local y remoto.
5. Comprueba si el working tree tiene modificaciones. Si está sucio, protege los cambios y evita que los agentes los sobrescriban. No hagas stash, reset ni checkout destructivo sin permiso.

## Fase 1 — Inventario completo de agentes y runtimes

Haz un inventario reproducible del entorno actual. No te limites a Cursor.

Registra el resultado con la plantilla de [plantillas.md](plantillas.md). No guardes tokens ni secretos.

### 4.1 Descubrimiento de agentes

Busca ejecutables y herramientas disponibles. Esta lista es de candidatos, no una afirmación de que estén instalados:

- Cursor Agent, Cursor CLI o background agents.
- Claude Code CLI y sus subagents o agent teams, si están disponibles.
- OpenAI Codex CLI y sus agentes o subagents, si están disponibles.
- Gemini CLI.
- GitHub Copilot CLI o coding agent.
- OpenCode.
- Aider.
- Amp, Pi, Droid u otros agentes de código encontrados en el entorno.
- OpenHands u otros runtimes de agentes autónomos.
- Orquestadores externos o locales ya instalados.
- MCP servers y herramientas que expongan ejecución, archivos, GitHub, terminal, browser, CI/CD o agentes.

Usa inspección segura: `command -v`, `which`, `--version`, `--help`, listados de herramientas y documentación local. No ejecutes instalación ni autenticación sin permiso.

Para cada agente o runtime, registra:

- Nombre y versión comprobada.
- Cómo se invoca: subagent nativo, CLI independiente, API, MCP, app o servicio cloud.
- Si puede editar archivos, ejecutar comandos, hacer tests, usar Git y trabajar headless.
- Si soporta worktrees, sesiones paralelas, handoffs o ejecución persistente.
- Requisitos de autenticación observables, sin mostrar tokens ni secretos.
- Límites conocidos de concurrencia, rate limits o costos, si pueden verificarse.
- Ventajas, limitaciones y tareas en las que sería útil.
- Estado: `disponible`, `disponible parcialmente`, `no autenticado`, `incompatible` o `no instalado`.

No asumas que una extensión de editor implica una CLI headless. Distingue la interfaz del runtime.

### 4.2 Superar el límite de tres agentes de Cursor

No estructures el sistema alrededor de un máximo de tres agentes de Cursor. Si Cursor limita la interfaz:

1. Comprueba si existe un CLI o runtime alternativo ya instalado y autorizado.
2. Evalúa lanzar procesos independientes, cada uno desde su propio Git worktree.
3. Evalúa combinar runtimes distintos cuando estén disponibles y aporten valor. Ejemplos: Claude Code, Codex, Gemini CLI, OpenCode.
4. Evalúa un orquestador de worktrees o una capa de control local o cloud ya disponible.
5. Si no existe otro runtime, informa la limitación real y propone opciones viables. No simules paralelismo. No eludas límites contractuales ni técnicos.

No hay un número mágico de agentes. La concurrencia efectiva depende del hardware, las cuotas y las tareas realmente independientes. No lances agentes extra solo para inflar el número.

## Fase 2 — Inventario y lectura de skills

Descubre y lee las skills disponibles antes de asignar trabajo.

### 5.1 Descubrir ubicaciones

Inspecciona las ubicaciones convencionales que apliquen. No presupongas que una ruta existe. Busca también rutas que indiquen los runtimes detectados.

Candidatos:

- `.agents/skills/`
- `.claude/skills/` y ubicaciones globales de Claude.
- `.cursor/skills/` y directorios de skills de Cursor.
- `.codex/skills/` y ubicaciones globales de Codex.
- `.github/skills/` y otras instrucciones del repositorio.
- Directorios globales o de usuario documentados por las herramientas detectadas.
- Skills expuestas por MCPs o plataformas conectadas.

### 5.2 Leerlas e inventariarlas

- Lee el archivo principal de cada skill encontrada. Ejemplos: `SKILL.md`, `skill.md`, manifest o equivalente.
- Registra nombre, propósito, instrucciones principales, herramientas requeridas, límites, referencias vinculadas y ruta exacta.
- Para las skills que correspondan a la tarea actual, lee también sus referencias y archivos complementarios relevantes antes de asignar el trabajo.
- No asumas que el nombre garantiza la capacidad. Lee las instrucciones.
- No omitas una skill por estar en otro directorio, pertenecer a otro agente o estar instalada de forma global.
- No entregues todas las skills a todos los agentes. Conserva un inventario resumido. Entrega a cada agente solo las skills pertinentes y sus instrucciones completas.

### 5.3 Selección dinámica de skills

Para cada tarea:

1. Identifica la naturaleza del trabajo: arquitectura, frontend, backend, base de datos, Cloudflare, seguridad, testing, documentación, UX, integración, Git, investigación u otra.
2. Consulta el inventario.
3. Selecciona una o varias skills que realmente apliquen.
4. Lee sus instrucciones completas y las referencias necesarias.
5. Explica por qué fueron seleccionadas y qué instrucciones son obligatorias.
6. Si ninguna aplica, dilo y continúa con buenas prácticas generales. No inventes skills.

La selección depende de la tarea actual. No uses siempre la misma skill por defecto. Una tarea puede requerir varias skills. Un mismo proyecto puede requerir skills distintas para tareas distintas.

## Fase 3 — Evaluar la capacidad de orquestación

Con el inventario, identifica qué patrón es posible:

- Subagents dentro de un único runtime.
- Múltiples procesos CLI independientes.
- Múltiples CLIs de proveedores diferentes.
- Agentes en contenedores o máquinas separadas.
- Orquestador local con worktrees.
- Orquestador cloud existente.
- Combinación de los anteriores.

Compara las opciones disponibles según:

- Paralelismo real y límites efectivos.
- Aislamiento de workspace.
- Capacidad de asignar skills e instrucciones a cada agente.
- Observabilidad, logs y seguimiento de estado.
- Reinicio y recuperación de ejecuciones.
- Control de costos y autenticación.
- Integración con GitHub, Git y pruebas.
- Riesgo de colisiones y dificultad de merge.

Puedes considerar herramientas de orquestación locales o cloud ya existentes. No instales ni adoptes una sin evaluar antes compatibilidad, mantenimiento, costo, seguridad y necesidad. No supongas que una herramienta externa puede invocar todos los agentes del entorno.

Elige un patrón y regístralo en la memoria de orquestación antes de pasar a la Fase 4.
