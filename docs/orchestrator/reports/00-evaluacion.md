# Evaluación de la prueba integral

Fecha: 2026-11-02. Rama: `test/orchestrator-integration`. No hubo merge a `main` ni push a `origin`.

`main` y `origin/main` siguen en `d14b17e6a9d0b09260ff1cde075c53b089133567`.

## Procesos

Cinco procesos `agent` (Cursor Agent CLI 2026.10.22-27dcf5f), uno por worktree. Arranque dentro de 17 ms:

| Tarea | PID | Inicio UTC | Commit local | Segundos hasta el commit |
| --- | --- | --- | --- | --- |
| a1-arquitectura | 15157 | 20:58:25.544 | 16:02:51 -0500 | 266 |
| a2-seguridad | 15158 | 20:58:25.551 | 16:07:22 -0500 | 537 |
| a3-calidad | 15159 | 20:58:25.555 | 16:11:08 -0500 | 762 |
| a4-pruebas | 15161 | 20:58:25.558 | 16:00:11 -0500 | 106 |
| a5-docs | 15163 | 20:58:25.561 | 16:09:28 -0500 | 663 |

`ps` a los 8 s mostró los cinco PID vivos, cada uno con `--workspace` de su worktree. Evidencia local: `.orchestrator/probe/ps-snapshot.txt` y `.orchestrator/probe/runs.json`. Esa carpeta está en `.gitignore`.

El lanzador espera con `wait()` en serie. El campo `ended` de a4 y a5 en `runs.json` es la hora en que el padre recogió el proceso, no la hora en que terminó. La hora del commit es la medida de fin de tarea.

## Aislamiento

Worktree y rama propios, creados por `python3 -m orchestrator allocate`. `ORCH_ROLE=child` solo en esos procesos. Cada diff toca un solo path, el de `owns`.

## Integración

`review` dejó cuatro tareas en `APPROVED`. `a2-seguridad` quedó en `NEEDS_HUMAN_REVIEW` porque el path contiene `seguridad`. El diff es solo `docs/orchestrator/reports/02-seguridad.md`. Aprobado por `juan-luis` y fusionado con `integrate_task`. No se llamó a `publish_task`: el subcomando `integrate` del CLI hace push.

Cinco merges `--no-ff`, sin conflicto. SHA final de esta rama, antes de este informe: `63a4db12f47e745968fc394864327d0f03ed1c5e`.

## Pruebas

- `python3 -m unittest tests.test_orchestrator -v`: 16 pruebas, OK.
- `python3 -m unittest discover -s tests/probe -v`: 5 pruebas, OK.
- El `validate_cmd` de los cuatro informes fue `test -s`. Resultado `PASS`. No lee el contenido.
