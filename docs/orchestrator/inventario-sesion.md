# Inventario de la sesión — 2026-11-01

Comprobado en esta sesión. No es una lista de deseos. El detalle de binarios y de skills está en [inventario-entorno.md](inventario-entorno.md), generado por `python3 -m orchestrator inventory`.

## Repositorio

- Raíz: este proyecto. Hay `.git`. La rama `main` no tiene commits. No hay remoto.
- `git status` muestra todo sin seguimiento.
- `MASTER_PROMPT_FINANCIAL_OPERATIONS.md` ausente.
- Presentes: `ORCHESTRATOR.md`, `docs/orchestrator/01` a `05`, `docs/orchestrator/plantillas.md`, `docs/documento-maestro.md`.
- No hay `package.json`, `Makefile` ni CI. El único comando de prueba que existe es `python3 -m unittest tests.test_orchestrator`.

## Modelos que el runtime de Cursor listó

No se llamó a la API de cada uno. Están declarados para subagentes en esta sesión:

- inherit
- claude-fable-5-1-thinking-high
- claude-opus-5-5-medium
- claude-sonnet-5-5-high
- cursor-grok-4.6-high-fast
- gemini-4-argon-medium
- gpt-5.6-sol-medium
- grok-4.7-xhigh
- muse-wonder-1.0-high

## Subagentes del Task tool

Declarados en el esquema de la herramienta `Task`. No se lanzó ninguno en esta fase.

| Tipo | Aislamiento comprobado |
| --- | --- |
| generalPurpose | No. Comparte la sesión si no se le da un worktree y lo respeta. |
| explore | No edita. Lectura. |
| cursor-guide | Documentación de Cursor. No comprobado con una llamada. |
| ci-investigator | Un check de CI. No hay CI en este repo. |
| bugbot | Revisión. Prompt fijo. No lanzado. |
| security-review | Revisión de seguridad. Prompt fijo. No lanzado. |
| best-of-n-runner | El esquema dice worktree y rama propios. No se ejecutó, así que el aislamiento no quedó observado. |
| ai-architect | Guía Vercel. No lanzado. |
| deployment-expert | Guía Vercel. No lanzado. |
| performance-optimizer | Guía Vercel. No lanzado. |
| render-assistant | Guía Render. No lanzado. |
| comment-sicko | Comentarios. No lanzado. |
| poteto-agent | Solo dentro de poteto-mode. Este modo no está activo. |

`cavecrew-investigator`, `cavecrew-builder` y `cavecrew-reviewer` aparecen en la skill `cavecrew`. No están en la lista de `Task`. No se pueden invocar en esta sesión.

## CLIs headless

Versión tomada de `--version`. Ayuda leída. Ninguno recibió un prompt.

| CLI | Versión | Headless visto en `--help` | Ejecutado |
| --- | --- | --- | --- |
| agent | 2026.10.22-27dcf5f | `agent -p` | No |
| cursor-agent | 2026.10.16-e3cb207 | Binario más viejo, también presente | No |
| claude | 2.1.312 | `claude -p` y `--bg` | No |
| opencode | 1.19.0 | `opencode run`, `opencode serve` | No |
| pi | 1.1.0 | `pi --print` | No |
| cursor | 3.19.13 | Editor. No es el runtime headless | No |
| gh | 2.95.0 | Autenticado como Juan-GuevaraBusta. Token no copiado | `gh auth status` |
| docker | 29.7.2 | El daemon no se comprobó | No |

No instalados: codex, gemini, copilot, aider, amp, droid, openhands.

Concurrencia de esos CLIs: cada binario puede arrancar procesos. La cuota y el rate limit no se midieron. No se lanzaron procesos de más para medirlos.

El esquema de `Task` permite varias llamadas en un mismo mensaje. No documenta un máximo de tres. Tampoco se midió un máximo real.

## MCP

Inspección con el catálogo de herramientas de esta sesión.

| Namespace | Estado | Uso para este orquestador |
| --- | --- | --- |
| cursor | Listo. Task, shell, lectura, búsqueda web | El orquestador humano usa Task. El CLI Python no lo llama. |
| graphify | Listo | Grafo de código. Este repo aún no tiene un grafo útil. |
| Playwright | Listo | Browser. No hay UI del producto. |
| plugin-deploy-on-aws-awsknowledge | Listo | Docs AWS. Fuera del patrón elegido. |
| plugin-deploy-on-aws-awsiac | Listo | IaC AWS. Fuera del patrón elegido. |
| plugin-deploy-on-aws-awspricing | Listo | Precios AWS. Fuera del patrón elegido. |
| plugin-postman-postman | needsAuth | No usable hasta autenticar. |
| plugin-render-render | needsAuth | No usable hasta autenticar. |
| plugin-supabase-supabase | needsAuth | No usable hasta autenticar. |
| plugin-vercel-vercel | needsAuth | No usable hasta autenticar. |

## Skills

El índice tiene 372 filas. Salen del frontmatter de cada `SKILL.md` encontrado en las rutas de usuario y de plugins. Hay duplicados entre cachés de Cursor y de Claude.

Leídas enteras en esta sesión, por ser las que mandan el aislamiento y el despacho:

- `using-git-worktrees`
- `dispatching-parallel-agents`
- `subagent-driven-development`
- `cavecrew`

`using-git-worktrees` pide una herramienta nativa de worktree antes que `git worktree add`. Aquí no hay `EnterWorktree`. Se usó Git.

`subagent-driven-development` dice que no se lancen implementadores en paralelo porque chocan en el mismo árbol. `dispatching-parallel-agents` pide paralelismo si no hay estado compartido. Este orquestador sigue las dos: paralelo solo con worktrees distintos y ownership sin solape.

El resto de skills no se leyó de cuerpo completo. Antes de asignar una, hay que abrir su archivo.

## Máquina

RAM observada: 17179869184 bytes. CPUs: 10.
