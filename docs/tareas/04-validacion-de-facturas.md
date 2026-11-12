# Tarea 04 — Validación de facturas

**Estado:** adoptado el 2026-11-10; política congelada al iniciar y confirmación en tarea del workflow. Umbrales y tasas abiertos. No implementar.
**Orquestador:** `.cursor/agents/validacion-facturas.md`. Skill: `principle-explain-the-number`.
**Fuente:** documento maestro, secciones 5.2 (módulo A), 8 y 13.
**Depende de:** [dominio](01-modelo-de-dominio-y-estados.md), [ingesta](02-ingesta-correo-y-documentos.md) y [proveedores](03-proveedores-identidad-y-autorizacion.md).

## Objetivo

Definir cómo una solicitud de pago se contrasta con historial, contrato, confirmación interna y política, sin inventar la evidencia que falte.

## Decisión adoptada (2026-11-10)

- La validación congela la versión de política y presupuesto al iniciar. Un cambio posterior se registra y puede exigir una nueva validación.
- La confirmación interna se registra como tarea del workflow con actor, fecha, pregunta y contenido. El correo solo notifica.
- Quedan abiertos: umbrales de duplicado y exceso, tasas y fechas de cambio, plazo y destinatario de la confirmación.

## Decidido

Orden base:

1. Extraer y normalizar la factura.
2. Comparar con historial de facturas, proveedores, documentos y pagos disponibles.
3. Contrastar el contrato o las condiciones comerciales si esa fuente existe: importe, moneda, vigencia, periodicidad, conceptos, límites y condiciones.
4. Pedir confirmación al departamento responsable si hay servicios adicionales, diferencias no explicadas o evidencia insuficiente.
5. Aplicar reglas, presupuestos, límites y autorizaciones configurados.

También decidido:

- Duplicado exacto y duplicado semántico o parcial son hallazgos distintos.
- Una diferencia contra el contrato no se clasifica sola como fraude ni como cargo legítimo.
- La ausencia de datos es ausencia de evidencia.
- Cálculos, comparaciones, duplicados exactos y límites son trabajo determinista. Un modelo no los sustituye.
- Un modelo no baja la severidad de una alerta.

## Hipótesis

- Muchas facturas del primer demo traerán pocos campos estructurados y ningún contrato. El sistema debe seguir siendo útil: muestra qué falta, no finge una validación completa.
- La confirmación interna se registra como tarea del workflow; falta definir plazo y destinatario exacto.

## Abierto

- Umbrales de duplicado probable, de exceso sobre contrato y de severidad.
- De dónde salen contratos y presupuestos, y con qué detalle.
- Tasas y fechas de conversión entre monedas. El caso existe; la fuente de la tasa no.
- Plazo y destinatario exacto de la confirmación interna.
- Efecto de un cambio de política o presupuesto durante una validación ya iniciada.

## Fuera de esta tarea

- Aprobar la factura. Eso es workflow y autoridad.
- Rechazarla solo porque no hay contrato.
- Completar campos vacíos con un LLM y tratarlos como leídos del documento.
- Consultar un ERP que el MVP no integra.

## Resultado de cada paso

Cada paso devuelve evidencia, no un sí o no global.

| Paso | Si hay datos | Si no hay datos |
| --- | --- | --- |
| Extracción | Campos normalizados y origen | Lista de campos no disponibles. Sin relleno. |
| Historial | Coincidencias, duplicados exactos, candidatos parciales | "Sin historial comparable". No es aprobado. |
| Contrato | Diferencias de importe, moneda, vigencia, periodicidad, concepto o límite | "Sin fuente contractual". No es incumplimiento ni conformidad. |
| Confirmación interna | Solicitud al departamento si la discrepancia o la evidencia lo exigen | No se inventa la respuesta del departamento. |
| Políticas | Reglas que aplican y las que no se pudieron evaluar | "Política o presupuesto no configurado". No se asume un límite. |

Ejemplo obligatorio: factura USD 10.000, contrato mensual USD 8.000. Hallazgo de diferencia. Pedir evidencia o confirmación. Severidad conceptual de partida: media, porque es una diferencia que requiere confirmación. No subirla a crítica ni bajarla a informativa sin una regla o un humano. La calibración fina sigue abierta.

## Duplicados

- Exacto: mismas señales fuertes ya definidas en el diseño (como mínimo, documento equivalente, o mismo proveedor, número e importe cuando esas señales existan). La clave definitiva se cierra con la tarea de edge cases.
- Probable: variaciones pequeñas. Es un hallazgo, no un descarte automático.
- Mismo archivo con otro nombre: duplicado de documento, no otra factura.

## Entregable

La especificación de los cinco pasos, con salidas de "hay evidencia" y "no hay evidencia", y el ejemplo de los USD 10.000 resuelto por escrito.

## Criterios de aceptación

- Ningún paso convierte un dato ausente en aprobado o rechazado.
- El duplicado exacto no depende de un LLM.
- La diferencia de USD 2.000 queda como discrepancia abierta, no como fraude ni como servicio adicional aceptado.
- La severidad propuesta cita la escala conceptual y dice que no está calibrada.
- Queda dicho qué parte es determinista y qué parte, si alguna, podría usar un modelo. La parte de modelo no es obligatoria en esta tarea.

## Riesgo si se cierra mal

Un validador que "completa" contratos o presupuestos va a aprobar gasto sin fuente. Eso contradice la regla de no simular integridad.
