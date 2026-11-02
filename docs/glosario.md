# Glosario

Términos que el diseño no debe colapsar. Si un documento nuevo usa uno de estos nombres para otra cosa, es un conflicto con el documento maestro.

## Producto

**Financial Operations Intelligence Platform.** Nombre de trabajo. No es la marca comercial. No es un producto oficial de Blinka ni un proyecto respaldado por Blinka.

**Capa de inteligencia.** Interpretación, validación, excepción, workflow, decisión explicable y automatización controlada sobre sistemas que la empresa ya usa. No es un ERP, CRM, banco ni sistema contable.

## Operación

**Factura.** Solicitud de pago. No es una obligación válida por el solo hecho de recibirse.

**Obligación.** Compromiso que el proceso reconoce después de validación y autoridad. El modelo exacto de cuándo una factura pasa a obligación sigue por definir en la tarea de dominio. No declararla válida en la ingesta.

**Aprobación.** Decisión de autorizar una operación dentro de la política. No es un pago ejecutado.

**Instrucción enviada.** Se entregó una orden a un sistema externo. No prueba que el pago exista.

**Procesamiento.** El sistema externo está tratando la instrucción. No es confirmación.

**Confirmación.** La fuente de verdad externa informa el resultado. Hace falta para afirmar que el pago ocurrió.

**Rechazo.** La operación no sigue. Distinto de un timeout.

**Conciliación.** Cruces posteriores entre lo aprobado, lo instruido y lo confirmado. No forma parte de la ejecución del MVP.

**Timeout.** Ausencia de respuesta a tiempo. No significa que un pago falló. Antes de reintentar una acción externa hay que verificar el estado en la fuente de verdad.

## Proveedor

Son controles distintos:

| Término | Qué afirma |
| --- | --- |
| Coincidencia de nombre | Parecido entre textos. No identifica legalmente. |
| Identidad legal | Razón social e identificadores verificados. |
| Validación de cuenta bancaria | La cuenta superó controles reforzados. Un correo o una factura no bastan. |
| Alta de proveedor | El proveedor existe en el registro de la empresa. |
| Autorización para cobrar | Puede recibir pagos según política. Identificar no autoriza. |

**Proveedor habilitado.** Pasó validación de identidad, riesgo y autorización. Un proveedor solo detectado en un documento no está habilitado.

## Dinero y evidencia

**Ahorro potencial.** Estimación. Todavía requiere validación.

**Ahorro validado.** La empresa confirmó la oportunidad.

**Ahorro realizado.** La reducción ocurrió y pudo comprobarse.

**Ausencia de evidencia.** Falta el contrato, el presupuesto, la aprobación o el dato de uso. No es un resultado positivo ni negativo.

**Uso de licencia.** No se infiere de facturas ni de correos. Hace falta evidencia de uso o de no uso.

## Control

**Autenticación.** Quién es el actor. No concede autoridad.

**Autorización.** Si ese actor o proceso puede hacer esa acción, en ese tenant, bajo esa política.

**Segregación de funciones.** Quien prepara no es, cuando la política lo exija, quien aprueba. Maker-checker cuando aplique.

**Override.** Excepción humana con actor, motivo, fecha y evidencia. No es un atajo del modelo de IA.

**Severidad.** Escala conceptual sin calibrar: informativa, baja, media, alta, crítica. Un modelo no baja la severidad por sí solo.

## Autonomía

| Nivel | Puede | No puede, por sí solo |
| --- | --- | --- |
| L0 Observar | Capturar, extraer, clasificar, registrar | Decidir ni actuar |
| L1 Decidir | Evaluar reglas, evidencia, riesgo y política; proponer | Aprobar con autoridad propia |
| L2 Actuar | Aprobar, rechazar, pedir información, escalar o bloquear dentro de la autoridad configurada | Ejecutar un pago real |
| L3 Ejecutar | Preparar o enviar una instrucción y verificar su resultado, solo con integración autorizada | Existir en el MVP como transferencia real |

La autoridad sale de políticas, permisos, segregación y controles técnicos. No sale de un modelo de IA.

## Tenancy

**Tenant.** Una empresa cliente. Tiene sus usuarios, proveedores, facturas, contratos, políticas, departamentos, workflows y registros. El aislamiento se impone en backend y en persistencia.
