# Spend intelligence

Especificación conceptual de la tarea 06. Define qué recomendaciones puede emitir el módulo B, con qué evidencia mínima y con qué clase de ahorro. No es un esquema, ni una API, ni un algoritmo de scoring, ni una elección de proveedor.

## Fuentes y alcance

- [Documento maestro](../documento-maestro.md), sección 5.2 (módulo B), y secciones 11 y 13.
- [Glosario](../glosario.md).
- [Modelo de dominio](01-dominio.md) y [validación de facturas](04-validacion.md).
- [Tarea 06](../tareas/06-spend-intelligence.md).
- [Decisiones adoptadas](../decisiones/adoptadas.md) y [asuntos abiertos](../decisiones/abiertas.md).

Contexto: [master prompt](../../MASTER_PROMPT_FINANCIAL_OPERATIONS.md). Este documento desarrolla un aspecto concreto, no improvisa producto y no cierra ningún asunto de [abiertas.md](../decisiones/abiertas.md).

**Depende de:** las facturas y documentos ya modelados en las tareas 01 y 04. No depende de bancos, identity providers ni sistemas de uso.

**Alcance:** recomendaciones justificadas sobre gasto recurrente dentro de un tenant. El módulo es de solo lectura: observa, calcula y recomienda; no cancela, modifica ni contrata servicios.

**No es:** un módulo de cancelación o contratación, un ERP, un sistema contable, un ranking de desperdicio ni Accounts Receivable.

## Principios

- Una recomendación es una afirmación con evidencia, no una promesa de ahorro.
- Cada tipo de recomendación declara su evidencia mínima. Si falta, no se emite o se emite como pregunta, nunca como hallazgo cerrado.
- No se infiere uso de licencias desde facturas, correos o contratos. Hace falta evidencia de uso o de no uso.
- Dos herramientas parecidas no son redundantes por defecto: pueden servir a departamentos, usuarios o necesidades distintas.
- El ahorro potencial no se presenta como validado ni como realizado.
- Los cálculos, comparaciones, fechas y duplicados exactos son trabajo determinista.
- Todo dato y todo resultado pertenece a un tenant. No se comparten documentos, cálculos, cachés ni resultados entre tenants.
- El módulo no ejecuta la reducción que recomienda.

## Las tres clases de ahorro

| Clase | Qué afirma | Quién la establece | En el MVP |
| --- | --- | --- | --- |
| Potencial | Estimación pendiente de validación | El cálculo del sistema, con fuentes y supuestos explícitos | Sí |
| Validado | La empresa confirmó la oportunidad | Una persona autorizada, con actor, fecha y evidencia | Solo si existe esa confirmación; el mecanismo está abierto |
| Realizado | La reducción ocurrió y pudo comprobarse | Una fuente de verdad que demuestre la reducción | No. Aparece solo como definición |

Un cálculo no convierte un ahorro potencial en validado. Un modelo no convierte ninguno de los dos en realizado. La clase realizada exige evidencia posterior a la reducción, que el MVP no produce porque no ejecuta la baja ni la contratación.

## Catálogo de recomendaciones

Cada fila es un tipo de recomendación, no una plantilla de interfaz. La evidencia mínima es una condición para emitir; no es una prueba de que la oportunidad sea correcta.

| Tipo | Evidencia mínima | No sirve como prueba | Supuesto explícito | Clase que puede emitir |
| --- | --- | --- | --- | --- |
| Recurrencia observada | Repetición de proveedor, concepto, importe o periodicidad en documentos del tenant | Un único cargo | La repetición sugiere un compromiso; no confirma una suscripción | Potencial |
| Aumento de precio | Dos importes comparables del mismo compromiso, con fechas | Monedas distintas sin tasa y fecha, o planes distintos | El mismo alcance y periodicidad entre las dos observaciones | Potencial |
| Cambio de condiciones | Dos condiciones comparables del mismo compromiso, con fechas y fuente | Una descripción aislada sin la condición anterior | El cambio es observable en la fuente citada | Potencial |
| Duplicado de servicio o pago | Dos obligaciones que el diseño de duplicados de la tarea 04 ya marcó, o dos contratos vigentes solapados | Nombres parecidos sin más señal | Las dos señales describen la misma obligación o el mismo servicio | Potencial |
| Superposición aparente | Descripción comparable de función, más el hueco de para qué área sirve cada una | El parecido solo | La función parece solaparse; la necesidad puede ser distinta | Potencial |
| Licencia sin uso | Evidencia verificable de uso o de no uso | Correo, factura o contrato | La fuente de uso cubre el periodo y el alcance evaluados | Potencial, si la evidencia es de no uso |
| Renovación o vencimiento próximo | Fecha de renovación, vencimiento o compromiso en una fuente disponible | Una fecha supuesta o deducida del importe | La fecha citada sigue vigente | Potencial, como aviso; no es ahorro por sí sola |
| Comparación de costo y condiciones | Datos comparables de alcance, periodo y moneda | Proveedores con alcances distintos o monedas sin tasa y fecha | La comparación es pertinente para la necesidad evaluada | Potencial |
| Ahorro potencial calculado | Cálculo mostrado, fuentes, periodo y supuestos | Un porcentaje sin base ni fuentes | El cálculo se mantiene si se confirma la oportunidad | Potencial |

Si falta la evidencia de la fila, la recomendación no se emite o se emite como pregunta. No se rellena el hueco con una estimación presentada como hecho.

## Recurrencia

La recurrencia se propone con señales observadas: mismo proveedor, concepto, importe o periodicidad en documentos del tenant.

- Una sola factura no es recurrencia.
- La repetición es una señal, no una suscripción confirmada. El compromiso puede haber terminado, cambiado de alcance o ser un pago único dividido en cuotas.
- La periodicidad inferida a partir de fechas es una hipótesis. La periodicidad confirmada por contrato o por la empresa es una fuente distinta.
- La recurrencia no autoriza a cancelar ni a asumir que el servicio sigue activo.

El número mínimo de ocurrencias, la tolerancia entre fechas y la forma de distinguir una cuota de una suscripción están abiertos.

## Aumento de precio y cambio de condiciones

Se compara el mismo compromiso en dos momentos con fechas y fuentes citadas.

- Los importes deben ser comparables: mismo alcance, misma periodicidad y misma moneda, o conversión con tasa y fecha explícitas.
- Se muestra la diferencia absoluta, la diferencia relativa y el periodo al que aplica.
- Un aumento no se clasifica como fraude ni como error. Puede corresponder a servicios adicionales, a un cambio de plan o a una condición contractual.
- Un cambio de condiciones se registra como hallazgo, no como incumplimiento automático.
- El umbral a partir del cual un aumento es un hallazgo está abierto.

El resultado es un ahorro potencial solo si existe una acción defendible, como renegociar o cambiar de plan. Si no hay evidencia para esa acción, la recomendación se limita a señalar el cambio.

## Duplicados

Este módulo reutiliza el diseño de duplicados de la [validación de facturas](04-validacion.md); no crea una detección paralela.

- **Duplicado exacto:** coinciden señales fuertes, como documento equivalente, o mismo proveedor, número e importe cuando esas señales existen.
- **Duplicado probable:** hay variaciones pequeñas. Es un hallazgo para revisión, no un descarte ni una cancelación automática.
- **Mismo documento con otro nombre:** es duplicado de documento, no otra factura.
- **Duplicado de pago:** dos obligaciones o dos pagos que describen la misma operación.
- **Duplicado de servicio:** dos contratos vigentes solapados o dos servicios equivalentes con evidencia de la misma necesidad.

Un duplicado exacto puede sostener un ahorro potencial por recuperación o por evitar un pago repetido. No se declara recuperado ni realizado. La acción de cancelar o reclamar queda fuera del MVP.

## Superposición aparente

Dos herramientas con descripciones parecidas pueden cubrir necesidades distintas. La recomendación solo puede afirmar que la superposición es aparente.

Para emitirla hace falta:

- Una descripción comparable de la función de cada servicio.
- El hueco de qué área, usuario o necesidad sirve cada una.
- La constancia de lo que no se pudo comparar, como un catálogo de funciones o datos de uso.

No se declara redundancia, no se estima una consolidación y no se propone cancelar una herramienta sin esa evidencia. Si no hay datos para comparar, la salida es una pregunta al área responsable, no un hallazgo cerrado.

## Licencia sin uso

Una factura prueba que se pagó un servicio; no prueba cuántas personas lo usan ni si está activo.

- La única prueba admitida es evidencia verificable de uso o de no uso, con fuente, periodo y alcance.
- El correo, la factura y el contrato no son evidencia de uso.
- El importe de la factura no se usa para inferir usuarios activos.
- La integración con identity providers o sistemas de uso no es alcance del MVP. Sin esa fuente, el módulo no emite una licencia ociosa.
- Si la evidencia de uso es parcial, la recomendación declara el hueco y no generaliza al resto de la licencia.

La forma de obtener y verificar esa evidencia en el futuro está abierta.

## Renovaciones y compromisos

Se siguen fechas de renovación, vencimiento, cancelación y compromisos contractuales cuando la fuente existe.

- La fecha se cita con su fuente y su versión. Si no hay fuente, se registra ausencia de evidencia.
- No se inventa una fecha de cancelación ni se deduce del importe o de la periodicidad.
- Un aviso de renovación no es una recomendación de cancelar. Es información para que la empresa decida.
- La fuente de las fechas de cancelación y de compromiso, cuando no están en el contrato, está abierta.

## Comparación entre proveedores

La comparación solo se emite cuando los datos son comparables: mismo alcance, mismo periodo y misma moneda, o conversión con tasa y fecha.

- No se comparan proveedores con alcances distintos como si fueran equivalentes.
- No se comparan datos de otro tenant. Cada recomendación usa solo el tenant actual.
- La comparación no elige un proveedor ni afirma que el cambio sea conveniente. Muestra diferencias y lo que no se pudo comparar.
- La estimación de ahorro por cambio de proveedor es potencial. No se presenta como validada ni realizada.

## Cálculo del ahorro potencial

Todo cálculo muestra:

- La fórmula y el periodo.
- Las fuentes citadas y su fecha.
- Los supuestos, incluida la continuidad del compromiso.
- Lo que no se pudo comparar o verificar.
- La moneda y, si hubo conversión, la tasa y la fecha.

El resultado se expresa como rango o como estimación con su incertidumbre declarada. No se inventa un puntaje de confianza ni se presenta una cifra única como certeza. Un cálculo sin fuentes no se emite.

## Evidencia y trazabilidad

Cada recomendación deja, según aplique:

- Tenant y operación o servicio afectado.
- Tipo de recomendación y clase de ahorro.
- Documentos, contratos o datos de uso consultados, con versión y fecha.
- Cálculo, supuestos y evidencia faltante.
- Reglas o umbrales aplicados, si existen.
- Actor y fecha, si una persona confirma un ahorro validado.
- Modelo y versión, si se usó un modelo para clasificar o comparar.
- Resultado y estado de la recomendación.

El registro debe permitir reconstruir la recomendación. Se evalúa un audit log append-only o un control equivalente; la tecnología no está elegida.

## Determinista frente a modelo

**Determinista:**

- Repetición de señales de recurrencia.
- Cálculos de importes, diferencias, porcentajes y periodos.
- Comparación de fechas y monedas cuando hay tasa y fecha.
- Detección de duplicado exacto reutilizada de la tarea 04.
- Aplicación de umbrales y reglas configuradas.

**Modelo, si se usa y no es obligatorio en esta tarea:**

- Apoyo a la clasificación de conceptos o descripciones.
- Señalización de posibles superposiciones para revisión.

**Límites del modelo:**

- No crea evidencia de uso ni de no uso.
- No rellena fechas, importes, contratos ni tasas ausentes.
- No convierte una superposición aparente en redundancia.
- No convierte ahorro potencial en validado ni en realizado.
- No sustituye reglas duras ni cálculos.
- No cancela, modifica ni contrata servicios.

## Aislamiento por tenant

- Cada consulta, cálculo, caché y recomendación usa solo datos del tenant actual.
- No se comparten documentos, embeddings, resultados ni comparaciones entre tenants.
- No se usan datos de otro tenant como referencia de precio o de mercado.
- Los datos de demostración son sintéticos y están marcados. Nunca se usan datos reales de clientes.

## Ejemplo obligatorio

Datos sintéticos de un tenant de demostración. No son datos de un cliente.

**Recurrencia y aumento de precio.** Llegan tres facturas mensuales del servicio «Colabora Suite»: USD 1.000 el 15 de enero, USD 1.000 el 15 de febrero y USD 1.200 el 15 de marzo.

1. La recurrencia se observa por proveedor, concepto, importe y fechas. Es una señal, no una suscripción confirmada.
2. Los importes de febrero y marzo son comparables: mismo proveedor, mismo concepto, misma moneda y misma periodicidad aparente. La diferencia es de USD 200, un 20 % sobre el importe anterior.
3. No hay contrato disponible que explique el cambio. No se asume que el aumento sea legítimo ni fraudulento.
4. El ahorro potencial se calcula como USD 200 por mes si el aumento se mantiene y si la empresa decide renegociar o cambiar de plan. El cálculo declara que no se comparó el alcance del servicio, que no hay datos de uso y que la continuidad del compromiso es un supuesto.
5. Resultado: cambio de precio observado y ahorro potencial de USD 2.400 anuales si se mantiene la diferencia. No es ahorro validado y no es ahorro realizado.

**Superposición aparente.** Otra herramienta, «TaskFlow», tiene una descripción parecida a la de «Colabora Suite». No hay catálogo de funciones ni datos de uso.

1. Se registra una superposición aparente, no una redundancia.
2. Se pregunta al área responsable si las dos herramientas cubren la misma necesidad.
3. No se estima una consolidación ni se propone cancelar ninguna de las dos. La oportunidad queda como pregunta, no como hallazgo cerrado.

**Duplicado exacto.** Dos documentos del mismo proveedor, con el mismo número e importe, ya marcados como duplicado exacto por la validación de la tarea 04.

1. Se registra un ahorro potencial por el pago repetido.
2. No se declara recuperado ni realizado.
3. No se cancela ni se reclama desde el módulo.

## Decidido

- El MVP identifica recurrencias, aumentos de precio, cambios de condiciones, duplicados, superposiciones aparentes, renovaciones y comparaciones cuando los datos son comparables.
- El MVP recomienda y estima ahorro potencial. No cancela, modifica ni contrata servicios.
- Una licencia no se declara sin uso sin evidencia verificable de uso o de no uso.
- Dos herramientas parecidas no son redundantes por defecto.
- Ahorro potencial, validado y realizado son clases distintas y no se mezclan.
- El cálculo del ahorro potencial muestra fuentes, supuestos y lo que no se pudo comparar.
- Cada recomendación pertenece a un tenant y no usa datos de otro.
- La detección de duplicado exacto no depende de un modelo.

## Hipótesis

- La recurrencia se puede proponer con proveedor, importe, moneda y periodicidad observados en facturas. Es una señal, no una suscripción confirmada.
- Las oportunidades más defendibles en una demo son duplicado de pago, aumento de precio y renovación próxima. La superposición de productos es más débil si no hay catálogo de funciones. Es una hipótesis de prioridad, no una decisión de producto.
- La periodicidad se puede inferir de las fechas de las facturas cuando hay suficientes ocurrencias. No está medida.

## Abierto

- Fuente de fechas de cancelación y de compromiso si no están en el contrato.
- Cómo confirma la empresa un ahorro validado y quién puede hacerlo.
- Integración futura con identity providers o sistemas de uso. No es MVP.
- Umbral a partir del cual un aumento de precio es un hallazgo.
- Número mínimo de ocurrencias y tolerancia entre fechas para proponer una recurrencia.
- Criterios exactos de comparabilidad de alcance, plan y periodo.
- Tasas y fechas de conversión entre monedas.
- Forma de presentar la incertidumbre sin inventar un puntaje de confianza.
- Si el MVP registra ahorros validados y con qué evidencia.
- Retención y auditoría de las recomendaciones.
- Profundidad de datos disponible para comparar proveedores.

## Criterios de aceptación cubiertos

- Ninguna recomendación cancela, modifica ni contrata un servicio.
- Ninguna licencia figura como no usada sin fuente de uso.
- Dos herramientas parecidas quedan como superposición aparente, con la posibilidad de que sirvan a necesidades distintas.
- El cálculo del ahorro potencial enseña fuentes, supuestos y lo que no se pudo comparar.
- Los datos de un tenant no entran en la recomendación de otro.
- El ejemplo de aumento de precio queda como ahorro potencial, no como validado ni realizado.
- El duplicado exacto reutiliza la detección de la tarea 04 y no se convierte en cancelación automática.

## Fuera de alcance

- Ejecutar la baja de una suscripción o la renegociación de un contrato.
- Inferir usuarios activos desde el importe de la factura.
- Ranking de «desperdicio» sin evidencia.
- Declarar ahorro realizado en el MVP.
- Comparar datos entre tenants.
- Mezclar este módulo con Accounts Receivable.
- Elegir identity provider, ERP, banco, proveedor de correo, modelo de IA o cualquier otro proveedor.
- Diseñar tablas, APIs, eventos o un enum de estados.
