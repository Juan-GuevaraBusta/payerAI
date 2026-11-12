# Tarea 06 — Spend intelligence

**Estado:** adoptado el 2026-11-10. Módulo B en el MVP solo con ahorro potencial; validado y realizado no se registran. Umbrales y fuentes abiertos. No implementar.
**Orquestador:** `.cursor/agents/spend-intelligence.md`. Skill: `show-me-your-work`.
**Fuente:** documento maestro, sección 5.2, módulo B.
**Depende de:** facturas y documentos ya modelados en las tareas 01 y 04. No depende de bancos ni de un IdP.

## Objetivo

Definir recomendaciones justificadas sobre gasto recurrente. Separar lo que una factura puede probar de lo que solo prueba un dato de uso.

## Decisión adoptada (2026-11-10)

- El MVP emite solo ahorro potencial, con fuentes, cálculo, periodo y supuestos.
- El MVP no registra ahorro validado ni realizado; quedan como definiciones.
- El módulo no cancela, modifica ni contrata servicios.
- Una recomendación sin evidencia mínima no se emite o se emite como pregunta.
- No se declara una licencia sin uso sin evidencia verificable.
- Dos herramientas parecidas quedan como superposición aparente, no como redundancia.
- Cada recomendación usa solo datos del tenant actual.
- Quedan abiertos: umbrales, recurrencia mínima, tolerancia de fechas, comparabilidad, tasas, fechas de compromiso y retención.

## Decidido

El MVP puede:

- Identificar pagos, facturas, renovaciones y suscripciones recurrentes.
- Detectar aumentos de precio y cambios de condiciones.
- Señalar servicios con funciones aparentemente superpuestas.
- Detectar servicios o pagos duplicados.
- Comparar costos y condiciones solo cuando los datos sean comparables.
- Recomendar consolidación o alternativa y estimar ahorro.
- Seguir renovación, vencimiento, cancelación y compromisos contractuales.

El MVP no puede:

- Cancelar, modificar ni contratar servicios.
- Declarar una licencia sin uso solo porque llegaron facturas.
- Tratar dos herramientas parecidas como redundantes sin mirar departamento, usuarios o necesidad.
- Presentar un ahorro potencial como ahorro validado o realizado.

Definiciones obligatorias:

- Potencial: estimación pendiente de validación.
- Validado: la empresa confirmó la oportunidad.
- Realizado: la reducción ocurrió y se pudo comprobar.

El MVP emite solo ahorro potencial; no registra ahorro validado ni realizado.

## Hipótesis

- La recurrencia se puede proponer con proveedor, importe, moneda y periodicidad observados en facturas. Es una señal, no una suscripción confirmada.
- Las oportunidades más defendibles en una demo son duplicado de pago, aumento de precio y renovación próxima. La superposición de productos es más débil si no hay catálogo de funciones. Hipótesis de prioridad, no decisión de producto.

## Abierto

- Fuente de fechas de cancelación y de compromiso si no están en el contrato.
- Cuándo y cómo se registrará un ahorro validado fuera del MVP, y quién podrá confirmarlo.
- Integración futura con identity providers o sistemas de uso. No es MVP.
- Umbral a partir del cual un aumento de precio es hallazgo.

## Fuera de esta tarea

- Ejecutar la baja de una suscripción.
- Inferir usuarios activos desde el importe de la factura.
- Ranking de "desperdicio" sin evidencia.
- Mezclar este módulo con Accounts Receivable.

## Qué evidencia sostiene cada recomendación

| Recomendación | Evidencia mínima | No usar como prueba |
| --- | --- | --- |
| Recurrencia | Repetición de proveedor, concepto, importe o periodicidad en documentos del tenant | Un único cargo |
| Aumento de precio | Dos importes comparables del mismo compromiso, con fechas | Monedas distintas sin tasa y fecha |
| Duplicado de servicio o pago | Dos obligaciones que el diseño de duplicados ya marcó, o dos contratos vigentes solapados | Nombres parecidos sin más señal |
| Superposición aparente | Descripción comparable de función, más el hueco de para qué área sirve cada una | El parecido solo |
| Licencia no usada | Evidencia verificable de uso o de no uso | Correo, factura o contrato |
| Ahorro potencial | Cálculo mostrado, fuentes y supuestos | Llamarlo ahorro logrado |

Si falta la evidencia de la fila, la recomendación no se emite o se emite como pregunta, no como hallazgo cerrado. No rellenar el hueco.

## Entregable

Un catálogo corto de tipos de recomendación, cada uno con evidencia mínima, supuesto explícito y clase de ahorro. En el MVP solo se emite ahorro potencial; validado y realizado quedan como definiciones, porque el MVP no ejecuta ni registra la reducción.

## Criterios de aceptación

- Ninguna recomendación cancela un servicio.
- Ninguna licencia figura como no usada sin fuente de uso.
- Dos herramientas parecidas quedan como superposición aparente, con la posibilidad de que sirvan a necesidades distintas.
- El cálculo del ahorro potencial enseña las fuentes y lo que no se pudo comparar.
- Los datos de un tenant no entran en la recomendación de otro.

## Riesgo si se cierra mal

Una demo que promete ahorro realizado, o licencias ociosas, sin evidencia, no es presentable a un equipo financiero. Daña la credibilidad más que no mostrar el módulo B.
