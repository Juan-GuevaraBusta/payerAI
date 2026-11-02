# Fases 4 a 6 — DAG, asignación y aislamiento

Lee [ORCHESTRATOR.md](../../ORCHESTRATOR.md) y completa las Fases 0 a 3 antes de este documento.

## Fase 4 — Descomposición de tareas y DAG

Antes de lanzar agentes, divide la solicitud en unidades concretas. Usa la ficha de [plantillas.md](plantillas.md).

Cada tarea incluye:

- ID y título.
- Objetivo verificable.
- Contexto del producto y archivos relevantes.
- Criterios de aceptación medibles.
- Dependencias y tareas bloqueantes.
- Agente y runtimes candidatos.
- Skills necesarias.
- Archivos y directorios que puede editar.
- Archivos y directorios que no debe editar.
- Tests y comandos de validación requeridos.
- Riesgo: `bajo`, `medio`, `alto` o `crítico`.
- Entregable esperado: commit, diff, test, informe, ADR u otro.

Representa las dependencias como un DAG. Ejecuta en paralelo solo las tareas sin dependencia real entre sí. Si varias tareas deben modificar los mismos archivos, asígnalas al mismo agente, define un único propietario de esos archivos o serialízalas.

No dividas una tarea solo por cantidad de archivos. Divide por límites de responsabilidad, contratos claros y resultados verificables. Antes de delegar cambios en interfaces compartidas, define los contratos entre módulos. Así evitas implementaciones incompatibles.

## Fase 5 — Asignación y lanzamiento

### 8.1 Principio de asignación

Selecciona el agente según evidencia de capacidad, no por preferencia fija. Roles posibles:

- Arquitecto o planner: requisitos, diseño y dependencias. Al inicio, solo lectura.
- Backend implementer.
- Frontend implementer.
- Database engineer.
- Cloud o platform engineer.
- QA o test engineer.
- Security reviewer.
- Code reviewer independiente.
- Documentación o ADR.
- Researcher para documentación oficial y comparación de alternativas.

Un agente puede asumir varios roles si es razonable. No lances varios agentes para la misma modificación sin un motivo, por ejemplo comparar dos enfoques.

### 8.2 Prompt de cada subagente

Cada agente hijo recibe:

1. El contexto relevante de `MASTER_PROMPT_FINANCIAL_OPERATIONS.md`.
2. Las instrucciones del repositorio.
3. La descripción precisa de su tarea.
4. Las skills seleccionadas y las instrucciones necesarias.
5. Su rama y su worktree exclusivos.
6. Límites de archivos y permisos.
7. Criterios de aceptación y comandos de test.
8. Instrucciones para reportar supuestos, decisiones, archivos modificados, tests, riesgos y bloqueos.

El agente hijo no modifica archivos fuera de su alcance. No altera contratos compartidos sin coordinación. La plantilla de despacho está en [plantillas.md](plantillas.md).

### 8.3 Concurrencia dinámica

- No impongas un límite fijo de tres agentes.
- Calcula la concurrencia útil según tareas independientes, agentes realmente disponibles, cuotas, CPU, RAM, rate limits y capacidad de revisión.
- Mantén una cola de tareas `READY`. Asigna trabajo nuevo cuando un agente termine.
- Si hay más tareas que capacidad, encola. No pierdas el seguimiento. No lances procesos ilimitados.
- Prioriza tareas que desbloqueen a otras y tareas con baja probabilidad de colisión.
- Evita saturar el equipo con builds o test servers duplicados. Aísla puertos, bases de datos locales, caches y archivos temporales cuando corresponda.
- No permitas que una tarea dependiente empiece con contratos inexistentes o inestables.

## Fase 6 — Git worktrees, branches y ownership

### 9.1 Estado inicial

Antes de crear ramas:

- Comprueba la rama actual, `git status`, remotes y default branch.
- Protege los cambios no committeados del usuario.
- Obtén la versión más reciente del remoto cuando sea seguro.
- No asumas que la rama objetivo se llama `main`. Si el usuario pidió `main`, comprueba que exista y que sea la rama principal real.

### 9.2 Una tarea, una rama, un worktree

Para cada agente que edite código:

- Crea una rama única. Ejemplos: `agent/<task-id>-<short-description>` o `feat/<task-id>-<short-description>`.
- Crea un Git worktree exclusivo desde la base acordada.
- No compartas el mismo directorio de trabajo entre agentes.
- Registra qué agente es propietario de cada rama y de cada conjunto de archivos.
- No permitas que un agente haga checkout de la rama de otro.
- Cada agente genera commits pequeños y descriptivos cuando su tarea esté completa.

Si Git worktrees no son compatibles con el runtime, usa clones o entornos aislados equivalentes. No simules aislamiento cuando todos escriben en la misma carpeta.

### 9.3 Los agentes hijos nunca escriben en la rama principal

Los agentes hijos trabajan solo en sus branches. No deben:

- Hacer commit directamente en la rama principal.
- Hacer push directamente a la rama principal.
- Hacer merge de otras ramas.
- Hacer force-push.
- Cambiar protecciones del repositorio.

El orquestador es el único integrador. Puede hacer push de las ramas de trabajo y fusionarlas en secuencia cuando se cumplan los criterios de aceptación y el repositorio lo permita. El procedimiento está en [04-integracion.md](04-integracion.md).
