# Plantillas de orquestación

Copias de trabajo viven en `.orchestrator/` y no se versionan si contienen estado de una ejecución. No pegues secretos, tokens ni datos reales de clientes.

## Inventario de runtime

```md
## Runtime: <nombre>
- Version comprobada:
- Invocacion: subagent | cli | api | mcp | app | cloud
- Comando de comprobacion:
- Edita archivos: si | no
- Ejecuta comandos: si | no
- Tests: si | no
- Git: si | no
- Headless: si | no
- Worktrees: si | no | no comprobado
- Sesiones paralelas: si | no | no comprobado
- Auth observable: <requisito, sin secretos>
- Limites comprobados: <cuota, rate limit, costo o "no verificable">
- Util para:
- Limitacion:
- Estado: disponible | disponible parcialmente | no autenticado | incompatible | no instalado
```

## Inventario de skill

```md
## Skill: <nombre>
- Ruta exacta:
- Proposito:
- Instrucciones obligatorias:
- Herramientas requeridas:
- Limites:
- Referencias leidas:
- Aplica a tareas:
```

## Ficha de tarea

```md
## Tarea <id>: <titulo>
- Estado: BACKLOG
- Objetivo verificable:
- Contexto y archivos relevantes:
- Criterios de aceptacion:
- Depende de:
- Desbloquea:
- Runtime candidato:
- Skills y por que:
- Puede editar:
- No puede editar:
- Contratos compartidos que debe respetar:
- Comandos de validacion:
- Riesgo: bajo | medio | alto | critico
- Entregable:
- Rama:
- Worktree:
- Owner:
```

## Prompt de agente hijo

```md
# Tarea <id>

Lee el contexto de producto que se adjunta. No contradigas MASTER_PROMPT_FINANCIAL_OPERATIONS.md.

## Tarea
<objetivo y criterios de aceptacion>

## Skills obligatorias
<ruta e instrucciones que debe seguir>

## Aislamiento
- Rama exclusiva: <rama>
- Worktree exclusivo: <ruta>
- Puedes editar solo: <paths>
- No edites: <paths>
- No hagas commit ni push a la rama principal.
- No hagas merge, force-push ni cambies protecciones.
- No alteres contratos compartidos: <contratos>

## Validacion
<comandos exactos del repositorio>

## Reporte
Devuelve: supuestos, decisiones, archivos modificados, commits, tests con resultado, riesgos y bloqueos.
No declares la tarea terminada sin el entregable y el resultado de los tests.
```

## Registro de check

```md
| Check | Comando | Resultado | Evidencia |
| --- | --- | --- | --- |
| <nombre> | <comando real o "no existe"> | PASS \| FAIL \| NOT_RUN \| BLOCKED | <salida corta o motivo> |
```

## Informe final

```md
# Informe de orquestacion — <fecha>

## 1. Objetivo
## 2. Inventario usado
## 3. Plan y concurrencia real
## 4. Cambios por modulo y agente
## 5. Calidad
## 6. Git
- Ramas:
- Pushes:
- PRs:
- Merges:
- SHA de la rama principal:
## 7. Riesgos y decisiones pendientes
## 8. Trabajo no completado
- Causa:
- Proximo paso:
```
