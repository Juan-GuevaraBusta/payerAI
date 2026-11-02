# Arquitectura del orquestador

Estado: implementado y probado en repositorios temporales. No construye el producto financiero.

## Bloqueo de producto

`MASTER_PROMPT_FINANCIAL_OPERATIONS.md` no está en la raíz. `python3 -m orchestrator product-guard` sale con código 3 y no autoriza cambios de producto. `docs/documento-maestro.md` existe y no reemplaza ese nombre. `ORCHESTRATOR.md` y `docs/orchestrator/01` a `05` sí se leyeron enteros.

## Patrón elegido

Orquestador local en este repositorio, con Git worktrees y un solo integrador.

No se eligió un orquestador cloud ni microservicios de agentes. No hay un requisito medido que los justifique, y varios CLIs de pago no se ejecutaron.

| Pieza | Rol |
| --- | --- |
| `orchestrator/engine.py` | DAG, ownership, worktrees, revisión, merge, push |
| `orchestrator/cli.py` | Comandos del integrador |
| `orchestrator/hooks/pre-push` | Rechaza push no fast-forward y prohíbe que un worktree de agente actualice `main` o `master` |
| `.orchestrator/` | Estado y log. No se versiona |
| `.worktrees/<tarea>/` | Directorio exclusivo de cada agente. No se versiona |

Cursor no expone en esta sesión una herramienta nativa `EnterWorktree`. El subagente `best-of-n-runner` dice que aísla en un worktree propio. No se invocó. El aislamiento que sí se ejecutó es `git worktree add`.

## Concurrencia

`DEFAULT_MAX_SLOTS` es `None`. El código no impone un máximo de tres agentes.

`allocate` crea un worktree por cada tarea `READY` cuyo ownership no choca con una tarea `RUNNING`. Si se pasa `--max-slots N`, se detiene al llegar a N. N lo elige quien lanza el comando. No está fijado en 3.

La máquina reportó 10 CPUs y 16 GB. Eso no es una cuota de un proveedor de modelos. El CLI no arranca `claude`, `agent`, `opencode` ni `pi`. Arrancarlos gasta cuota y no se hizo.

Dos tareas pueden estar `RUNNING` a la vez solo si sus `owns` no se solapan. Una lista `owns` vacía ocupa el repositorio entero. El segundo `create` se queda en `READY` y guarda el motivo.

El merge usa un lock exclusivo (`.orchestrator/integrate.lock`). Si otro proceso lo tiene, la integración responde `busy` y no toca `main`.

## Estados

`BACKLOG` → `READY` → `RUNNING` → `REVIEW` no se usa como estado intermedio.

La revisión escribe uno de: `APPROVED`, `NEEDS_HUMAN_REVIEW`, `FAILED`, `BLOCKED`.

Luego: `APPROVED` → `MERGED` → `DONE`.

Errores adicionales: `CONFLICT`, `CANCELLED` no se asigna solo.

Una dependencia se desbloquea cuando la tarea previa está `MERGED` o `DONE`.

## Integración

Solo el proceso sin `ORCH_ROLE=child` puede aprobar, integrar o pushear.

Antes del merge:

- El árbol principal está limpio y en la rama base de la tarea.
- El worktree de la tarea está limpio.
- Hay un comando de validación y terminó en `PASS`. Si no hay comando, el resultado es `BLOCKED` y no se integra.
- Riesgo `alto` o `critico`, o un diff cuyo path contiene un token de seguridad, autorización, pagos, banco, tenant o secretos, queda en `NEEDS_HUMAN_REVIEW`.

`approve` registra revisor y hora. No hace el merge. `integrate` hace `git merge --no-ff` y después `publish_task`: sube la rama del agente y la rama base a `origin`. Si no hay remoto, la publicación falla. Si hay conflicto, ejecuta `git merge --abort`, deja la tarea en `CONFLICT` y no cambia el SHA de la base.

No hay `push --force`, `reset --hard` ni `git clean -fd` en el wrapper. El hook es la red si alguien llama a `git push --force` directo. Hay que instalarlo con `install-hooks`. Sin ese hook, un `git push` directo no pasa por el CLI.

Esta copia no tiene remoto. No se hizo push. `gh` está autenticado en la cuenta `Juan-GuevaraBusta`. El token no se copió.

## Qué no garantiza

Un agente con shell puede escribir fuera de su worktree si ignora el prompt. El integrador debe mirar el diff. El hook impide que ese worktree actualice la rama principal, no que edite archivos del árbol principal si comparte permisos de usuario.

La protección de rama en GitHub no existe aquí porque no hay remoto. Cuando exista, no se desactiva.
