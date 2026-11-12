# Tarea 05 — Workflows de aprobación

**Estado:** planificación el 2026-11-10; T07 adoptado. Política y presupuesto decididos; faltan cambios materiales, aprobador ausente, timeouts y concurrencia. No adoptada.
**Orquestador:** `.cursor/agents/workflows-aprobacion.md`. Skill: `principle-separate-before-serializing-shared-state`.
**Fuente:** documento maestro, secciones 5.2 (puntos 9–11), 9 y 13.
**Depende de:** [validación](04-validacion-de-facturas.md) y [autoridad](07-autoridad-autonomia-e-ia.md). **Orden acordado:** la autoridad (07) se define antes que este workflow.

## Objetivo

Describir el ciclo configurable de aprobar, rechazar, pedir información o escalar, con trazabilidad. Sin fijar un organigrama único para todas las empresas.

## Plan de cierre (2026-11-10)

Prerrequisito cumplido: T07 adoptado. Decisiones tomadas:

- El workflow reutiliza la versión de política congelada por T04 al iniciar la validación.
- No hay reserva de presupuesto al iniciar; se reevalúa al decidir y se registra consumido/comprometido.

Pendiente antes de adoptar:

1. Lista de cambios materiales que invalidan una aprobación pendiente.
2. Regla de aprobador ausente.
3. Efecto de timeout de solicitud de información.
4. Mecanismo de concurrencia.
5. Relación con quorum y delegación de T13, sin números.

## Decidido

- El workflow es configurable. Las políticas no son las mismas en cada empresa.
- Acciones del MVP: aprobar, rechazar, solicitar información, escalar, y bloquear temporalmente dentro de la autoridad configurada.
- Hace falta evidencia de quién actuó, con qué autoridad, motivo y resultado.
- Puede hacer falta más de un aprobador o un quorum cuando la política lo exija. El algoritmo concreto está abierto.
- Las delegaciones tienen vigencia y alcance.
- Un override humano lleva actor, motivo, fecha y evidencia.
- Segregación de funciones cuando aplique: quien prepara no se aprueba solo si la política lo prohíbe.
- El workflow reutiliza la versión de política congelada por T04 al iniciar la validación.
- No hay reserva de presupuesto al iniciar; se reevalúa al decidir y se registra consumido/comprometido.
- Si después de aprobar cambian la factura, el contrato, los datos bancarios o la política, hay que evaluar invalidar o reaprobar. La regla exacta está abierta; la obligación de evaluarlo no.
- Dos actores o procesos no pueden cerrar la misma operación a la vez sin control de concurrencia.
- El workflow no envía dinero.

## Hipótesis

- Un flujo lineal con escalamiento por monto cubre la demo. Es la hipótesis más simple. Puede ser falsa: el hecho conocido es que las jerarquías varían y hay pagos en serie.
- La espera de una aprobación humana encaja mejor en un proceso durable que en una petición HTTP larga. Sigue siendo hipótesis de mecanismo, no selección de Cloudflare Workflows.

## Abierto

- Modelo exacto de aprobaciones, delegación y quorum.
- Precedencia cuando dos políticas chocan. El requisito es resolver el conflicto de forma explícita; el orden no está elegido.
- Umbrales inclusivos o exclusivos.
- Qué pasa con un aprobador ausente: delegado, revocado o sin permiso. El caso debe tener salida; la salida por empresa no está definida.
- Tiempos de espera y caducidad de una solicitud de información.
- Lista de cambios materiales que invalidan una aprobación pendiente.
- Mecanismo de concurrencia y control de la decisión vigente por operación y versión de evidencia.

## Fuera de esta tarea

- Un diseñador visual genérico de BPM con decenas de tipos de nodo.
- Aprobación automática por un modelo de IA.
- Ejecución bancaria al aprobar.
- Un único flujo fijo de cuatro ojos para todos los tenants.

## Lo que toda transición debe guardar

Según aplique, y sin guardar secretos ni datos personales de más:

- Tenant y operación.
- Documento y versión que se decidió.
- Evidencias y fuentes, incluidas las ausentes.
- Reglas y versión de política evaluadas.
- Resultado de las validaciones.
- Actor o proceso, decisión, motivo y autoridad usada.
- Fecha y estado anterior.
- Si intervino IA: modelo, versión, entradas permitidas y salida estructurada.

Evaluar audit log append-only. Es un requisito de diseño, no una tecnología elegida.

## Concurrencia

Definir, todavía en prosa, qué ocurre si:

- Dos aprobadores actúan a la vez.
- Una política cambia con el workflow abierto.
- El presupuesto se agota o se actualiza durante la espera.
- La factura se modifica después de aprobada.

Ninguna de esas situaciones se resuelve con "gana el último que escribe" sin dejar constancia.

## Entregable

Un ciclo de vida del workflow, configurable, con las cuatro salidas (aprobar, rechazar, pedir información, escalar) y los puntos de bloqueo. Los huecos de quorum y delegación quedan como parámetros abiertos, no como números.

## Criterios de aceptación

- Aprobar no produce un estado de pago confirmado.
- Un actor sin permiso no completa la transición, aunque esté autenticado.
- Una delegación vencida o revocada no sirve.
- El conflicto entre políticas no se esconde: queda explícito y sin resolver numéricamente.
- Cada transición citada puede reconstruirse con la lista de evidencia de arriba.

## Riesgo si se cierra mal

Modelar el workflow como un chatbot que "decide" salta la segregación de funciones y la regla innegociable sobre la IA. Un motor genérico de procesos, antes de conocer quorum y delegación, añade costo y estados que la demo no puede explicar.
