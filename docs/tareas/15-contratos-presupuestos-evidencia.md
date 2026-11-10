# Tarea 15 — Contratos y presupuestos como evidencia

**Estado:** discovery. Propuesta para decisión; no implementar.
**Orquestador:** `.cursor/agents/validacion-facturas.md`. Skill: `principle-explain-the-number`.
**Fuente:** documento maestro, secciones 5.2, 8 y 15; tareas 04, 07, 11 y 14.
**Depende de:** dominio, proveedores, validación, riesgo/severidad y edge cases. No depende de un proveedor de OCR, ERP, base de datos ni correo.

## Objetivo

Definir qué cuenta como contrato, anexo o presupuesto para validar una factura, con qué detalle, vigencia, alcance y versión; cómo se vincula con la operación; y cómo se registra su ausencia, ambigüedad o conflicto. No es un módulo contractual ni de compras.

## Decidido

- Contratos, anexos y presupuestos son evidencia de validación, no obligación ni aprobación.
- La ausencia de contrato o presupuesto es ausencia de evidencia: no aprueba ni rechaza por sí sola.
- No se inventa un contrato, un anexo, un presupuesto, un límite ni una respuesta interna.
- La validación compara importe, moneda, vigencia, periodicidad, conceptos, límites y condiciones cuando la fuente existe.
- Una diferencia contra el contrato no se clasifica sola como fraude ni como cargo legítimo.
- Las comparaciones son deterministas; un modelo no sustituye el cálculo ni inventa la fuente.
- Cada fuente pertenece a un tenant y se registra con su versión.
- La confirmación interna es evidencia de que se pidió y, si llega, de lo que se respondió; el silencio no es aprobación.
- El MVP no incluye un módulo contractual completo ni órdenes de compra completas.
- Los umbrales y la severidad se rigen por [riesgo, severidad y umbrales](14-riesgo-severidad-umbrales.md).

## Hipótesis

- Las fuentes del MVP son contrato o anexo, presupuesto y confirmación interna. La orden de compra queda abierta.
- La captura en demo es manual o simulada; no exige OCR ni integración con un ERP.
- Pocas facturas sintéticas traerán contrato; el sistema debe mostrar la ausencia sin fingir una validación completa.
- El presupuesto se expresa como límite por periodo, departamento o centro de costo; el detalle exacto está abierto.

## Abierto

- Qué fuentes exactas entran al MVP y cuáles quedan para después.
- Nivel de detalle contractual: cabecera, líneas, anexos, renovaciones y condiciones.
- Cómo se determina la vigencia y qué anexo prevalece.
- Si un contrato vencido bloquea o solo eleva la severidad.
- Granularidad del presupuesto: periodo, departamento, centro de costo, proyecto, moneda y propietario.
- Cómo se calcula el disponible y de qué fuente salen comprometido y consumido.
- Quién confirma un servicio adicional o un cargo extraordinario.
- Tasas, fechas y redondeo de conversión entre monedas.
- Canal y plazo de la confirmación interna.
- Extracción automática de contratos y presupuestos; proveedor y alcance.
- Retención, borrado y jurisdicción de contratos y presupuestos.
- Adopción formal de este modelo.

## Fuera de esta tarea

- Elegir OCR, ERP, base de datos, correo, JEV o modelo de IA.
- Diseñar tablas, APIs, eventos o un enum de implementación.
- Crear un módulo de contratos, compras, órdenes de compra o presupuesto completo.
- Aprobar, rechazar o pagar facturas.
- Calibrar umbrales o severidades; eso vive en la tarea 14.
- Declarar fraude, legitimidad o responsabilidad legal.
- Usar datos reales de clientes.

## Entregable

`docs/modelo/15-contratos-presupuestos-evidencia.md` con:

- qué es una fuente de evidencia y qué no;
- tipos de fuente y qué pregunta responde cada una;
- modelo conceptual de contrato, anexo, presupuesto y confirmación;
- vigencia, versión, alcance y precedencia entre fuentes;
- vínculo entre factura y fuente, sin inventar relaciones;
- comparación de importe, moneda, periodo, conceptos y límites;
- estados de evidencia y tratamiento de ausencia, ambigüedad y conflicto;
- acoplamiento con severidad y workflow;
- aislamiento y auditoría;
- ejemplos sintéticos;
- pregunta crítica para adoptar.

## Criterios de aceptación

- Una factura sin contrato no se aprueba ni se rechaza solo por esa ausencia.
- Un contrato vencido se registra como hallazgo; no se usa como si estuviera vigente.
- Dos anexos contradictorios producen conflicto explícito, no una elección por conveniencia.
- Una comparación entre monedas distintas sin tasa y fecha queda como evidencia insuficiente.
- Un presupuesto agotado se detecta con el dato disponible; no se infiere de la factura.
- El vínculo entre factura y contrato cita la fuente y la versión aplicadas.
- Una confirmación interna no se convierte en contrato ni en aprobación.
- La ausencia de respuesta no se trata como conformidad.
- Un dato de otro tenant no se usa ni se revela.
- El modelo no elige proveedor ni inventa números.

## Riesgo si se cierra mal

Un sistema que "encuentra" un contrato o un presupuesto inexistente valida gasto contra una fuente fabricada. Eso es peor que no validar: produce una decisión con apariencia de evidencia.
