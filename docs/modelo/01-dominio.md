# Modelo de dominio y estados

Modelo conceptual de la tarea 01. No es un esquema de base de datos, ni una máquina de estados cerrada, ni una API, ni un catálogo de estados con nombres definitivos. Su función es fijar el lenguaje y las distinciones que el MVP no puede fusionar.

## Fuentes y alcance

- [Documento maestro](../documento-maestro.md), secciones 5, 6, 7, 8, 9 y 13.
- [Glosario](../glosario.md).
- [Decisión de la tarea 01](../tareas/01-modelo-de-dominio-y-estados.md).
- [Decisiones adoptadas](../decisiones/adoptadas.md) y [asuntos abiertos](../decisiones/abiertas.md).

Contexto: [master prompt](../../MASTER_PROMPT_FINANCIAL_OPERATIONS.md). Este documento desarrolla un aspecto concreto, no improvisa producto y no cierra ningún asunto de [abiertas.md](../decisiones/abiertas.md).

**Alcance:** obligaciones y pagos salientes (Accounts Payable). Accounts Receivable no forma parte de este modelo y no debe aparecer en sus datos. El MVP registra el ciclo de la operación y no custodia fondos ni mueve dinero.

## Cómo leer este documento

Hay tres registros y no se mezclan:

- **Decidido.** Ya acordado en el documento maestro, en las decisiones adoptadas, en el glosario o en la tarea 01. Es una restricción del modelo.
- **Hipótesis.** Supuesto reversible que aún requiere validación. No es requisito.
- **Abierto.** Falta una decisión. No se presenta como regla, no se implementa y no se usa para cerrar otra discusión.

Toda transición que no figure en el [catálogo adoptado](12-estados-transiciones.md) se rechaza. Este documento describe situaciones que deben poder distinguirse, no la máquina completa.

## Conceptos

Cada concepto conserva una distinción. Ninguno de estos conceptos autoriza por sí solo un pago ni convierte un archivo en una obligación.

### Tenant

- **Conserva:** la empresa dueña de cada dato de negocio. Usuarios, proveedores, facturas, contratos, políticas, departamentos, workflows y registros pertenecen a un tenant.
- **No implica:** un filtro de interfaz. El aislamiento se impone en backend y en persistencia. Ninguna consulta ni mutación cruza tenants sin contexto y autorización.

### Actor

- **Conserva:** el humano o proceso que ejecuta una acción, con su identidad y su contexto de tenant.
- **No implica:** autoridad por estar autenticado. Autenticación responde quién es; autorización responde si puede hacer esa acción, en ese tenant, bajo esa política.

### Departamento

- **Conserva:** el destino de una confirmación interna o de una solicitud de información.
- **No implica:** dueño automático del presupuesto ni autoridad de aprobación.

### Mensaje

- **Conserva:** un correo recibido o un evento de prueba, con su hilo y su origen. Puede ser una factura nueva, una respuesta, un reenvío, una corrección, un reemplazo, una nota crédito o débito, un contrato o anexo, una confirmación de aprobación, una notificación de pago, una consulta o un mensaje no clasificado.
- **No implica:** una factura nueva. La clasificación es una interpretación sujeta a evidencia.

### Documento y versión

- **Conserva:** el archivo recibido y su revisión. La identidad del documento es su contenido y sus señales estables, no el nombre del archivo. Un documento puede llegar repetido con otro nombre y una versión puede reemplazar a otra.
- **No implica:** un único adjunto por operación ni una extracción exitosa. Puede estar ilegible, corrupto, cifrado, no soportado o pendiente de lectura.

### Factura

- **Conserva:** una solicitud de pago y los campos extraídos cuando el documento los trae: proveedor, razón social, identificadores, número, fecha, vencimiento, importe, moneda, impuestos, concepto, líneas y referencias contractuales.
- **No implica:** obligación válida. Recibirla no la convierte en obligación. Si un campo falta, el modelo conserva ausencia de evidencia y no rellena el hueco.

### Línea

- **Conserva:** un concepto, importe y referencia dentro de una factura, cuando el documento los trae.
- **No implica:** verdad cuando el campo vino vacío ni una interpretación unilateral de servicios adicionales.

### Nota crédito o débito

- **Conserva:** un ajuste ligado a una operación existente.
- **No implica:** una factura nueva sin vínculo ni una obligación nueva por defecto.

### Proveedor

- **Conserva:** el registro de la contraparte y las señales de identidad disponibles: nombre comercial, razón social, identificadores y datos de contacto.
- **No implica:** autorización para cobrar. Reconocer un proveedor no lo habilita a recibir pagos.

### Proveedor habilitado

- **Conserva:** el resultado de pasar validaciones de identidad, riesgo y autorización.
- **No implica:** que una factura suya quede aprobada. Un proveedor solo detectado en un documento no está habilitado.

### Dato bancario

- **Conserva:** una cuenta sujeta a control reforzado cuando es nueva o cambia.
- **No implica:** verdad por aparecer en un PDF o en un correo. La extracción no actualiza la cuenta registrada.

### Contrato o anexo

- **Conserva:** una condición comercial disponible como evidencia de validación: vigencia, periodicidad, moneda, montos, conceptos y límites, cuando la fuente existe.
- **No implica:** un módulo contractual completo ni un contrato inventado si no hay fuente. Su ausencia es ausencia de evidencia.

### Política, presupuesto y límite

- **Conserva:** una regla configurada por la empresa para decidir dentro de su autoridad.
- **No implica:** un tope supuesto ni autoridad concedida a un modelo de IA.

### Hallazgo

- **Conserva:** una discrepancia, inconsistencia o falta de evidencia detectada, con una severidad conceptual.
- **No implica:** fraude ni legitimidad automáticos. La severidad no está calibrada y un modelo no la reduce por sí solo.

### Obligación

- **Conserva:** el compromiso que el proceso reconoce después de validación y autoridad.
- **No implica:** que toda factura recibida sea obligación ni que exista obligación en la ingesta. El momento exacto en que una factura pasa a obligación está abierto.

### Aprobación

- **Conserva:** la decisión de autorizar una operación dentro de la política.
- **No implica:** un pago ejecutado ni una confirmación externa.

### Pago

- **Conserva:** el registro del ciclo de pago de una operación, con situaciones que deben permanecer distinguibles.
- **No implica:** movimiento de dinero en el MVP, ni que exista pago por haber una aprobación.

### Instrucción enviada

- **Conserva:** la entrega de una orden a un sistema externo, cuando esa integración exista.
- **No implica:** que el pago exista.

### Procesamiento

- **Conserva:** que un sistema externo está tratando una instrucción.
- **No implica:** confirmación.

### Confirmación

- **Conserva:** el resultado informado por la fuente de verdad externa.
- **No implica:** que se pueda afirmar sin esa fuente. Hace falta para afirmar que el pago ocurrió.

### Rechazo

- **Conserva:** que la operación no sigue, por decisión o por respuesta de una fuente externa.
- **No implica:** un timeout. Rechazo y timeout son situaciones distintas.

### Timeout

- **Conserva:** ausencia de respuesta a tiempo.
- **No implica:** que un pago falló. Antes de reintentar una acción externa hay que verificar el estado en la fuente de verdad.

### Conciliación

- **Conserva:** cruces posteriores entre lo aprobado, lo instruido y lo confirmado.
- **No implica:** ejecución dentro del MVP.

### Workflow de aprobación

- **Conserva:** la coordinación de etapas humanas o de política, con esperas, delegación y cierre.
- **No implica:** ejecución de dinero ni autoridad propia de un actor o de un modelo.

### Decisión de auditoría

- **Conserva:** evidencia, regla, actor, autoridad, resultado, fechas y cambios de estado necesarios para reconstruir una decisión.
- **No implica:** un log editable en silencio.

### Recurrencia

- **Conserva:** un patrón de gasto para el módulo B.
- **No implica:** licencias sin uso ni ahorro demostrado. La ausencia de evidencia de uso no se interpreta como uso ni como falta de uso.

### Ahorro

- **Conserva:** tres distinciones separadas: ahorro potencial (estimación), ahorro validado (confirmado por la empresa) y ahorro realizado (reducción comprobada).
- **No implica:** que una estimación sea un resultado.

### Severidad

- **Conserva:** una escala conceptual: informativa, baja, media, alta, crítica.
- **No implica:** calibración numérica ni reducción automática por un modelo.

### Segregación de funciones y override

- **Conserva:** la separación maker-checker cuando la política lo exige, y la excepción humana con actor, motivo, fecha y evidencia.
- **No implica:** que un override sea un atajo del modelo de IA ni que la autenticación conceda autoridad.

## Relaciones que el modelo conserva

- Un mensaje se relaciona con adjuntos, documentos, proveedores y operaciones.
- Una operación nueva no es lo mismo que una modificación, una respuesta o una notificación de una operación existente.
- Una factura puede discrepar de un contrato sin que la diferencia sea fraude ni un cargo válido.
- Un proveedor detectado puede no estar habilitado.
- Un mismo documento físico puede llegar con otro nombre de archivo; la identidad del documento no es el nombre.
- La ausencia de contrato, presupuesto, aprobación o dato de uso es ausencia de evidencia: no aprueba ni rechaza por sí sola.
- Notas crédito, reemplazos y reenvíos se vinculan a una operación existente y no crean por defecto una obligación nueva.
- Cada dato de negocio pertenece a un tenant.

## Situaciones que no se pueden fusionar

Estas listas conservan la necesidad de distinguir cada situación. El catálogo conceptual y las transiciones permitidas están adoptados en [12-estados-transiciones.md](12-estados-transiciones.md); los nombres técnicos y el enum de implementación no.

### Documento

- Recibido.
- Ilegible o no soportado.
- Extraído.
- Vinculado a una operación existente.
- Versión que reemplaza a otra.

Recibir o extraer un documento no acredita su contenido ni crea obligación. Un documento ilegible no se presenta como extraído.

### Factura

- Solicitud registrada.
- Pendiente de evidencia.
- Discrepancia abierta.
- Lista para decisión.
- Aprobada.
- Rechazada.
- Información pedida.
- Escalada.
- Invalidada porque cambió la evidencia después de aprobar.

Estas situaciones no forman por sí solas una secuencia autorizada. Pasar de una a otra, y quién puede hacerlo, está abierto salvo donde una decisión ya lo fije.

### Pago

- No iniciado.
- Aprobado para un paso posterior.
- Instrucción preparada.
- Instrucción enviada.
- En procesamiento.
- Confirmado.
- Rechazado por la fuente externa.
- Timeout con resultado desconocido.
- Conciliado.

En el MVP los estados de movimiento real de dinero no se simulan como si hubieran ocurrido. La distinción es obligatoria; la secuencia y las condiciones de cada paso están abiertas.

### Workflow

- En curso.
- En espera.
- Delegado.
- Bloqueado.
- Cerrado.

Quorum, delegación y tiempos exactos están abiertos.

## Separaciones que el modelo exige

- **Aprobación no es pago.** Ninguna situación única puede significar a la vez "aprobado" y "pagado".
- **Instrucción enviada no es pago hecho.** Enviar una solicitud no acredita el pago.
- **Procesamiento no es confirmación.** Solo la fuente de verdad externa permite afirmar el resultado.
- **Timeout no es pago fallido.** Exige verificar el estado antes de reintentar.
- **Rechazo no es timeout.** Son resultados distintos.
- **Factura no es obligación.** Recibir una factura no la vuelve obligación válida.
- **Reconocimiento de proveedor no es autorización para cobrar.**
- **Hallazgo no es fraude ni aprobación.**

## Ciclo conceptual

Relato de situaciones, no de transiciones autorizadas. Cada paso marcado como abierto no es una regla.

1. Entra un mensaje o una carga manual, con tenant e identificador de idempotencia. **(Decidido: el canal no cambia el modelo.)**
2. Se clasifica el mensaje y se guardan adjuntos como documentos con versión. **(La clasificación puede quedar no clasificada; abierto.)**
3. Se vincula a una operación existente si hay señales suficientes; si no, no se fuerza el vínculo. **(Transición abierta.)**
4. Se extraen campos solo si el documento lo permite y se registra lo que no se pudo leer. **(Decidido.)**
5. Se valida contra historial, contrato si existe, confirmación interna cuando haga falta y políticas. **(Orden base decidido; el detalle de cada validación está abierto.)**
6. Si aparece una diferencia, falta evidencia o el proveedor no está habilitado, se abre un hallazgo y se pide evidencia, información o escalamiento. **(Transición abierta.)**
7. Se decide aprobar, rechazar, pedir información o escalar dentro de la autoridad configurada. **(La aprobación es decisión; el pago no ocurre aquí.)**
8. La operación puede reconocerse como obligación. **(Abierto: cuándo una factura pasa a obligación.)**
9. El pago se registra en situaciones distintas: no iniciado, aprobado para un paso posterior, instrucción preparada, enviada, en procesamiento, confirmado, rechazado, timeout o conciliado. **(Abierto: si el MVP solo registra o también prepara una intención para un sistema externo. La ejecución real está fuera.)**
10. Toda decisión deja evidencia y trazabilidad reconstruible. **(Decidido.)**

## Casos de aceptación

### Factura de USD 10.000 contra contrato mensual de USD 8.000

La factura es una solicitud de pago. El contrato disponible es evidencia de una condición mensual de USD 8.000. La diferencia de USD 2.000 se registra como hallazgo y discrepancia abierta, con pedido de evidencia o confirmación al departamento responsable sobre servicios adicionales. No se declara fraude, no se declara legítima y no se aprueba por el solo hecho de existir un contrato. La severidad concreta no está calibrada.

### Ninguna situación significa a la vez aprobado y pagado

"Factura aprobada" y "pago confirmado" son distinciones separadas. El MVP no tiene una situación única que las fusione ni simula una confirmación que no recibió.

### Ausencia de contrato

Si no hay contrato disponible, el modelo registra ausencia de evidencia. Esa ausencia no aprueba la factura ni la rechaza por sí sola. La decisión sigue el camino de validación y autoridad que corresponda.

### Nota crédito, reemplazo y reenvío

Una nota crédito o débito, una factura corregida o reemplazada y un reenvío se vinculan a la operación existente. No crean por defecto una obligación nueva. Si el vínculo no puede establecerse con señales suficientes, se escala o se deja pendiente; no se inventa una operación pagable.

### Tenant y alcance

Todo dato de negocio del modelo pertenece a un tenant. El modelo no contiene datos de Accounts Receivable.

## Decidido

- El primer dominio es obligaciones y pagos salientes. Accounts Receivable no entra en este modelo.
- Una factura es una solicitud de pago. Recibirla no la convierte en obligación válida.
- Hay que distinguir aprobación, instrucción enviada, procesamiento, confirmación, rechazo y conciliación.
- Un timeout no es un pago fallido.
- Enviar una solicitud no es un pago exitoso.
- El MVP registra el ciclo. No custodia fondos ni transfiere dinero.
- Contratos, anexos y presupuestos son evidencia de validación. No son un módulo contractual ni de compras completo.
- Cada dato de negocio pertenece a un tenant.
- Identificar un proveedor no lo autoriza a cobrar; la cuenta bancaria nueva o modificada exige control reforzado.
- La ausencia de evidencia no es un resultado positivo ni negativo.

## Hipótesis

- Las empresas distinguen en la práctica al solicitante, al validador, al autorizador y a quien ejecutaría el pago. La conversación con el CTO habla de jerarquías de aprobación, no de este reparto exacto.
- Notas crédito, notas débito, facturas corregidas y facturas parciales necesitan entidades o vínculos propios, no solo un campo de texto. El maestro exige distinguirlas; la forma no está elegida.

## Abierto

- Los nombres técnicos, el enum de implementación y la persistencia de los estados; el catálogo conceptual está adoptado en [12-estados-transiciones.md](12-estados-transiciones.md).
- Cuándo una factura pasa a ser obligación.
- Si el pago del MVP es solo un registro de estado o también una intención lista para un sistema externo. La ejecución real está fuera.
- Fuentes y nivel de detalle de contratos y presupuestos.
- Identidad, roles, onboarding, delegación y quorum. No se inventa el esquema aquí.
- Calibración de la severidad y reglas de riesgo.
- Si una factura modificada después de aprobar exige invalidación o nueva aprobación, y con qué regla.
- El mecanismo concreto de idempotencia y de vinculación entre mensajes, documentos y operaciones.

## Fuera de alcance de este documento

- Elegir D1 o PostgreSQL, proveedor de correo, OCR, frontend, modelo de IA o cualquier otro proveedor.
- Diseñar tablas, APIs, eventos o un enum de estados.
- Modelar ingresos, nómina, reembolsos, órdenes de compra completas o Accounts Receivable.
- Declarar un pago ejecutado para una demo que no paga.
