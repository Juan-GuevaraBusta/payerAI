# Proveedores: identidad y autorización

Matriz de decisión conceptual de la tarea 03. Separa reconocimiento, alta, riesgo y autorización de pago. No es un esquema, ni un flujo cerrado, ni una elección de proveedor externo.

## Fuentes y alcance

- [Documento maestro](../documento-maestro.md), secciones 5.2, 7 y 13.
- [Glosario](../glosario.md).
- [Modelo de dominio](01-dominio.md).
- [Tarea 03](../tareas/03-proveedores-identidad-y-autorizacion.md).

**Depende de:** el modelo de dominio.

**Alcance:** el reconocimiento y la habilitación de proveedores dentro de un tenant. Un proveedor visto en una factura no queda habilitado para cobrar.

## Controles que no se confunden

Son decisiones distintas y ninguna implica la siguiente:

- **Coincidencia de nombre.** Parecido entre textos. No identifica legalmente.
- **Identidad legal.** Razón social e identificadores verificados.
- **Validación de cuenta bancaria.** La cuenta superó controles reforzados. Un correo o una factura no bastan.
- **Alta de proveedor.** El proveedor existe en el registro de la empresa.
- **Autorización para cobrar.** Puede recibir pagos según política. Identificar no autoriza.

Un proveedor habilitado pasó identidad, riesgo y autorización. Un proveedor solo detectado en un documento no está habilitado.

## Matriz de decisión

La matriz es conceptual. No fija umbrales, algoritmos ni campos. "Reconocer" significa aceptar la coincidencia de identidad para seguir con la validación de la factura; no significa aprobar el pago.

| Situación | Qué se conserva | Resultado esperado en el modelo | Lo que no se puede hacer |
| --- | --- | --- | --- |
| Los identificadores verificados coinciden con un proveedor habilitado | La identidad legal coincide con un registro habilitado | Reconocer al proveedor y seguir la validación de la factura | Aprobar el pago por el solo reconocimiento |
| Solo coincide el nombre comercial | Hay parecido de texto, no identidad legal | No reconocer como identidad. Escalar para revisión | Fusionar, habilitar ni pagar por parecido de nombre |
| No hay proveedor previo | El documento aporta datos de una contraparte desconocida | Extraer los datos y dejar al proveedor no habilitado. Pedir validación de identidad, riesgo y autorización | Crear un proveedor habilitado desde la factura o el correo |
| Mismo nombre, identificadores distintos | Hay homónimos o datos inconsistentes | Escalar. No fusionar | Unificar registros por nombre |
| Misma identidad, cuenta bancaria distinta de la registrada | La cuenta cambió o no está verificada | No actualizar la cuenta. Aplicar control reforzado y escalar | Aceptar la cuenta nueva porque aparece en el documento |
| Proveedor reconocido, factura por encima de la política | La identidad está reconocida, pero la operación excede la regla | Mantener el reconocimiento y tratar la factura por el camino de validación y autoridad | Usar el reconocimiento como aprobación del pago |

Las cinco primeras filas son situaciones de identidad. La última separa identidad de autoridad sobre la operación.

## Reglas de identidad

- Los identificadores fiscales o de registro serán la señal principal de coincidencia, y el nombre será solo apoyo. Es una hipótesis razonable, no medida con documentos reales.
- Ningún camino va de "nombre parecido" a "puede cobrar".
- No se fusionan proveedores por nombre parecido. La ambigüedad escala.
- Un puntaje de modelo no es la única condición de identidad. No sustituye identificadores verificados, controles de riesgo ni autorización.
- La coincidencia de identidad no autoriza el pago ni la actualización de datos bancarios.
- La ausencia de proveedor previo no rechaza la factura. Deja al proveedor no habilitado y abre validación.

## Situaciones del proveedor que no se mezclan

No forman un catálogo cerrado ni un enum. Los nombres finales y las transiciones permitidas están abiertos.

- **Detectado en un documento.** Existe como dato extraído, no como proveedor habilitado.
- **Registrado sin habilitar.** Existe en el registro del tenant, pero no puede recibir pagos.
- **En validación de identidad, riesgo o autorización.** Hay controles pendientes.
- **Habilitado.** Pasó identidad, riesgo y autorización.
- **Con autorización revocada o suspendida.** Debe poder dejar de estar habilitado; el mecanismo está abierto.

El paso entre estas situaciones, quién lo ejecuta y qué evidencia lo respalda están abiertos, salvo las separaciones ya decididas.

## Dato bancario

- Una cuenta nueva o modificada exige control reforzado.
- La extracción automática no actualiza la cuenta registrada.
- Una factura o un correo no bastan para aceptar la cuenta.
- La validación contra un banco real está fuera del MVP.
- La coincidencia de identidad no valida la cuenta.

## Flujo conceptual

Relato de situaciones, no de transiciones autorizadas.

1. Llega un documento con datos de proveedor. **(Transición abierta.)**
2. Se extraen los datos disponibles y se comparan con el registro del tenant. **(Decidido: la extracción no habilita.)**
3. Si los identificadores verificados coinciden con un proveedor habilitado, se reconoce. **(Decidido.)**
4. Si solo coincide el nombre, o hay homónimos o identificadores inconsistentes, se escala. **(Decidido: no se fusiona.)**
5. Si no hay proveedor previo, queda no habilitado y se piden identidad, riesgo y autorización. **(Decidido.)**
6. Si la cuenta bancaria es nueva o cambió, se aplica control reforzado y no se actualiza por extracción. **(Decidido.)**
7. La habilitación se resuelve con la autoridad configurada. **(Abierto: quién habilita y si hace falta más de una persona.)**
8. La factura sigue su propio camino de validación y autoridad. **(Decidido: el reconocimiento no aprueba el pago.)**

## Decidido

- Modelo híbrido.
- Proveedor existente: reconocimiento automático solo si la coincidencia con identificadores y atributos verificados es suficiente.
- Proveedor nuevo: se puede detectar y extraer; identidad, riesgo y autorización son previas a habilitarlo.
- Casos ambiguos escalan. No se resuelven por parecido de nombre.
- Ambigüedad nombrada: nombre comercial distinto de la razón social, homónimos, identificadores inconsistentes, datos bancarios modificados.
- Identificar no autoriza el pago.
- Cuenta bancaria nueva o modificada: control reforzado. Una factura o un correo no bastan para aceptarla.
- Un proveedor detectado puede no estar habilitado.
- El proveedor nuevo tiene un estado visible de no habilitado hasta la autorización.

## Hipótesis

- Los identificadores fiscales o de registro serán la señal principal de coincidencia, y el nombre será solo apoyo. Es razonable y reversible. No está medido con documentos reales.
- El departamento de procurement o finanzas será quien habilite proveedores nuevos. El rol exacto está abierto.

## Abierto

- Qué identificadores cuentan como verificados, por jurisdicción. Depende del mercado, también abierto.
- Umbral numérico de coincidencia. No se inventa un score.
- Condición exacta de suficiencia para el reconocimiento automático.
- Quién puede habilitar y si hace falta más de una persona.
- Cómo se revoca o suspende una autorización ya dada.
- Integración con listas de riesgo o bancos. Fuera del MVP si implica servicios de pago o datos no disponibles.
- Tratamiento de proveedores con nombre comercial distinto de la razón social cuando los identificadores no son concluyentes.

## Criterios de aceptación cubiertos

- Ningún camino va de "nombre parecido" a "puede cobrar".
- Un cambio de cuenta no se aplica por extracción automática.
- El proveedor nuevo tiene un estado visible de no habilitado hasta la autorización.
- La matriz no usa un puntaje de modelo como única condición de identidad.

## Fuera de alcance

- Verificar cuentas contra un banco real.
- Dar de alta al proveedor en un ERP.
- Autorizar el pago de su factura en el mismo paso que el alta.
- Fusionar dos proveedores por nombre parecido sin escalar.
- Diseñar tablas, APIs, eventos o un enum de estados.
