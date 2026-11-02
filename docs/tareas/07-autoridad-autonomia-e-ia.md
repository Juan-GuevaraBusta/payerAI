# Tarea 07 — Autoridad, autonomía e IA

**Estado:** discovery. Los límites de autoridad están decididos. Los modelos y JEV no.
**Fuente:** documento maestro, secciones 9 y 11.
**Depende de:** [validación](04-validacion-de-facturas.md) y [workflows](05-workflows-de-aprobacion.md).

## Objetivo

Dejar escrito qué puede proponer un modelo, qué decide una regla y quién tiene autoridad. Cerrar la puerta a que la IA se autorice a sí misma.

## Decidido

- Autonomía avanzada, configurable por empresa, sujeta a política verificable.
- Excepciones con tratamiento híbrido según gravedad.
- Niveles L0 Observar, L1 Decidir, L2 Actuar, L3 Ejecutar.
- La empresa configura el nivel según tipo de operación, monto, moneda, proveedor, departamento, presupuesto, riesgo y permisos.
- El MVP puede vivir en L0–L2 para administrar el ciclo y registrar estados. L3 no mueve dinero en el MVP.
- Dos modos futuros, no actuales: dejar la operación lista para un banco, o enviar una instrucción por integración autorizada.
- Regla innegociable: un modelo de IA no recibe autoridad, no eleva sus permisos y no autoriza solo una operación financiera.
- La autoridad sale de políticas, permisos verificables, segregación de funciones y controles técnicos independientes.
- Orden de preferencia: código determinista, modelo ligero, evaluador estructurado si está verificado, modelo capaz solo en ambigüedad real, humano si falta evidencia o el riesgo es alto.
- JEV no está aprobado. Hay que inspeccionar implementación, API, licencia y costo reales antes de usarlo. No inventar métodos ni precios.
- Si se usa IA, registrar modelo, versión, entradas permitidas, salida estructurada, evidencias y política aplicada.
- Un puntaje no sustituye reglas duras, identidad, autoridad ni verificación de pago.
- Un modelo no reduce solo la severidad.

## Hipótesis

- En la demo, casi todas las facturas sintéticas se resuelven en L0 y L1, con L2 solo en reglas triviales ya configuradas. Es una hipótesis de alcance de demo, reversible.
- Hace falta un modelo para clasificar el tipo de correo. Puede ser falso: unas reglas sobre remitente, asunto y adjuntos quizá basten. Medir antes de asumirlo.

## Abierto

- Qué modelo, si alguno, y la política de escalamiento.
- Si JEV existe en una forma utilizable, con qué licencia y a qué costo.
- Umbrales de riesgo.
- Qué combinación de atributos sube o baja el nivel de autonomía permitido. Los ejes están decididos; los valores no.
- Esquema de roles que alimenta la autorización.

## Fuera de esta tarea

- Un agente autónomo que lea el correo y pague.
- Enviar todas las facturas a un LLM.
- Elegir un proveedor de inferencia de pago sin dejar el costo por escrito.
- Dar a un prompt de sistema el texto del correo del proveedor.

## Reparto

| Pregunta | Quién la responde |
| --- | --- |
| ¿El importe cuadra con el contrato disponible? | Código determinista |
| ¿Es el mismo archivo otra vez? | Código determinista |
| ¿Este actor puede aprobar este monto? | Motor de autorización, con política y permisos |
| ¿Este texto parece una factura, una nota crédito o una respuesta? | Regla si basta. Modelo ligero solo si no basta. |
| ¿La diferencia de USD 2.000 es fraude? | Nadie de forma automática. Hallazgo y, si aplica, humano. |
| ¿Se envía el pago? | Nadie en el MVP. En el futuro, solo el motor de ejecución con una autorización previa ya registrada. |

## Severidad conceptual, sin calibrar

- Informativa: formato, sin impacto material.
- Baja: falta documentación o aclaración no crítica.
- Media: diferencia de factura y contrato, o condición que pide confirmación.
- Alta: posible duplicado, proveedor nuevo no validado, cambio sensible.
- Crítica: señal de fraude, manipulación o intento de saltarse controles.

Acciones posibles: corregir un dato no crítico, pedir información, escalar, bloquear un tiempo o suspender para revisión especializada. Cuál corresponde a cada nivel numérico no está calibrado. No asignar importes en esta tarea.

## Entregable

Una matriz nivel de autonomía por tipo de acción, más la lista de acciones prohibidas para cualquier modelo. JEV queda como pregunta de evaluación, con los chequeos del documento maestro, sin API inventada.

## Criterios de aceptación

- No hay acción de aprobar cuyo único fundamento sea la salida de un modelo.
- L3 aparece como evolución, no como comportamiento del MVP.
- La matriz no elige vendor de modelo ni afirma precios.
- Prompt injection queda remitido a la tarea de edge cases: el documento no es política.
- Queda un registro mínimo obligatorio para cada uso de IA.

## Riesgo si se cierra mal

Un agente que "resuelve" la factura de punta a punta es más simple de demo y contradice autoridad, segregación y costo. No hacerlo.
