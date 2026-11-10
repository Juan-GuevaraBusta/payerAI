# Contratos y presupuestos como evidencia

**Estado:** adoptado el 2026-11-09. No implementar.
**Tarea:** 15.
**Orquestador:** `.cursor/agents/validacion-facturas.md`.
**Skill:** `principle-explain-the-number`.

Modelo conceptual de contratos, anexos, presupuestos y confirmaciones como evidencia para validar una factura. No es un módulo contractual, ni un módulo de compras, ni un esquema, ni una API, ni una elección de OCR o ERP.

Este documento fija el alcance de fuentes y el modelo conceptual. Los valores, el detalle de campos y la calibración de umbrales siguen abiertos.

## Fuentes y alcance

- [Documento maestro](../documento-maestro.md), secciones 5.2, 8 y 15.
- [Master prompt](../../MASTER_PROMPT_FINANCIAL_OPERATIONS.md).
- [Glosario](../glosario.md).
- [Decisiones adoptadas](../decisiones/adoptadas.md) y [asuntos abiertos](../decisiones/abiertas.md).
- [Tarea 15](../tareas/15-contratos-presupuestos-evidencia.md).
- [Dominio](01-dominio.md), [proveedores](03-proveedores.md), [validación](04-validacion.md), [autoridad e IA](07-autoridad-ia.md), [edge cases](11-edge-cases.md), [estados](12-estados-transiciones.md), [identidad](13-identidad-aprobaciones.md) y [riesgo, severidad y umbrales](14-riesgo-severidad-umbrales.md).

**Alcance:** qué fuente cuenta como evidencia, con qué detalle y vigencia, cómo se vincula con una factura y cómo se registra su ausencia o conflicto. No incluye aprobar, rechazar, pagar, ni construir un sistema de contratos o compras.

## Decisión adoptada (2026-11-09)

- **Fuentes del MVP:** contrato o anexo, presupuesto y confirmación interna.
- **Orden de compra:** no es fuente obligatoria del MVP; su inclusión queda abierta. Si aparece, es evidencia acotada y no convierte el MVP en un módulo de compras.
- **Contrato o anexo:** responde por condición comercial, vigencia, moneda, periodicidad, conceptos y límites.
- **Presupuesto:** responde por límite disponible en un alcance y periodo; no autoriza una factura.
- **Confirmación interna:** responde por una excepción concreta; no sustituye contrato ni presupuesto.
- El alcance de fuentes queda cerrado. El detalle de campos, la determinación de vigencia, la precedencia entre anexos, la granularidad del presupuesto y el canal de confirmación siguen abiertos.

## 1. Principios

1. **La fuente existe o no existe.** No se completa con una suposición, un promedio ni un modelo.
2. **Una factura no es su propio contrato.** La referencia que trae la factura es una afirmación del proveedor, no la fuente contractual.
3. **Vigencia no es fecha de archivo.** Un documento reciente puede estar vencido; uno antiguo puede seguir vigente por renovación.
4. **Versión no es la última por conveniencia.** La versión aplicable se determina por la fuente, no por el orden de lectura.
5. **Anexo no es adorno.** Un anexo solo modifica lo que declara modificar y dentro de su vigencia.
6. **Presupuesto no es aprobación.** Estar dentro de un presupuesto no autoriza una factura; solo elimina una objeción de límite.
7. **Confirmación no es contrato.** Explica una excepción; no reescribe la condición contractual ni sustituye la evidencia.
8. **Moneda no se compara por el número.** Sin tasa, fuente y fecha, no hay comparación monetaria.
9. **La ausencia se registra como ausencia.** No se convierte en conformidad ni en incumplimiento.
10. **La comparación es determinista y cita la fuente.** Cada diferencia apunta al campo, la fuente y la versión.
11. **El vínculo se demuestra.** Una coincidencia de nombre o importe no crea un contrato aplicable.
12. **Todo pertenece a un tenant.** Fuentes, vínculos, presupuestos y comparaciones no se mezclan.

## 2. Qué es evidencia

Una fuente de evidencia tiene:

- **Origen:** documento, registro configurado o respuesta interna.
- **Contenido:** campos concretos que se pueden citar.
- **Alcance:** tenant, proveedor, departamento, periodo, moneda y tipo de operación.
- **Vigencia:** desde y hasta cuándo aplica.
- **Versión:** identidad inmutable del contenido aplicado.
- **Estado:** vigente, vencida, superada, ambigua, parcial, ausente o conflictiva.
- **Proveniencia:** cómo llegó, quién la cargó y cuándo.

No es evidencia:

- una suposición del sistema;
- un campo inventado por un modelo;
- una factura que afirma tener un contrato;
- un correo que pide aprobar sin evidencia;
- un documento de otro tenant;
- una versión que no se puede identificar.

## 3. Tipos de fuente

| Fuente | Qué pregunta responde | Qué no implica |
| --- | --- | --- |
| Contrato | Condición comercial base: precio, moneda, periodicidad, alcance y límites. | Obligación, aprobación ni pago. |
| Anexo | Modificación declarada de una condición del contrato. | Contrato nuevo ni alcance ilimitado. |
| Presupuesto | Límite disponible para un alcance y periodo. | Autorización de una factura concreta. |
| Orden de compra | Compromiso de compra, si el MVP la adopta. | Contrato completo ni pago. |
| Confirmación interna | Explicación o aceptación de una excepción concreta. | Contrato, presupuesto ni aprobación del pago. |
| Registro de proveedor | Identidad y habilitación del proveedor. | Condición comercial ni autorización de cobro. |

La orden de compra queda abierta. Si se usa, es evidencia acotada; no convierte el MVP en un módulo de compras.

## 4. Contrato y anexos

### 4.1 Campos conceptuales

- Partes: razón social, identificadores y rol.
- Identificador del contrato y referencia interna.
- Vigencia: inicio, fin, renovación y preaviso, si existen.
- Moneda y periodicidad.
- Importe o esquema de precios.
- Conceptos, líneas o servicios cubiertos.
- Límites, cantidades y condiciones.
- Anexos y su relación.
- Estado: borrador, vigente, vencido, superado o ambiguo.
- Documento fuente y versión.

El detalle exacto y los campos obligatorios están abiertos. Un campo ausente se registra como ausente; no se completa.

### 4.2 Vigencia

- La vigencia se determina por las fechas y condiciones declaradas, no por la fecha del archivo ni por la fecha de carga.
- Una renovación automática debe estar declarada; no se presume.
- Si la vigencia no se puede determinar, el estado es `AMBIGUA` y la comparación queda limitada o no evaluable.
- Un contrato vencido es un hallazgo. La política decide si bloquea o solo eleva la severidad; este documento no elige el número.
- Un contrato vencido no se usa como si estuviera vigente.

### 4.3 Anexos y versiones

- Un anexo solo modifica los campos que declara y dentro de su vigencia.
- Un anexo sin referencia explícita al contrato es un documento separado, no una modificación automática.
- Dos anexos vigentes que fijan límites distintos producen `CONFLICTIVA`; no gana el más reciente por fecha.
- Una versión superada se conserva para auditoría y no se usa para la comparación actual.
- Un cambio material de contrato o anexo después de una aprobación obliga a reevaluar.
- La versión aplicada se registra en la evaluación y en la decisión.

## 5. Presupuesto

### 5.1 Campos conceptuales

- Tenant.
- Alcance: departamento, centro de costo, proyecto o categoría, si aplica.
- Periodo.
- Moneda.
- Importe autorizado.
- Consumido y comprometido, si el dato existe.
- Propietario o responsable.
- Versión y fuente.
- Estado: vigente, agotado, superado, ambiguo o no disponible.

### 5.2 Disponible

- El disponible se calcula solo si existen el importe autorizado y los consumos o compromisos necesarios.
- Si falta el dato, el resultado es `NO_EVALUABLE`; no se asume presupuesto infinito ni cero.
- Estar dentro del presupuesto no aprueba la factura.
- Un presupuesto agotado es un hallazgo; no es un rechazo automático.
- Un presupuesto actualizado durante una aprobación obliga a reevaluar.
- El presupuesto no sustituye la política ni el límite de autoridad.

### 5.3 Presupuesto frente a umbral

El presupuesto es una fuente de límite. El umbral es la regla que decide cómo se trata una diferencia o un exceso. Los valores y la calibración viven en [riesgo, severidad y umbrales](14-riesgo-severidad-umbrales.md).

## 6. Confirmación interna

- Se registra la solicitud: actor, departamento, pregunta concreta, evidencia que la motiva y plazo, si existe.
- Se registra la respuesta: actor, rol, fecha, alcance y evidencia.
- La confirmación es evidencia de que se pidió y de lo que se respondió; no de que el silencio sea conformidad.
- Una confirmación explica una excepción concreta; no reescribe el contrato ni crea un límite nuevo.
- Una confirmación no sustituye un presupuesto ausente, salvo que la política lo permita y lo registre.
- Una confirmación genérica o sin alcance no cubre una diferencia futura.
- El canal y el plazo exactos están abiertos.

## 7. Vínculo entre factura y fuente

### 7.1 Señales de vínculo

- Referencia explícita en la factura a contrato, anexo, orden o línea presupuestaria.
- Proveedor y periodo compatibles.
- Concepto o servicio compatible.
- Importe compatible, cuando la condición lo permita.

### 7.2 Reglas

- Una referencia explícita es la señal más fuerte; no se acepta si apunta a otro tenant o a una versión inexistente.
- Una coincidencia de proveedor y periodo puede proponer candidatos, pero no crea un vínculo automático si hay más de uno.
- Una coincidencia de importe no demuestra que el contrato cubra la factura.
- Si hay varios candidatos, el resultado es `AMBIGUA` y se pide aclaración.
- Si no hay candidato, el resultado es `AUSENTE`; no se inventa un contrato.
- El vínculo aplicado se registra con fuente y versión.

## 8. Comparación

Se comparan solo los campos que existen en ambas fuentes:

| Campo | Comparación | Si falta |
| --- | --- | --- |
| Importe | Contra precio, límite o condición aplicable. | No evaluable para ese campo. |
| Moneda | Igualdad o conversión con fuente, tasa y fecha. | No evaluable; no se comparan números. |
| Periodo | Periodicidad y fecha cubierta. | No evaluable. |
| Concepto | Servicio o línea cubierta. | Se registra ausencia de correspondencia. |
| Límite | Cantidad o tope declarado. | No se asume un límite. |
| Impuestos | Solo si ambas fuentes declaran base y tratamiento. | No evaluable. |

Reglas:

- La diferencia se expresa en la moneda de la fuente, con su unidad y su base.
- No se suman monedas distintas.
- Sin tasa, fuente y fecha, la comparación monetaria queda como evidencia insuficiente.
- Un servicio adicional no cubierto por el contrato es un hallazgo; puede requerir anexo o confirmación.
- Un cargo extraordinario no se acepta por aparecer en la factura.
- Una factura parcial o una nota crédito se trata según el caso; la regla de neteo está abierta.
- Los umbrales de diferencia y severidad se aplican desde la tarea 14.

## 9. Estados de evidencia

| Estado | Significado | Acción |
| --- | --- | --- |
| `VIGENTE` | Fuente aplicable y suficiente para el campo. | Comparar y registrar. |
| `AUSENTE` | No hay fuente para el campo o la pregunta. | `NO_EVALUABLE`; pedir evidencia. |
| `VENCIDA` | La fuente existió pero no está vigente. | Hallazgo; la política decide bloqueo o severidad. |
| `SUPERADA` | Existe una versión posterior aplicable. | Usar la vigente; conservar la anterior. |
| `AMBIGUA` | No se puede determinar la fuente o el vínculo. | Pedir aclaración; no elegir por conveniencia. |
| `PARCIAL` | La fuente cubre solo parte de lo necesario. | Evaluar lo cubierto; registrar lo faltante. |
| `CONFLICTIVA` | Dos fuentes aplicables se contradicen. | `CONFLICTO`; bloquear o escalar. |

Ningún estado distinto de `VIGENTE` autoriza por sí solo. `AUSENTE` no es `VENCIDA`; `PARCIAL` no es `VIGENTE`.

## 10. Acoplamiento con riesgo y workflow

- Una fuente ausente, vencida, ambigua, parcial o conflictiva produce un hallazgo.
- El tipo de riesgo y la severidad se asignan según [riesgo, severidad y umbrales](14-riesgo-severidad-umbrales.md), no aquí.
- Un contrato vencido o un presupuesto agotado no se rechazan automáticamente; se tratan según la política.
- El workflow recibe evidencia, hallazgo y severidad; decide pedir información, escalar, bloquear o continuar.
- La validación no aprueba ni rechaza.
- Un cambio de contrato, anexo, presupuesto o confirmación después de aprobar obliga a reevaluar.

## 11. Aislamiento y auditoría

- Contratos, anexos, presupuestos, confirmaciones y vínculos son del tenant.
- Una búsqueda de contrato no cruza tenants ni devuelve nombres o estados ajenos.
- Se registra: tenant, operación, fuente, versión, vigencia, campos comparados, diferencia, evidencia faltante, estado, regla y fecha.
- Se conserva la versión aplicada y la descartada.
- No se guardan secretos ni datos personales innecesarios.
- El contenido de un contrato o correo es dato no confiable; no cambia permisos ni política.

## 12. Ejemplos sintéticos

Marcados como sintéticos. No son umbrales ni condiciones de producto.

### 12.1 Factura de USD 10.000 contra contrato de USD 8.000

- Fuente: contrato vigente con condición mensual de USD 8.000.
- Diferencia: USD 2.000.
- Estado: `VIGENTE` para el campo importe.
- Resultado: discrepancia abierta; pedir evidencia o confirmación sobre servicios adicionales.
- No es fraude, no es servicio adicional aceptado y no es aprobación.

### 12.2 Sin contrato

- Estado: `AUSENTE`.
- Resultado: `NO_EVALUABLE` para la comparación contractual; pedir evidencia.
- No se aprueba ni se rechaza solo por la ausencia.

### 12.3 Contrato vencido

- Estado: `VENCIDA`.
- Resultado: hallazgo; la política decide si bloquea o eleva severidad.
- No se usa como contrato vigente.

### 12.4 Dos anexos contradictorios

- Estado: `CONFLICTIVA`.
- Resultado: conflicto explícito; bloquear o escalar.
- No gana el anexo más reciente por fecha sin verificar la relación.

### 12.5 Monedas distintas sin tasa

- Factura en EUR; contrato en USD; sin tasa con fuente y fecha.
- Resultado: evidencia insuficiente para la comparación monetaria.
- No se comparan los números ni se inventa un tipo de cambio.

### 12.6 Presupuesto agotado

- Fuente: presupuesto vigente con importe autorizado y consumido.
- Resultado: hallazgo de presupuesto agotado; no es rechazo automático.
- Si falta el consumido, el disponible es `NO_EVALUABLE`.

## 13. Decidido, propuesto, hipótesis y abierto

### Decidido antes de esta tarea

- Contratos y presupuestos son evidencia, no obligación ni aprobación.
- La ausencia es ausencia de evidencia.
- No se inventa un contrato, presupuesto, límite ni confirmación.
- La comparación es determinista y cita la fuente.
- Una diferencia no se clasifica sola como fraude ni como legitimidad.
- La confirmación interna no convierte el silencio en aprobación.
- El MVP no incluye un módulo contractual ni de compras completo.
- Todo dato pertenece a un tenant.

### Adoptado con este modelo

- Fuentes del MVP: contrato o anexo, presupuesto y confirmación interna. La orden de compra queda abierta.
- Distinguir contrato, anexo, presupuesto, orden de compra y confirmación interna.
- Campos conceptuales y estados de evidencia de las secciones 4, 5 y 9.
- Fuente primaria por pregunta, no una jerarquía única para todo.
- Anexo que modifica solo lo declarado; versión aplicable registrada.
- Presupuesto con alcance, periodo, moneda y disponible solo si el dato existe.
- Vínculo demostrado; ambigüedad produce aclaración, no vínculo automático.
- Comparación de importe, moneda, periodo, concepto, límite e impuestos con reglas explícitas.
- `CONFLICTIVA` bloquea o escala; no gana la última fuente.
- Acoplamiento con severidad y workflow sin aprobar ni rechazar aquí.

### Hipótesis

- Captura manual o simulada en la demo; sin OCR ni ERP.
- Pocas facturas sintéticas traerán contrato.
- El presupuesto se modela como límite por periodo y alcance; el detalle está abierto.

### Abierto

- Inclusión futura de la orden de compra como fuente.
- Detalle contractual y campos obligatorios.
- Determinación de vigencia y precedencia entre anexos.
- Si un contrato vencido bloquea o solo eleva severidad.
- Granularidad del presupuesto y fuente de consumido/comprometido.
- Quién confirma servicios adicionales y cargos extraordinarios.
- Tasas, fechas y redondeo de conversión.
- Canal y plazo de la confirmación interna.
- Extracción automática y proveedor.
- Retención, borrado y jurisdicción.

## 14. Decisión adoptada sobre fuentes

Adoptado el 2026-11-09: **contrato o anexo + presupuesto + confirmación interna**, con la orden de compra explícitamente abierta.

- **Contrato + presupuesto + confirmación interna:** cubre las tres preguntas del MVP (condición, límite y excepción) y mantiene el alcance acotado.
- **Solo contrato:** se descartó para el MVP porque no responde por presupuesto ni por excepciones internas.
- **Añadir orden de compra:** queda abierto; más evidencia de compromiso, pero acerca el MVP a un módulo de compras.

## 15. Casos de aceptación

1. Sin contrato, la comparación contractual es `NO_EVALUABLE`; no hay aprobación ni rechazo automático.
2. Un contrato vencido se trata como `VENCIDA`, no como vigente.
3. Dos anexos vigentes contradictorios producen `CONFLICTIVA` y escalamiento.
4. Una factura de USD 10.000 contra un contrato de USD 8.000 produce una diferencia de USD 2.000 y pedido de evidencia.
5. Una factura en EUR contra un contrato en USD sin tasa produce evidencia insuficiente.
6. Un presupuesto sin dato de consumido produce disponible `NO_EVALUABLE`.
7. Un presupuesto agotado produce hallazgo, no rechazo automático.
8. Una confirmación interna sin alcance no cubre una diferencia futura.
9. Una referencia de la factura a un contrato de otro tenant se deniega sin revelar existencia.
10. El vínculo aplicado cita fuente y versión.
11. Un cambio de contrato o presupuesto después de aprobar obliga a reevaluar.
12. La validación no cambia el estado a aprobado ni a pagado.
13. El modelo no elige OCR, ERP ni proveedor.
14. Los ejemplos son sintéticos y están marcados.

## 16. Relación con otras tareas

| Tarea | Relación |
| --- | --- |
| 01 Dominio | Define contrato, factura, hallazgo y obligación. |
| 03 Proveedores | Aporta identidad y habilitación del proveedor. |
| 04 Validación | Consume estas fuentes en el paso contractual y de políticas. |
| 05 Workflows | Recibe evidencia, hallazgo y severidad. |
| 07 Autoridad e IA | Impide que un modelo invente o imponga la fuente. |
| 11 Edge cases | Aporta vencimiento, anexos, monedas y ausencia. |
| 12 Estados | Separa validación de aprobación y pago. |
| 13 Identidad | Aporta tenant, permisos y auditoría. |
| 14 Riesgo y umbrales | Asigna severidad y límites. |

## 17. Fuera de alcance

- Elegir OCR, ERP, base de datos, correo, JEV o modelo de IA.
- Diseñar tablas, APIs, eventos o un enum de implementación.
- Crear un módulo de contratos, compras o presupuesto completo.
- Aprobar, rechazar o pagar.
- Calibrar umbrales o severidades.
- Declarar fraude, legitimidad o responsabilidad legal.
- Usar datos reales de clientes.
- Cerrar cualquier punto de [asuntos abiertos](../decisiones/abiertas.md) sin una decisión explícita.
