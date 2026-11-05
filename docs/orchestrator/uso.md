# Uso del orquestador

Cada cambio, por pequeño que sea, se commitea y se pushea a `origin` en la misma sesión. Un árbol solo local no está terminado. No hay force-push. Si el remoto rechaza el push, se informa el bloqueo y no se fuerza.

No lanza el producto financiero. Sirve para partir un trabajo ya definido en tareas aisladas e integrarlas de a una.

## Requisitos

- Git y Python 3.
- Al menos un commit en la rama base.
- `.worktrees/` dentro de `.gitignore`. Ya está.
- Hook instalado:

```bash
python3 -m orchestrator install-hooks
```

## Comandos

Desde la raíz del repositorio:

```bash
python3 -m orchestrator doctor
python3 -m orchestrator product-guard
python3 -m orchestrator inventory --write docs/orchestrator/inventario-entorno.md
python3 -m orchestrator task-add T1 --title "Nota" --owns docs/notas --risk bajo --base main --validate "python3 -m unittest tests.test_orchestrator"
python3 -m orchestrator allocate
python3 -m orchestrator prompt T1
python3 -m orchestrator review T1
python3 -m orchestrator approve T1 --approver "Nombre"
python3 -m orchestrator integrate T1
python3 -m orchestrator release T1
```

`approve` solo después de `NEEDS_HUMAN_REVIEW`. Sin esa revisión, `integrate` sale con código 2.

`review` fija el SHA del worktree. `integrate` rechaza si la rama avanzó después del review.

En worktrees de agente, exporta `CI_ROOT` al root del worktree (o usa `scripts/run-agent.sh`) para que `check_docs.py` no reporte cero archivos.

`push` sube la rama `agent/...`. `push-base` sube la rama base y solo si la tarea ya está `MERGED` o `DONE`. Ninguno usa `--force`.

Un agente hijo debe tener `ORCH_ROLE=child`. Con esa variable, integrar y pushear la base se rechaza.

## Cómo repartir trabajo

1. Leer `ORCHESTRATOR.md` y la fase que toque en `docs/orchestrator/`.
2. Si la tarea cambia el producto, `product-guard` tiene que pasar. Hoy no pasa.
3. Elegir skills del índice `docs/orchestrator/inventario-entorno.md`. Leer el `SKILL.md` completo antes de asignarla. El índice solo trae el frontmatter.
4. Partir por ownership de directorios, no por un cupo de tres agentes.
5. Crear los worktrees. Cada agente trabaja solo en el suyo.
6. Revisar el diff. Integrar. Si el riesgo es alto o el path es sensible, parar para una persona.

## Pruebas

```bash
python3 -m unittest tests.test_orchestrator -v
```

Cubren aislamiento de worktrees, ownership solapado, merge de riesgo bajo, bloqueo humano, SHA revisado, conflicto con abort, árbol sucio, lock de integración, rechazo de `push --force` y push de `main` desde un worktree.

## Agentes headless

```bash
python3 -m orchestrator allocate --max-slots 4
bash scripts/run-agent.sh t12-preflight cursor-agent
```

Logs en `.orchestrator/logs/`. Sin `--yolo` ni flags que salten permisos.

## Estado local

`.orchestrator/state.json` y `.orchestrator/log.jsonl` quedan fuera de Git. No guardan secretos si no los pegas en un título.
