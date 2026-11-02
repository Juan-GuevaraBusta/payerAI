# Inconsistencias de la documentación del orquestador

Este informe explica dónde el contrato, las fases y el CLI no dicen lo mismo. La comparación es el commit `d14b17e6a9d0b09260ff1cde075c53b089133567`. El motor publica al integrar. `uso.md` y el inventario de sesión todavía describen un repositorio sin commits y sin remoto. El prompt de esta revisión prohíbe el push.

## integrate publica y este prompt lo prohíbe

`integrate` en `orchestrator/cli.py` llama a `integrate_task` y después a `publish_task`. Si las dos terminan, imprime `publicado en origin`.

`publish_task` en `orchestrator/engine.py` ejecuta `git push` de la rama de la tarea y otro `git push` de la rama base. El remoto por defecto es `origin`. Si ese remoto no existe, la función lanza el código `blocked`. `integrate_task` ya guardó el estado `MERGED`.

`docs/orchestrator/arquitectura.md` describe ese orden. `integrate` hace `git merge --no-ff` y después `publish_task`.

`docs/orchestrator/04-integracion.md` pide pushear la rama de trabajo y, tras el merge, la rama principal. El principio 13 de `ORCHESTRATOR.md` dice que un cambio que solo está en local no está terminado.

`docs/orchestrator/02-plan-y-lanzamiento.md` asigna al orquestador el push de las ramas de trabajo y el merge.

`docs/orchestrator/uso.md` muestra `integrate` en un bloque y describe `push` y `push-base` en otro párrafo. No dice que `integrate` ya publica las dos ramas.

El prompt de esta prueba prohíbe push, merge, rebase, reset, clean y checkout. En este checkout `origin` existe. Ejecutar ese `integrate` subiría la rama del agente y la rama base. El contrato y el CLI coinciden. El prompt de la prueba no se puede cumplir con ese comando.

## El repositorio ya tiene commits y remoto

`docs/orchestrator/uso.md` dice que este repositorio todavía no tiene commits, y que `worktree` fallará hasta el primero.

`docs/orchestrator/arquitectura.md` dice que esta copia no tiene remoto y que no se hizo push. La frase está en la sección de integración, junto a la cuenta de `gh`. La primera línea del archivo habla de pruebas en repositorios temporales. La frase sobre el remoto no dice que se refiera a esos repositorios.

`docs/orchestrator/inventario-sesion.md`, con fecha 2026-11-01, dice que la rama `main` no tiene commits y que no hay remoto.

`git rev-list --count HEAD` devuelve 2. `HEAD` y `origin/main` apuntan a `d14b17e6a9d0b09260ff1cde075c53b089133567`. `git remote -v` muestra `origin` en `https://github.com/Juan-GuevaraBusta/payerAI.git`. `refs/remotes/origin/HEAD` es `origin/main`.

Si lees que no hay remoto, no esperas un `git push` al integrar. En este checkout el remoto está, y el CLI publica.

## La cadena de estados no es la del motor

`docs/orchestrator/03-supervision-y-calidad.md` escribe esta cadena. La cadena es `BACKLOG`, `READY`, `RUNNING`, `BLOCKED` o `REVIEW`, `APPROVED`, `MERGED` y `DONE`. Como errores, el archivo lista `FAILED`, `CANCELLED` y `NEEDS_HUMAN_REVIEW`.

`review_task` no escribe `REVIEW` ni `CANCELLED`. Desde `RUNNING` escribe `APPROVED`, `NEEDS_HUMAN_REVIEW`, `FAILED` o `BLOCKED`. `integrate_task` puede escribir `CONFLICT`. `release_worktree` pasa de `MERGED` a `DONE`.

`docs/orchestrator/arquitectura.md` dice que `REVIEW` no se usa como estado intermedio y que `CANCELLED` no se asigna. Esa descripción sigue al motor. La fase 03 todavía nombra `REVIEW` y `CANCELLED`.

En el motor, `NEEDS_HUMAN_REVIEW` es la espera de `approve_task`. La fase 03 lo agrupa con los errores. `integrate_task` lanza `needs_human` solo cuando el estado ya es `NEEDS_HUMAN_REVIEW`, o cuando el diff es sensible y nadie aprobó.

`docs/orchestrator/uso.md` dice que sin esa revisión `integrate` sale con código 2. El CLI devuelve 2 solo para el código `needs_human`. Si la tarea sigue en `RUNNING`, el error es `blocked` y el proceso sale con 3.

Quien busque `REVIEW` en `.orchestrator/state.json` no lo va a encontrar. Quien trate toda salida distinta de 0 como "falta un humano" va a confundir una tarea aún en `RUNNING` con una tarea en `NEEDS_HUMAN_REVIEW`.

## crítico no es un valor de --risk

`docs/orchestrator/02-plan-y-lanzamiento.md`, `docs/orchestrator/03-supervision-y-calidad.md`, `docs/orchestrator/04-integracion.md` y `ORCHESTRATOR.md` escriben `crítico`, con acento.

`add_task` acepta `bajo`, `medio`, `alto` y `critico`. `docs/orchestrator/plantillas.md` y `docs/orchestrator/arquitectura.md` escriben `critico`.

`--risk crítico` lanza `riesgo invalido`. El código de esa excepción es `error`, y el CLI sale con 1.

Copiar `crítico` desde la fase 02 impide crear la tarea. Con esa grafía el riesgo alto no llega a `NEEDS_HUMAN_REVIEW`.

## La protección solo nombra main y master

`ORCHESTRATOR.md`, `docs/orchestrator/01-descubrimiento.md` y `docs/orchestrator/04-integracion.md` piden comprobar el nombre real de la rama por defecto. Dicen que no asumas `main`.

`push_ref` rechaza el push de un agente cuando la ref es `main` o `master`. `orchestrator/hooks/pre-push` rechaza lo mismo para `refs/heads/main` y `refs/heads/master`.

`task-add` usa `main` cuando omites `--base`.

Hoy `origin/HEAD` es `origin/main`, así que el nombre coincide con este remoto. El código no lee `origin/HEAD`. Si la rama base cambia de nombre, el hook deja que un worktree la actualice. El contrato prohíbe ese push para el nombre que hayas comprobado, sea cual sea.

## El hijo no pushea ni su rama

`docs/orchestrator/uso.md` dice que `ORCH_ROLE=child` rechaza integrar y pushear la base.

`require_integrator` también corta `approve_task`, `release_worktree` y `push_ref`. `push_task` pasa por `push_ref`. Un hijo no publica por el CLI la rama de su tarea.

El texto de la excepción es "un agente hijo no integra ni pushea la rama principal". Ese texto sale también cuando el push es el de la rama de trabajo.

`docs/orchestrator/arquitectura.md` dice que solo el proceso sin `ORCH_ROLE=child` puede aprobar, integrar o pushear. No menciona `release`.

`test_child_cannot_integrate_or_push_base` cubre `integrate_task` y `push_base`. No cubre `push_task` ni `approve_task` ni `release_worktree`.

`render_prompt` y la plantilla de `docs/orchestrator/plantillas.md` dicen "No hagas commit ni push a la rama principal." La fase 02 pide commits en la rama del agente. La misma fase prohíbe el commit en la rama principal.

Esa frase admite dos lecturas. Una prohíbe cualquier commit. La otra prohíbe el commit en la rama principal. La primera deja la tarea sin el commit que pide la fase 6. `uso.md` no dice que el CLI le niegue al hijo el push de su propia rama.

## uso.md no nombra status ni worktree

Los comandos del bloque de `docs/orchestrator/uso.md` existen en `orchestrator/cli.py`. `install-hooks`, `push` y `push-base` también existen. `uso.md` los nombra fuera de ese bloque.

El CLI tiene además `status` y `worktree`. `uso.md` no los nombra. `task-add` acepta `--depends`. El ejemplo no lo muestra. La fase 02 exige dependencias en el DAG.

`status` es el comando que imprime el estado que el motor guardó. Sin `--depends`, el ejemplo no arma el DAG de la fase 02.

## La fase 9 pide checks que el CLI no registra

La fase 03 lista formatter, linter, typecheck, tests y build. Define `NOT_RUN`. Dice que no integres si un check esencial está en `NOT_RUN` o en `BLOCKED`. Pide mirar `package.json`, el `Makefile`, el CI y la documentación. Pide no inventar comandos.

`review_task` ejecuta solo `validate_cmd`. El resultado guardado es `PASS`, `FAIL` o `BLOCKED`. No escribe `NOT_RUN`. No abre `package.json`. En este checkout no hay `package.json`, ni `Makefile`, ni `.github`.

`docs/orchestrator/04-integracion.md` dice que prepares un PR cuando el riesgo es alto o crítico. Dice que uses el flujo de PR si GitHub lo exige. El CLI no crea un PR. Después del merge, `publish_task` hace `git push` de la rama base.

Un `integrate` con un solo `validate_cmd` en `PASS` cumple el motor. No recorre la lista de la fase 9. No abre el PR de la fase 10.

Este informe no incluye las reglas de protección de `origin`. El código no tiene un camino de PR aunque esas reglas existan.

## Los títulos viejos no son las fases

El índice de `ORCHESTRATOR.md` numera las fases de 0 a 10. En el mismo archivo, los títulos pasan de la sección 2 a la 14 y luego a la 17.

`docs/orchestrator/01-descubrimiento.md` titula 4.1 y 5.1. `docs/orchestrator/02-plan-y-lanzamiento.md` titula 8.1 y 9.1. `docs/orchestrator/04-integracion.md` titula 13.1. `docs/orchestrator/05-memoria-e-informe.md` titula 15 y 16.

Esos números no están en el índice. Buscar "13.1" en `ORCHESTRATOR.md` no abre la fase 10. El título 13.1 está en `docs/orchestrator/04-integracion.md`. El contrato dice que el índice no sustituye a la fase.

## Los orquestadores de tarea ya están en esta sesión

`docs/orchestrator/asignaciones.md` dice que los once orquestadores no están en el Task tool hasta que Cursor cargue `.cursor/agents/`. Dice también que no se ejecutaron, porque eso empezaría el diseño de producto.

Los once archivos existen bajo `.cursor/agents/`. La skill que cada archivo manda leer es la de la tabla.

En esta sesión los once nombres están en la lista de subagentes. `docs/orchestrator/inventario-sesion.md`, del 2026-11-01, no los incluye. No hay un log versionado que muestre un lanzamiento posterior.

`docs/orchestrator/asignaciones.md` dice que se leyeron 353 `SKILL.md` y 287 nombres distintos. `docs/orchestrator/inventario-sesion.md` dice que el índice tiene 372 filas. La tabla bajo `## Skills` de `docs/orchestrator/inventario-entorno.md` tiene 351 filas y 285 nombres distintos. La cuenta sale de esas filas. Los directorios de skills no se volvieron a recorrer.

`uso.md` manda elegir skills desde ese índice. 372 filas, 353 archivos con 287 nombres, y 351 filas con 285 nombres, son cuentas distintas.

## Puntos que coinciden

- Los enlaces markdown de `ORCHESTRATOR.md`, `README.md`, `docs/README.md`, las fases 01 a 05, `plantillas.md` e `inventario-sesion.md` apuntan a un archivo existente.
- Sin `MASTER_PROMPT_FINANCIAL_OPERATIONS.md`, `product_guard` lanza `blocked` y el CLI sale con 3. El archivo no está en la raíz.
- `approve_task` solo acepta el estado `NEEDS_HUMAN_REVIEW`, como dice `uso.md`.
- `push_base` solo corre si el estado es `MERGED` o `DONE`.
- `DEFAULT_MAX_SLOTS` vale `None`.
- `.worktrees/` y `.orchestrator/` están en `.gitignore`.
- `run_git` rechaza `push --force`, `reset --hard` y `git clean -fd`. El hook rechaza un push que no es fast-forward y un worktree que actualice `main` o `master`.
- Un conflicto llama a `git merge --abort`, deja `CONFLICT` y no cambia el SHA de la base. El lock es `.orchestrator/integrate.lock`.
- Una dependencia pasa a `READY` cuando la previa está `MERGED` o `DONE`.
- La tabla de `asignaciones.md` coincide con la skill que lee cada archivo de `.cursor/agents/`.
- `inventario-entorno.md` no tiene una fila Cloudflare.
- `arquitectura.md` dice 10 CPUs y 16 GB. `sysctl -n hw.ncpu hw.memsize` devuelve 10 y 17179869184. 17179869184 es 16 por 1024 al cubo.
- No hay `package.json`, ni `Makefile`, ni `.github`. El inventario de sesión acierta en eso.
- El CLI no arranca `claude`, `agent`, `opencode` ni `pi`.
- Los nombres de prueba en `tests/test_orchestrator.py` cubren la lista de `uso.md`: worktrees, ownership solapado, merge de riesgo bajo, bloqueo humano, conflicto, árbol sucio, lock, rechazo de `push --force` y push de `main` desde un worktree.
