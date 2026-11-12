# Tarea 08 — Arquitectura y separación

**Estado:** adoptado el 2026-11-10. Responsabilidades y fronteras fijadas; no hay módulo Execution en el MVP. Arquitectura concreta, frontend y proveedores abiertos. No implementar.
**Orquestador:** `.cursor/agents/arquitectura-separacion.md`. Skill: `how`.
**Fuente:** documento maestro, secciones 10, 12 y 15.
**Depende de:** las tareas 01 a 07 para saber qué responsabilidades son reales. No al revés: no inventar servicios y luego buscarles un uso.

## Objetivo

Fijar fronteras de responsabilidad sin elegir microservicios, agentes, bus de eventos ni base vectorial. La forma concreta se elige cuando haya requisitos medibles.

## Decisión adoptada (2026-11-10)

- Se adoptan las nueve responsabilidades, sus dependencias sin ciclos y las fronteras que no se colapsan.
- La opción inicial es modular monolith o equivalente; no se añaden microservicios, bus, colas, durable, vector store ni agentes sin requisito medido.
- `Execution` no se crea en el MVP: no hay módulo, interfaz vacía ni simulación. El workflow termina en aprobado, rechazado o pendiente.
- D1 es el default de demo; PostgreSQL serverless es la salida para piloto o producción.
- La ruta de IA es T0–T4 y la validación/workflow usan la política congelada de T04.
- Quedan abiertos: arquitectura concreta, frontend, base de piloto/producción, cola/durable, correo, OCR, modelos, JEV e integraciones.

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
- No se crea `Execution` hasta que L3 sea alcance real. Decidido: no hay módulo, interfaz vacía ni simulación; el workflow termina en aprobado, rechazado o pendiente, nunca en enviado. La frontera se contempla en la evolución del producto.

## Abierto

- Arquitectura concreta.
- Stack de frontend.
- Dónde corre cada responsabilidad dentro de Cloudflare o fuera.
- Migración de D1 a PostgreSQL serverless y criterios de disparo.
- Si hace falta cola o workflow durable. Solo si hay una espera, un reintento o un trabajo que no cabe en la petición.
- Proveedor de correo, OCR, modelos, JEV e integraciones futuras.

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
| Execution | Frontera futura para preparar o enviar lo ya autorizado y verificar | No se crea como módulo, interfaz vacía ni pago real en el MVP |
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
