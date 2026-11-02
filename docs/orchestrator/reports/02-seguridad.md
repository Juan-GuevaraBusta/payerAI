# Auditoría de seguridad del orquestador

Fecha: 2026-11-02. Worktree: `.worktrees/a2-seguridad`. Rama: `agent/a2-seguridad-auditoria-de-seguridad`.

Alcance leído: `orchestrator/engine.py` (`forbid`, `product_guard`, `integrate_task`, `publish_task`, `path_is_sensitive` y el camino que los llama), `orchestrator/hooks/pre-push`, `orchestrator/cli.py`, imports de `orchestrator/` y `tests/test_orchestrator.py`. No hay diff de producto. No se editó código. No se ejecutó ningún `git push`.

## Respuesta corta

Un hijo publica `main` en cuanto falta una de estas tres condiciones a la vez: `ORCH_ROLE=child`, el `git push` sale del worktree enlazado, y Git llega a ejecutar `pre-push`. Con las tres, el hook rechaza `refs/heads/main` y `refs/heads/master`. Sin una de ellas, el código deja pasar el push de la base.

Este clon tiene remoto `origin` hacia `github.com`. La URL no lleva token (comprobado sin imprimirla: sin `userinfo`, sin prefijos `ghp_` / `github_pat_`). `docs/orchestrator/arquitectura.md:64` dice que esta copia no tenía remoto; hoy `git remote` devuelve `origin`.

## Limitación de la skill

Leída completa: `review-security` (`SKILL.md`, 51 líneas). La skill lanza un subagente `security-review` sobre un diff (`branch changes` o `uncommitted changes`). Si ese subagente informa que no hay diff, la skill pide decirlo en una frase y parar.

Esta sesión no tiene diff de producto. El único archivo nuevo es este informe. No se lanzó el subagente y no se simuló su salida. Los hallazgos de abajo son lectura de código y comandos locales, no un resultado de `security-review`.

## H1 — Un hijo publica `main` si no lleva `ORCH_ROLE=child`

- Severidad: alta
- Dónde: `orchestrator/engine.py:175-184`, `orchestrator/engine.py:499-521`, `orchestrator/engine.py:524-534`, `orchestrator/cli.py:122-125`, `orchestrator/engine.py:574`
- Impacto: `child_role()` solo mira `os.environ["ORCH_ROLE"] == "child"`. `require_integrator()` es el único freno de `integrate_task`, `push_ref`, `push_base` y `publish_task`. El orquestador no exporta esa variable al crear el worktree: la escribe como texto del prompt en la línea 574. Quien arranca el proceso sin ella ve `child_role()` en falso y `push_base` llama a `push_ref(..., allow_base=True)`, que acepta `main` y `master`. El subcomando `integrate` del CLI, además, publica enseguida (`cli.py:122-125`).
- Evidencia: con `ORCH_ROLE=child`, `child_role()` es `True`; al borrar la variable, es `False`. El test `tests/test_orchestrator.py:191-198` cubre integrar y `push_base` solo con la variable puesta. No cubre `publish_task` ni el proceso sin la variable.
- Recomendación: que `require_integrator()` rechace también un `git-dir` distinto del `git-common-dir`, el mismo criterio del hook. Que `publish_task` y `push_base` se nieguen si el `pre-push` no está en `git rev-parse --git-path hooks`.

## H2 — `pre-push` no corre si Git no lo invoca

- Severidad: alta
- Dónde: `orchestrator/hooks/pre-push:7-20`, `orchestrator/engine.py:76-78`, `orchestrator/engine.py:538-547`
- Impacto: el script sí corta el caso estrecho. Si `git-dir` y `git-common-dir` difieren, rechaza actualizar `refs/heads/main` y `refs/heads/master` (líneas 15-20). También rechaza borrar cualquier ref (23-26) y un push que no sea fast-forward (27-31). El comentario de la línea 3 dice que esto no sustituye la protección del remoto. `forbid()` no nombra `--no-verify`. `git push -h` documenta `--no-verify` como `bypass pre-push hook`. Un `git` directo no pasa por `forbid()`.
- Evidencia de este worktree:
  - `git-dir` = `.../payerAI/.git/worktrees/a2-seguridad`
  - `git-common-dir` = `.../payerAI/.git`
  - `git --git-dir` apuntando a ese común hace iguales las dos rutas, así que el hook pondría `linked=0` y trataría el push como si saliera del árbol principal.
  - `core.hooksPath` está vacío. `git rev-parse --git-path hooks` apunta a `.../payerAI/.git/hooks`. Ahí `pre-push` existe, modo `755`, 987 bytes, e `diff -u` contra `orchestrator/hooks/pre-push` no muestra diferencias. El directorio de hooks del worktree no tiene copia propia.
  - `create_worktree` no llama a `install_hooks`. En un clon donde nadie ejecutó `install-hooks`, el push directo no tiene este freno. Aquí el hook sí está instalado.
- El test `tests/test_orchestrator.py:227-281` (leído, no reejecutado) cubre el rechazo de un no-fast-forward y de `HEAD:main` desde el worktree, y deja pasar el push de la rama de trabajo.
- Recomendación: rechazar `--no-verify` dentro de `forbid` para el wrapper, e instalar el hook al crear el worktree. Para el `git` directo, proteger `main` en GitHub de forma que las ramas `agent/*` no puedan actualizarla. `docs/orchestrator/arquitectura.md:70` registra que esa protección de rama no está puesta.

## H3 — `forbid()` deja pasar variantes de los comandos que dice prohibir

- Severidad: media
- Dónde: `orchestrator/engine.py:72-85`
- Impacto: el wrapper niega `push --force`, `push --force-with-lease`, `push -f`, `reset --hard` y `clean -fd`. No niega la misma operación partida en argumentos, ni el force por refspec `+`, ni `--no-verify`. Quien use `run_git` puede borrar no-trackeados con directorios o forzar el remoto sin que `forbid` dispare. El hook, si corre, aún puede frenar el no-fast-forward; H2 dice cuándo no corre.
- Evidencia (`python3`, import de `forbid`, sin ejecutar git):

| Argumentos | Resultado |
| --- | --- |
| `push --force origin main` | DENY `forbidden` |
| `push --force-with-lease origin main` | DENY `forbidden` |
| `push -f origin main` | DENY `forbidden` |
| `reset --hard HEAD` | DENY `forbidden` |
| `clean -fd` | DENY `forbidden` |
| `clean -f -d` | ALLOW |
| `clean --force -d` | ALLOW |
| `push origin +main` | ALLOW |
| `push --force-with-lease=main origin main` | ALLOW |
| `push -uf origin main` | ALLOW |
| `push --no-verify origin main` | ALLOW |
| `rebase --onto main` | ALLOW |

`git push -h` muestra `--force-with-lease[=<refname>:<expect>]` y `--force-if-includes`. La condición de las líneas 76-78 compara el argumento entero con `--force-with-lease`, así que la forma con `=` y `--force-if-includes` no entran.

- Recomendación: en `clean`, negar si hay un argumento de fuerza (`-f` o `--force`) y otro de directorios (`-d`), aunque vayan separados. En `push`, negar cualquier argumento que empiece por `+`, que contenga `force`, o que sea `--no-verify`.

## H4 — `integrate_task` fusiona el diff que había en la revisión, no el de ahora

- Severidad: alta
- Dónde: `orchestrator/engine.py:390-393`, `orchestrator/engine.py:445-458`, `orchestrator/engine.py:470`
- Impacto: `review_task` guarda `sensitive_diff` y pasa a `APPROVED` si el riesgo no es `alto` ni `critico` y ningún path de ese momento es sensible. `integrate_task` lee esa bandera y, si el worktree está limpio, hace `git merge --no-ff` de toda la rama. No vuelve a listar archivos, no compara con `owns` y no tiene un SHA de la revisión: `task["sha"]` se escribe después del merge (línea 470). Un commit nuevo entre la revisión y el merge deja el worktree limpio y entra en la base. El estado vive en `.orchestrator/state.json` del árbol que se pasa como `repo`. El worktree se crea en `repo / ".worktrees" / task_id` (`engine.py:330`), así que el mismo usuario puede reescribir ese JSON y marcar `APPROVED` y `human_approved`. `docs/orchestrator/arquitectura.md:68` ya dice que un agente con shell puede escribir fuera de su worktree.
- Recomendación: en `review_task`, guardar el SHA del worktree. En `integrate_task`, recalcular archivos y sensibilidad, exigir ese SHA y volver a `BLOCKED` o `NEEDS_HUMAN_REVIEW` si el HEAD cambió.

## H5 — `owns` no limita lo que se fusiona

- Severidad: alta
- Dónde: `orchestrator/engine.py:322`, `orchestrator/engine.py:390`, `orchestrator/engine.py:455-458`
- Impacto: `owns` solo sirve para no solapar tareas `RUNNING` al crear el worktree, y para el texto del prompt. `review_task` obtiene la lista de archivos (línea 390) y no la cruza con `owns`. El merge de las líneas 455-458 toma la rama entera. Una tarea de riesgo `bajo` con `owns` en `docs/` puede commitear otro path, quedar `APPROVED` y entrar en la base.
- Recomendación: en `review_task` y otra vez en `integrate_task`, rechazar cualquier archivo cuyo path no caiga bajo algún prefijo de `owns`.

## H6 — `path_is_sensitive` solo acierta el segmento exacto, sin acentos

- Severidad: media
- Dónde: `orchestrator/engine.py:19-48`, `orchestrator/engine.py:199-201`
- Impacto: parte el path en minúsculas por lo que no sea `[a-z0-9]` y exige igualdad con `SENSITIVE_TOKENS`. Una `ó` parte la palabra, un nombre pegado no coincide, y `.env`, `password`, `token` o `private_key` no están en el conjunto. Esos paths no piden revisión humana. El contenido del archivo no se mira.
- Evidencia (`path_is_sensitive`, mismo proceso):

| Path | Resultado |
| --- | --- |
| `src/auth/policy.py` | True |
| `src/payments/a.py` | True |
| `docs/pagos.md` | True |
| `src/Auth/session.py` | True |
| `src/cuenta-bancaria.txt` | True (`bancaria`) |
| `src/autorización/roles.py` | False (`ó` parte `autorizacion`) |
| `src/paymentservice.py` | False |
| `.env` | False |
| `config/credentials.json` | False |
| `src/pay.py` | False |
| `src/token.txt` | False |
| `config/password.txt` | False |
| `src/private_key.pem` | False |

- Recomendación: normalizar a forma compatible y quitar marcas (NFKD), comparar el token como subcadena del segmento, y añadir al conjunto `env`, `credential`, `credentials`, `password`, `token`, `private`.

## H7 — `product_guard` no participa en integrar ni en publicar

- Severidad: media
- Dónde: `orchestrator/engine.py:187-196`, `orchestrator/cli.py:91-93`
- Impacto: la función solo comprueba que exista el archivo `MASTER_PROMPT_FINANCIAL_OPERATIONS.md`. Un archivo vacío cumple `is_file()`. El mensaje nombra `docs/documento-maestro.md` y dice que no sustituye ese nombre. El único llamador de producto es el subcomando `product-guard`. `integrate_task` y `publish_task` no la llaman, así que la ausencia del maestro no impide el merge ni el push de la base.
- Evidencia: glob de `MASTER_PROMPT*` en este worktree, 0 archivos. `docs/documento-maestro.md` sí está y, por el código de las líneas 191-192, no cuenta.
- Recomendación: llamar a `product_guard` al entrar en `integrate_task` y en `publish_task`, y rechazar el archivo vacío.

## H8 — La validación de la revisión ejecuta un shell

- Severidad: media
- Dónde: `orchestrator/engine.py:367-368`
- Impacto: `_run_validate` hace `subprocess.run(command, shell=True)` con `task["validate_cmd"]`. Ese texto sale de `--validate` o del JSON de estado. Quien reescribe el estado del integrador (H4) hace que la revisión ejecute un comando con el usuario del integrador. `review_task` no llama a `require_integrator`.
- Recomendación: ejecutar sin shell, con lista de argumentos. No tomar `validate_cmd` del JSON si ese archivo lo puede escribir el worktree.

## H9 — La aprobación humana acepta el revisor por defecto

- Severidad: baja
- Dónde: `orchestrator/cli.py:67`, `orchestrator/engine.py:406-422`
- Impacto: `--approver` vale `ORCH_APPROVER` o, si falta, `humano-local`. `approve_task` exige un texto no vacío y el rol integrador. No distingue a una persona de ese literal. Con eso, `integrate_task` ve `human_approved` y fusiona una tarea de riesgo alto.
- Recomendación: hacer `--approver` obligatorio y rechazar el literal `humano-local`.

## Dependencias: sin hallazgo de paquete externo

Imports de Python en el repo: biblioteca estándar y el propio paquete.

- `orchestrator/engine.py:5-12`: `fcntl`, `json`, `os`, `re`, `subprocess`, `contextlib`, `datetime`, `pathlib`
- `orchestrator/cli.py:5-8`: `argparse`, `json`, `os`, `pathlib`
- `orchestrator/inventory.py:5-9`: `os`, `re`, `shutil`, `subprocess`, `pathlib`
- `orchestrator/__main__.py:1`: `orchestrator.cli`
- `tests/test_orchestrator.py:1-7`: `os`, `subprocess`, `sys`, `tempfile`, `time`, `unittest`, `pathlib`

`find` de `requirements*.txt`, `pyproject.toml`, `Pipfile`, `Pipfile.lock`, `poetry.lock`, `uv.lock`, `setup.py`, `setup.cfg`, `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `Cargo.lock` y `go.sum`: sin resultados. No hay lockfile que revisar ni dependencia de terceros que fijar.

## Secretos hardcodeados: sin hallazgo

No aparece una credencial en el árbol de este worktree.

- Búsqueda de `AKIA…`, `ghp_`, `github_pat_`, `sk-ant-`, `sk-proj-`, `xox[baprs]-`, `BEGIN … PRIVATE KEY`, `aws_secret_access_key` y `AIza…`: sin coincidencias.
- Asignaciones en `*.py` de `password`, `api_key`, `apikey`, `secret` o `token` a un literal: sin coincidencias.
- `find` de `.env`, `.env.*`, `credentials.json`, `*.pem` e `id_rsa`: sin resultados.
- La URL de `origin` no lleva token embebido.
- `orchestrator/engine.py:42-45` usa las palabras `secret` y `secreto` como tokens de path. `docs/orchestrator/arquitectura.md:64` dice que el token de `gh` no se copió. `orchestrator/inventory.py:1` declara que el inventario no guarda secretos. Esas menciones no son un secreto.

## Supuestos

- El amenaza considerado es un agente hijo con shell y el mismo usuario del integrador, que puede no seguir el prompt. No se modeló un atacante con otro usuario del sistema.
- `ORCH_ROLE=child` es cooperación del proceso, no una frontera del sistema operativo.
- El hook instalado en el git común es el que este worktree usaría, porque `git rev-parse --git-path hooks` apunta ahí.
- No se reejecutó `tests/test_orchestrator.py`. Lo citado de tests es lectura.
- No se llamó a `git push`, ni con `--no-verify`, ni contra `origin`.

## Bloqueos

- Skill `review-security`: no había diff de producto. No se lanzó `security-review`. Este informe no es su salida.
- No se modificó código del orquestador. Los huecos H1–H9 siguen abiertos.
- La protección de rama en el remoto no se comprobó en GitHub. El documento de arquitectura dice que no está.
