# Tarea 12 — Catálogo de estados y transiciones

**Estado:** discovery. Catálogo conceptual adoptado; no implementar.
**Orquestador:** `.cursor/agents/dominio-estados.md`. Skill: `architect`.
**Fuente:** documento maestro, secciones 5.2, 9 y 13; tareas 01, 05, 07 y 11.
**Depende de:** el modelo de dominio, los workflows de aprobación, la autoridad y los edge cases. No depende de base de datos, proveedor de correo ni frontend.

## Objetivo

Convertir las situaciones que el modelo de dominio ya exige distinguir en un catálogo cerrado de estados, transiciones permitidas, guardas e invariantes. El resultado es un contrato de comportamiento conceptual. No es un esquema de base de datos, ni un enum de implementación, ni una elección de motor de workflows.

La tarea 01 dejó abierto el catálogo cerrado. Esta tarea lo cierra como contrato conceptual adoptado. Los nombres técnicos, el enum de implementación y el esquema de persistencia siguen abiertos.

## Decidido

- Hay que distinguir documento, factura, aprobación, obligación, pago y workflow.
- Aprobación no es pago, instrucción enviada no es pago hecho, procesamiento no es confirmación y timeout no es pago fallido.
- No existe un estado único que signifique a la vez "aprobado" y "pagado".
- En el MVP los estados de movimiento real de dinero no se simulan como si hubieran ocurrido.
- Una factura no se convierte en obligación por el hecho de recibirse ni por aprobarse.
- La IA no ejecuta transiciones por sí sola.
- Cada transición deja evidencia reconstruible.
- Un evento duplicado no crea una segunda decisión ni una segunda operación.
- El catálogo conceptual de estados y transiciones está adoptado; sus nombres son conceptuales.

## Abierto

- Cuándo una factura pasa a ser obligación.
- Si el MVP solo registra el ciclo o también prepara una intención para un sistema externo.
- Quién puede ejecutar cada transición: roles, permisos, segregación y override.
- Quorum, delegación, plazos de espera y caducidad.
- El efecto exacto de un cambio material después de una aprobación: si invalida o exige nueva aprobación. La lista de cambios materiales está adoptada en T05.
- El efecto de un cambio posterior de política o presupuesto sobre una operación ya decidida. El congelamiento al iniciar está adoptado en T04/T05.
- Calibración de severidad y umbrales.
- Mecanismo concreto de concurrencia e idempotencia.
- Representación de pagos parciales y del saldo.
- Retención, borrado y jurisdicción de la evidencia.

## Fuera de esta tarea

- Elegir D1 o PostgreSQL, proveedor de correo, OCR, frontend, modelo de IA o motor de workflows.
- Diseñar tablas, APIs, eventos o un enum de implementación.
- Definir números de quorum, importes, umbrales o plazos.
- Implementar multi-tenancy, autorización o auditoría; las tareas 10 y 07 fijan el comportamiento y este catálogo lo consume.
- Implementar L3 o simular un pago.
- Definir el esquema de identidad y roles.

## Entregable

`docs/modelo/12-estados-transiciones.md` con:

- dimensiones de estado separadas y su composición;
- catálogo cerrado por dimensión, con transiciones permitidas, guardas y autoridad requerida;
- invariantes globales y transiciones prohibidas explícitamente;
- reglas de idempotencia y concurrencia;
- qué estados son alcanzables en el MVP y cuáles quedan reservados;
- puntos abiertos que no cierra.

## Criterios de aceptación

- Toda transición no listada se rechaza; no se completa por conveniencia.
- No existe un estado ni una transición que signifique a la vez "aprobado" y "pagado".
- Aprobar no habilita un estado de pago confirmado.
- Un timeout no produce "fallido" ni "reintentar" sin verificar la fuente de verdad.
- Un documento ilegible no aparece como extraído.
- Un workflow cerrado no revive por un evento tardío o duplicado.
- Una factura modificada después de aprobar deja la aprobación anterior como no vigente para la versión nueva.
- Una operación rechazada no pasa a aprobada sin una nueva decisión registrada.
- Ninguna transición se ejecuta por una salida de IA sola.
- La ausencia de evidencia no aprueba ni rechaza por sí sola.
- La obligación no se declara reconocida sin la decisión que aún está abierta.

## Riesgo si se cierra mal

Un catálogo prematuro que fusione aprobación y pago, o que invente el momento de la obligación, produce una demo que miente sobre dinero, auditoría e idempotencia. Corregirlo después rompe el rastro de decisiones y las pruebas de concurrencia.
