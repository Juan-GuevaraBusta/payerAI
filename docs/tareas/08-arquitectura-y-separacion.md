# Tarea 08 — Arquitectura y separación

**Estado:** discovery. Hay módulos conceptuales. No hay arquitectura concreta ni stack de frontend.
**Fuente:** documento maestro, secciones 10, 12 y 15.
**Depende de:** las tareas 01 a 07 para saber qué responsabilidades son reales. No al revés: no inventar servicios y luego buscarles un uso.

## Objetivo

Fijar fronteras de responsabilidad sin elegir microservicios, agentes, bus de eventos ni base vectorial. La forma concreta se elige cuando haya requisitos medibles.

## Decidido

- Empezar modular. La opción inicial por defecto es un modular monolith o equivalente, salvo evidencia contraria.
- No introducir microservicios, varios agentes, event bus ni base vectorial sin un requisito concreto.
- No usar un agente autónomo para un trabajo que una regla puede hacer.
- Separación:
  - La IA interpreta o señala anomalías.
  - El código determinista calcula, compara y aplica reglas y transiciones.
  - La autorización comprueba permisos.
  - El workflow coordina humanos y etapas.
  - La ejecución solo hace acciones ya autorizadas. En el MVP no mueve dinero.
- Módulos conceptuales: Ingestion, Document Intelligence, Deterministic Core / Rules, Decision, Authorization, Workflow, Execution, Spend Intelligence, Audit & Compliance.
- Esos nombres son responsabilidades. No son repositorios, workers ni colas ya decididas.

## Hipótesis

- Un solo deploy con módulos internos cubre la demo y el primer piloto. Reversible si aparecen límites medidos de aislamiento, escala o tiempo de espera.
- Execution puede existir como interfaz vacía que se niega a correr, para no simular un pago. Alternativa: no crear el módulo hasta que exista una integración. La segunda es más pequeña. Recomendación: no crear Execution hasta que un modo de la sección 9 sea alcance real. Hasta entonces, el workflow termina en "aprobado / rechazado / pendiente", nunca en "enviado".

Esa recomendación no cambia la decisión de contemplar Execution en la evolución del producto.

## Abierto

- Arquitectura concreta.
- Stack de frontend.
- Dónde corre cada responsabilidad dentro de Cloudflare o fuera.
- Si hace falta cola o workflow durable. Solo si hay una espera, un reintento o un trabajo que no cabe en la petición.

## Fuera de esta tarea

- Diagramas de Kubernetes, mallas de servicios o un agente por módulo.
- Elegir framework de UI.
- Partir el código en repos.
- Añadir un vector store "por si hay RAG".

## Responsabilidad por módulo

| Módulo | Hace | No hace |
| --- | --- | --- |
| Ingestion | Recibe mensaje, carga o evento y lo identifica | No valida la obligación ni aprueba |
| Document Intelligence | Clasifica, extrae, normaliza y vincula | No aplica autoridad ni inventa campos |
| Rules | Duplicados exactos, importes, límites, transiciones | No interpreta prosa ambigua si una regla no alcanza |
| Decision | Arma una decisión estructurada con reglas y señales | No se otorga permisos |
| Authorization | Dice si ese actor puede esa acción en ese tenant | No interpreta la factura |
| Workflow | Espera, escala, delega, pide datos, reanuda | No envía pagos |
| Execution | En el futuro, prepara o envía lo ya autorizado y verifica | No existe como pago real en el MVP |
| Spend Intelligence | Recomienda con evidencia | No contrata ni cancela |
| Audit | Conserva la reconstrucción de la decisión | No guarda secretos ni datos personales de más |

## Criterio para complicar el diseño

Hace falta un requisito medible antes de añadir un componente. Ejemplos que sí podrían justificarlo más adelante, y que hoy no están medidos:

- Una espera humana que no cabe en una petición.
- Un fallo parcial que exige reintento con idempotencia.
- Un pico de documentos que no cabe en el tiempo de la petición.
- Un aislamiento que un solo proceso no puede garantizar.

Mientras eso no esté medido, la alternativa más simple gana.

## Entregable

Un mapa de una página con las nueve responsabilidades, las dependencias entre ellas y la lista de componentes que explícitamente no se adoptan todavía.

## Criterios de aceptación

- Ningún módulo de IA aparece con permiso de aprobar.
- Execution no figura como transferencia del MVP.
- El mapa no nombra microservicios desplegables ni un bus.
- Cada componente de infraestructura que alguien quiera añadir tiene el hueco que vendría a cubrir, o no se añade.
- El frontend queda sin stack.

## Riesgo si se cierra mal

Nueve servicios en red cuestan más, fallan de más formas y no mejoran la demo. Una base vectorial no resuelve duplicados exactos ni autoridad.
