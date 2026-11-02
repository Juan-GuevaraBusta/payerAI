# Revisión de calidad del orquestador

Fecha: 2026-11-02. Worktree `a3-calidad`, rama `agent/a3-calidad-revision-de-calidad`.

Skill leída entera: `karpathy-guidelines`. Se aplicó a la auditoría. Este informe nombra el problema y no edita código, config ni otros docs.

Alcance leído: `.gitignore`, `orchestrator/__main__.py`, `orchestrator/cli.py`, `orchestrator/engine.py`, `orchestrator/inventory.py`, `tests/test_orchestrator.py`. También `orchestrator/hooks/pre-push`, porque `install_hooks` copia ese archivo. No hay refactor.

Criterio de cierre: comandos reales, cada hallazgo con archivo y línea, supuesto separado del hecho medido, y el unittest pegado con su resultado.

## Gates

| Check | Resultado | Evidencia |
| --- | --- | --- |
| Unit tests del orquestador | PASS | `python3 -m unittest tests.test_orchestrator -v`: 16 tests, 8.146s, OK |
| CI (`.github/workflows`) | Ausente | `.github` no existe. Tampoco `.gitlab-ci.yml`, `Jenkinsfile`, `Makefile`, `pyproject.toml`, `package.json`, `requirements.txt` ni `setup.py` |
| Formatter, linter, typecheck | NOT_RUN | No hay comando declarado en el repo. No inventé uno |
| Integración / E2E / contratos / build | NOT_RUN | El único comando de test que existe es el unittest de arriba |
| `product-guard` en este worktree | BLOCKED, código 3 | Falta `MASTER_PROMPT_FINANCIAL_OPERATIONS.md` |

Python de esta máquina: 3.14.5. Las anotaciones `list[str] \| None` e `int \| None` piden 3.10 o más. El repo no fija esa versión.

## Comandos

`git check-ignore -q` (0 = ignorado, 1 = no):

| Path | Exit |
| --- | --- |
| `.worktrees` | 1 |
| `.worktrees/x` | 0 |
| `.orchestrator` | 1 |
| `.orchestrator/state.json` | 0 |
| `.env` | 1 |
| `.venv` | 1 |
| `foo.pyc` | 0 |

`git config --get core.ignorecase` → `true`.

`python3 -m orchestrator doctor` en este worktree:

```json
{
  "branch": "agent/a3-calidad-revision-de-calidad",
  "has_commit": true,
  "master_present": false,
  "worktrees_ignored": true,
  "dirty": false,
  "default_max_slots": null
}
```

`python3 -m orchestrator product-guard` → exit 3:

```text
blocked: No se puede leer MASTER_PROMPT_FINANCIAL_OPERATIONS.md. No hay cambios de producto. Existe docs/documento-maestro.md, y no sustituye ese nombre.
```

`git remote -v` muestra `origin` → `https://github.com/Juan-GuevaraBusta/payerAI.git`. No hice push.

`diff -q orchestrator/hooks/pre-push` contra `.git/hooks/pre-push` salió 0. El hook instalado coincide con el del repo y es ejecutable. El fuente en el repo está en modo 644; `install_hooks` hace 755 al copiarlo.

`python3 -c 'import orchestrator.__main__'` ejecuta la CLI al importar y sale 2: falta el subcomando.

`forbid()` sobre argv, sin lanzar git:

| Argv | Resultado |
| --- | --- |
| `push --force`, `push --force-with-lease`, `push -f` | `forbidden` |
| `push --force-with-lease=main` | pasa |
| `push -uf` | pasa |
| `push origin +main` | pasa |
| `push --force-if-includes` | pasa |
| `push --no-verify` | pasa |
| `reset --hard`, `reset --hard HEAD` | `forbidden` |
| `clean -fd`, `clean -df` | `forbidden` |
| `clean -f -d`, `clean --force -d` | pasa |
| `-C /tmp push --force` | pasa (`args[0]` no es `push`) |

`git push -h` lista `-f`, `--force-with-lease[=...]`, `--force-if-includes` y `--no-verify` (salta el hook pre-push).

`path_is_sensitive` medido:

| Path | Resultado |
| --- | --- |
| `src/auth/policy.py`, `src/pago.py`, `docs/seguridad.md`, `src/tenant_id.py` | True |
| `src/author.py`, `src/bancos.py`, `src/iban.txt`, `src/cuenta.py`, `keys/llave.pem`, `src/password.py`, `src/cifrado.py`, `db/migration.sql`, `infra/terraform.tf` | False |

`overlaps("docs", "docs/sub")` True. `overlaps("docs", "docs2")` False. `overlaps("", "docs")` True. `overlaps("Docs", "docs")` False. `overlaps("../docs", "docs")` False.

Repo temporal, borrado al salir:

- `--risk crítico` → `riesgo invalido: crítico`. El conjunto acepta `critico`.
- `allocate(-1)` y `allocate(0)` devuelven `[]` y la tarea sigue `READY`.
- Con `ORCH_ROLE=child` y id inexistente, `push_base` devuelve código `error` y el texto `la base solo se pushea despues de integrar`. `integrate_task` devuelve `forbidden`.
- `state.json` con `{` → `JSONDecodeError`, no `OrchestratorError`.

`scan_binaries` tardó 3.43s. `os.cpu_count()` = 10. Disponibles: git 2.54.0, python3 3.14.5, node v24.12.0, gh 2.95.0, docker 29.7.2, cursor 3.19.13, agent y cursor-agent 2026.10.22, claude 2.1.312, opencode 1.19.0, pi 1.1.0. No instalados: codex, gemini, copilot, aider, droid, openhands, amp. `skill_roots()` devolvió 6 directorios. No recorrí los `SKILL.md`.

`render_markdown` con un salto de línea artificial parte la tabla. El camino de `scan_binaries` se queda con la primera línea de `--version`, y `_frontmatter` aplasta el espacio de la descripción. Ese camino normal no metió el salto.

### Unittest

Comando: `python3 -m unittest tests.test_orchestrator -v`

```text
test_child_cannot_integrate_or_push_base ... ok
test_conflict_does_not_change_main ... ok
test_destructive_git_is_refused_before_running ... ok
test_dirty_main_blocks_integrate ... ok
test_high_risk_and_sensitive_path_need_human ... ok
test_hook_blocks_non_ff_and_agent_push_to_main ... ok
test_integration_lock_is_exclusive ... ok
test_low_risk_merge_unblocks_dependency ... ok
test_missing_validation_does_not_pass ... ok
test_overlapping_ownership_is_serial ... ok
test_product_guard_and_doctor ... ok
test_publish_pushes_branch_and_base ... ok
test_publish_without_remote_is_blocked ... ok
test_self_dependency_is_rejected ... ok
test_slots_are_not_capped_at_three ... ok
test_worktrees_do_not_share_files ... ok

Ran 16 tests in 8.146s

OK
```

El proceso también escribió este JSON por stdout. Sale de `main(..., "doctor")` dentro de `test_product_guard_and_doctor`, en un repo temporal que deja el master sin commit. No es el `doctor` de este worktree.

```json
{
  "branch": "main",
  "has_commit": true,
  "master_present": true,
  "worktrees_ignored": true,
  "dirty": true,
  "default_max_slots": null
}
```

## Hallazgos

Cada uno es una línea que esta auditoría cambiaría. Ninguna está cambiada.

1. Alta. `orchestrator/engine.py` líneas 373-403 y 428-454. `review_task` no guarda el SHA revisado. `integrate_task` exige worktree limpio y status `APPROVED`. Un commit nuevo, ya commiteado, sigue limpio y entra en el merge. `approve_task` (406-422) reutiliza `checks` guardados y no vuelve a mirar el diff. No reejecuté ese segundo commit.

2. Alta. `engine.py` 379-396 y 438-444. `review_task` solo acepta `RUNNING`. `integrate_task` solo acepta `APPROVED`. No hay subcomando para salir de `FAILED`, `BLOCKED` o `CONFLICT`. Una tarea sin `--validate` queda `BLOCKED` y `task-add` rechaza el id duplicado (`cli.py` 100-111, `engine.py` 273-274). El reintento que pide la fase de supervisión no existe como comando. Lectura de las guardas; no lancé el segundo `integrate`.

3. Alta. `engine.py` 72-85 y `tests/test_orchestrator.py` 185-189. `forbid` corta tres grafías (`--force`, `--force-with-lease`, `-f`, `reset --hard`, `clean -fd` / `-df`). Pasan `--force-with-lease=main`, `-uf`, `+main`, `--force-if-includes`, `clean -f -d` y `clean --force -d`. El test llama a esas tres formas y se pone verde. El CLI de hoy no arma esos argv; el agujero está en la función compartida. `git push --no-verify` no pasa por el hook. No ejecuté ese push.

4. Alta. `engine.py` 175-184 y 515-521; `cli.py` 67; `engine.py` 552-574. El hijo queda fuera solo si el proceso trae `ORCH_ROLE=child`. `create_worktree` no exporta esa variable. `render_prompt` la escribe como texto. Con id inexistente, `push_base` falla por “no integrada” (`error`) antes de `require_integrator`. El test de las líneas 191-199 acepta cualquier `OrchestratorError`, así que seguiría verde si se quitara la guarda de `integrate_task`. Medí el id inexistente. No medí `push_base` de una tarea ya `MERGED` con el rol child; en esa rama `push_ref` sí llama a `require_integrator`.

5. Media. `cli.py` 67 y `engine.py` 406-425. `--approver` vale `ORCH_APPROVER` o `humano-local`. Un proceso local sin rol child deja `human_approved` en true. La revisión humana es esa cadena.

6. Media. `engine.py` 367-370 y 374-387. `validate_cmd` corre con `shell=True`, sin timeout, dentro de `state_lock`. La evidencia guardada son los últimos 500 caracteres. Quien creó la tarea elige el shell que el integrador ejecuta. No dejé un comando colgado.

7. Media. `engine.py` 199-201 y 19-48, frente a `docs/orchestrator/04-integracion.md` (autenticación, cuentas, llaves, cifrado, migración, infra). Esos paths devolvieron False. `bancos` no coincide con el token `banco`. `crítico` con tilde es riesgo inválido; el código y `docs/orchestrator/plantillas.md` usan `critico`. `02-plan-y-lanzamiento.md` y `04-integracion.md` escriben `crítico`.

8. Media. `cli.py` 122-125 y `engine.py` 506-535. `integrate` hace el merge y después `publish_task`. `publish_task` pushea la rama de trabajo y luego la base. `push_base` es quien exige `MERGED` o `DONE`. Si el push de la base falla, la rama de trabajo ya salió. No simulé un remoto que rechace el segundo push. Este clon sí tiene `origin`; no lo usé.

9. Media. `engine.py` 343-359 y `cli.py` 58-59 y 112-115. `allocate` sin `--max-slots` usa `None` y crea todas las `READY`. `allocate(-1)` y `allocate(0)` no crean nada y salen como “ninguna”. `02-plan-y-lanzamiento.md` pide encolar cuando no hay capacidad. `arquitectura.md` y el comentario de la línea 15 dicen que el cupo lo pasa quien lanza. El default del CLI no encola.

10. Media. `engine.py` 204-210. `overlaps` distingue mayúsculas. En este repo `core.ignorecase` es `true`, así que `Docs` y `docs` no chocan en el estado y en disco son el mismo directorio. `owns` vacío ocupa todo el repo: eso sí está escrito en `arquitectura.md` y en el prompt. `overlaps("", "docs")` también da True.

11. Baja. `engine.py` 132-136. `load_state` hace `json.loads` y no mira `version`. Un JSON roto sale como `JSONDecodeError` y la CLI no lo convierte en código 1. Medido con `{`.

12. Baja. `orchestrator/__main__.py` líneas 1-3. Importar el módulo llama a `main()` y termina el proceso. Medido: exit 2.

13. Baja. `engine.py` 538-547. `install_hooks` pisa `pre-push` sin encadenar otro hook. En este clon el instalado ya es igual al fuente.

14. Baja. `engine.py` 307-341. `git worktree add` ocurre antes de `save_state`. Un corte en medio deja rama y directorio creados con la tarea aún `READY`. No maté el proceso en ese punto.

15. Baja. `inventory.py` 33-45 y 132-137. El inventario lee el home, copia la descripción del frontmatter (240 caracteres) y escribe rutas absolutas. El módulo dice que no guarda secretos ni tokens. No abrí los `SKILL.md` para comprobarlo. `render_markdown` no escapa saltos de línea si el llamador ya no los quitó.

16. Baja. `.gitignore` líneas 1-5. El comentario de `worktrees_ignored` (`engine.py` 125-129) cuadra con el `check-ignore`: hace falta un path interno. `.env` y `.venv` no están ignorados. `.pytest_cache/` no tiene pytest en el repo; los tests son unittest. No borré esa línea.

17. Baja. `tests/test_orchestrator.py` no cubre inventario, códigos de salida del CLI, riesgo con tilde, `max_slots` negativo, el SHA posterior al review, ni las grafías de `forbid` que pasan. Los 16 tests que sí existen pasan.

## Supuestos que el código no declara

1. El hijo es child porque alguien exporta `ORCH_ROLE` en su entorno. El worktree nuevo no lo hace.
2. La cadena `humano-local` cuenta como revisor humano.
3. El comando de `task-add` es de confianza y puede ser un shell.
4. El resultado de `validate_cmd` sigue siendo válido después del merge, y también después de commits posteriores con el árbol limpio.
5. `integrate` no llama a `product_guard`. El master se exige solo si alguien corre ese subcomando.
6. La lista de tokens es el detector completo de paths sensibles. No incluye iban, cuenta, llave, password, cifrado, migración ni infra.
7. El riesgo `critico` va sin tilde.
8. Comparar `owns` es case-sensitive aunque este Git ignore mayúsculas.
9. `allocate` sin número crea un worktree por cada `READY`. Un número negativo es un techo de cero, con exit 0.
10. El orden de `allocate` es el orden de inserción del dict `tasks`.
11. Hace falta Python 3.10+ y un sistema con `fcntl`. Los tests usan el binario `true`. Esta corrida fue Darwin y Python 3.14.5.
12. `forbid` mira el primer argumento y unos tokens exactos. No es un parser de git.
13. El hook pre-push está instalado y nadie pasa `--no-verify`. Este clon lo tiene instalado e idéntico al fuente.
14. `state.json` está bien formado. El campo `version` se escribe y no se lee.
15. Las descripciones de skills y las rutas del home se pueden volcar a un markdown.
16. No hace falta pin de dependencias: el paquete importa la biblioteca estándar.

## Declarado, y la corrida lo confirma

- `DEFAULT_MAX_SLOTS` es `None`. El test de cinco worktrees pasa.
- Sin `validate_cmd`, el review queda `BLOCKED` y no en `PASS`.
- Riesgo `alto`, o un path con token conocido (`auth`, `pago`, `seguridad`, `tenant`), queda en `NEEDS_HUMAN_REVIEW` si el check pasa.
- Un conflicto de merge aborta, deja `CONFLICT` y no mueve el SHA de la base. El test pasa.
- Dos `owns` solapados no corren a la vez. El segundo sigue `READY`.
- `ORCH_ROLE=child` en `integrate_task` de un id inexistente responde `forbidden`.
- `.worktrees/x` está ignorado. `doctor` de este worktree reporta `worktrees_ignored: true`.
- `CANCELLED` y el estado `REVIEW` no se asignan. `arquitectura.md` ya lo dice.

## Bloqueos

- En este worktree `product-guard` está bloqueado: no está `MASTER_PROMPT_FINANCIAL_OPERATIONS.md`. `docs/documento-maestro.md` no lo sustituye. No autoriza cambios de producto.
- No hay workflow de CI. El unittest local no sustituye esa ausencia.
- No hay comando para reintentar `FAILED`, `BLOCKED` o `CONFLICT`.
- No hice push. La tarea de esta revisión lo prohíbe. `origin` existe.

## No ejecutado

No corrí dos `allocate` a la vez, no dejé un `validate_cmd` colgado, no añadí un commit después de `APPROVED` para ver el merge, no reintenté un `CONFLICT`, no hice `git push --no-verify`, no comparé Python 3.9 ni Windows, y no abrí el cuerpo de los skills. El corte a mitad de `worktree add` tampoco está reproducido.
