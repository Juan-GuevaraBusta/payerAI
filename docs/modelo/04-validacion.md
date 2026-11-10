# Validación de facturas

Especificación conceptual de la tarea 04. Define cómo una solicitud de pago se contrasta con historial, contrato, confirmación interna y política, sin inventar la evidencia que falte. No es un esquema, ni una API, ni un motor de reglas cerrado.

## Fuentes y alcance

- [Documento maestro](../documento-maestro.md), secciones 5.2 (módulo A), 8 y 13.
- [Glosario](../glosario.md).
- [Modelo de dominio](01-dominio.md), [ingesta](02-ingesta.md) y [proveedores](03-proveedores.md).
- [Riesgo, severidad y umbrales](14-riesgo-severidad-umbrales.md).
- [Tarea 04](../tareas/04-validacion-de-facturas.md).

**Depende de:** dominio, ingesta y proveedores.

**Alcance:** el contraste de una factura con la evidencia disponible. La validación no aprueba ni rechaza. Aprobar, rechazar, pedir información o escalar corresponde a workflow y autoridad, fuera de esta tarea.

## Principios

- Cada paso devuelve evidencia, no un sí o no global.
- La ausencia de datos es ausencia de evidencia. No se convierte en aprobación ni en rechazo.
- No se inventa contrato, presupuesto, aprobación, respuesta de un departamento ni tasa de cambio.
- Los cálculos, comparaciones, duplicados exactos y límites son trabajo determinista.
- Un modelo no sustituye las reglas duras ni baja la severidad de una alerta.
- La validación deja constancia de lo que evaluó, de lo que no pudo evaluar y de por qué.

## Los cinco pasos

El orden es el decidido. Cada paso puede producir evidencia utilizable o declarar que no hay evidencia suficiente. Ninguno de los dos resultados es una decisión final sobre la factura.

### 1. Extracción y normalización

Se extraen y normalizan los campos que el documento trae: proveedor, razón social, identificadores, número, fecha, vencimiento, importe, moneda, impuestos, concepto, líneas y referencias contractuales.

- **Hay evidencia:** campos normalizados, con su origen documental y la versión del documento.
- **No hay evidencia:** lista explícita de campos no disponibles. No se rellena el hueco.
- **No puede hacer:** completar campos vacíos con un modelo y tratarlos como leídos del documento.
- **Determinista:** normalización de formatos, monedas y fechas cuando los datos existen.

La falta de un campo no detiene por sí sola la validación: se convierte en evidencia faltante para los pasos siguientes.

### 2. Historial

Se compara la factura con facturas, proveedores, documentos y pagos disponibles en el mismo tenant.

- **Hay evidencia:** coincidencias encontradas, duplicado exacto, candidatos a duplicado parcial y pagos o documentos relacionados.
- **No hay evidencia:** "sin historial comparable". No es aprobación.
- **No puede hacer:** descartar automáticamente un candidato parcial ni declarar fraude por una coincidencia.
- **Determinista:** la comparación de señales fuertes y la detección de duplicado exacto.

Un duplicado exacto y un duplicado probable son hallazgos distintos. El segundo requiere revisión; no se descarta solo.

### 3. Contrato

Si existe una fuente contractual o condiciones comerciales disponibles, se contrastan importe, moneda, vigencia, periodicidad, conceptos, límites y condiciones.

- **Hay evidencia:** diferencias concretas entre la factura y la condición disponible, con la fuente citada.
- **No hay evidencia:** "sin fuente contractual". No es incumplimiento ni conformidad.
- **No puede hacer:** inventar un contrato, asumir un límite ni tratar la ausencia como aprobación o rechazo.
- **Determinista:** la comparación de importes, monedas, vigencias y periodicidad cuando los datos existen.

Una diferencia contra el contrato no se clasifica sola como fraude ni como cargo legítimo. Se registra como hallazgo y sigue el camino de evidencia o confirmación.

### 4. Confirmación interna

Si hay servicios adicionales, diferencias no explicadas o evidencia insuficiente, se pide confirmación al departamento responsable.

- **Hay evidencia:** solicitud registrada, con la pregunta concreta, la evidencia que la motiva y el departamento destinatario.
- **No hay evidencia:** la respuesta no llegó. No se inventa la respuesta ni se asume conformidad.
- **No puede hacer:** convertir el silencio en aprobación ni en rechazo.
- **Hipótesis:** la confirmación vuelve por el mismo hilo de correo o por una tarea del workflow. El canal no está elegido.

La solicitud de confirmación es evidencia de que se pidió, no evidencia de que se obtuvo.

### 5. Políticas, presupuestos y límites

Se aplican las reglas, presupuestos, límites y autorizaciones configurados por la empresa.

- **Hay evidencia:** reglas que aplican, reglas que no aplican y resultado de cada una.
- **No hay evidencia:** "política o presupuesto no configurado" o "no evaluable con los datos disponibles". No se asume un límite.
- **No puede hacer:** inventar un tope, aplicar una política de otro tenant ni dejar que un modelo conceda autoridad.
- **Determinista:** el cálculo y la comparación contra límites configurados.

La versión de política que se congela al empezar una validación está abierta.

## Duplicados

- **Exacto:** coinciden señales fuertes. Como mínimo, documento equivalente, o mismo proveedor, número e importe cuando esas señales existan. La clave definitiva se cierra con la tarea de edge cases.
- **Probable:** hay variaciones pequeñas. Es un hallazgo para revisión, no un descarte automático.
- **Mismo archivo con otro nombre:** es duplicado de documento, no otra factura.

La detección de duplicado exacto no depende de un modelo. El duplicado probable puede asistirse con reglas o con un modelo, pero el resultado sigue siendo un hallazgo, no una decisión.

## Ejemplo obligatorio

Factura de USD 10.000 contra un contrato mensual de USD 8.000.

1. La extracción registra importe, moneda y referencia contractual si el documento los trae.
2. El historial busca duplicados y operaciones relacionadas. No los hay o no son concluyentes.
3. El contrato existe y muestra una condición mensual de USD 8.000. La diferencia es de USD 2.000.
4. Se registra un hallazgo de diferencia y se pide evidencia o confirmación al departamento responsable sobre servicios adicionales.
5. La política aplicable, si está configurada, se evalúa. Si no está configurada, se declara no evaluable.

Resultado: discrepancia abierta con pedido de evidencia. No es fraude, no es un servicio adicional aceptado y no es una aprobación. La severidad conceptual de partida es media, porque es una diferencia que requiere confirmación. La escala es informativa, baja, media, alta y crítica; sigue sin calibrar. No se sube a crítica ni se baja a informativa sin una regla o un humano.

## Determinista frente a modelo

**Determinista:**

- Normalización de campos cuando los datos existen.
- Cálculos de importes, diferencias, monedas y fechas.
- Comparaciones contra historial, contrato y límites.
- Detección de duplicado exacto.
- Aplicación de reglas y políticas configuradas.

**Modelo, si se usa y no es obligatorio en esta tarea:**

- Apoyo a la extracción o clasificación de documentos.
- Señalización de posibles anomalías para revisión.

**Límites del modelo:**

- No rellena campos ausentes como si se hubieran leído.
- No inventa contrato, presupuesto ni respuesta de un departamento.
- No sustituye reglas duras ni cálculos.
- No baja la severidad de una alerta.
- No aprueba ni rechaza.

## Decidido

- Orden base: extracción y normalización, historial, contrato si existe, confirmación interna cuando haga falta, políticas.
- Duplicado exacto y duplicado semántico o parcial son hallazgos distintos.
- Una diferencia contra el contrato no se clasifica sola como fraude ni como cargo legítimo.
- La ausencia de datos es ausencia de evidencia.
- Cálculos, comparaciones, duplicados exactos y límites son trabajo determinista. Un modelo no los sustituye.
- Un modelo no baja la severidad de una alerta.
- La validación no aprueba ni rechaza la factura.

## Hipótesis

- Muchas facturas del primer demo traerán pocos campos estructurados y ningún contrato. El sistema debe seguir siendo útil: muestra qué falta y no finge una validación completa.
- La confirmación interna vuelve por el mismo hilo de correo o por una tarea del workflow. El canal de respuesta no está elegido.

## Abierto

- Valores de los umbrales de duplicado probable, de exceso sobre contrato y de severidad. La estructura está adoptada en [riesgo, severidad y umbrales](14-riesgo-severidad-umbrales.md); los valores no.
- De dónde salen contratos y presupuestos, y con qué detalle.
- Tasas y fechas de conversión entre monedas. El caso existe; la fuente de la tasa no.
- Qué versión de política se congela al empezar una validación.
- Canal y plazo de la confirmación interna.
- Grado de asistencia de un modelo en extracción o clasificación, si se usa.

## Criterios de aceptación cubiertos

- Ningún paso convierte un dato ausente en aprobado o rechazado.
- El duplicado exacto no depende de un LLM.
- La diferencia de USD 2.000 queda como discrepancia abierta, no como fraude ni como servicio adicional aceptado.
- La severidad propuesta cita la escala conceptual y dice que no está calibrada.
- Queda dicho qué parte es determinista y qué parte, si alguna, podría usar un modelo. La parte de modelo no es obligatoria en esta tarea.

## Fuera de alcance

- Aprobar o rechazar la factura. Eso es workflow y autoridad.
- Rechazarla solo porque no hay contrato.
- Completar campos vacíos con un modelo y tratarlos como leídos del documento.
- Consultar un ERP que el MVP no integra.
- Elegir D1 o PostgreSQL, proveedor de correo, OCR, frontend, modelo de IA o cualquier otro proveedor.
- Diseñar tablas, APIs, eventos o un enum de estados.
