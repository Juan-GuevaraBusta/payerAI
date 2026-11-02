# Tarea 01 — Modelo de dominio y estados

**Estado:** discovery. No implementar.
**Fuente:** documento maestro, secciones 5, 6, 7, 8, 9 y 13.
**Depende de:** nada de código. Bloquea el resto de tareas de diseño si los conceptos se mezclan.

## Objetivo

Fijar el lenguaje del dominio de cuentas por pagar y las distinciones de estado que el MVP tiene que conservar. El resultado es un modelo conceptual. No es un esquema de base de datos ni una máquina de estados cerrada.

## Decidido

- El primer dominio es obligaciones y pagos salientes. Accounts Receivable no entra en este modelo.
- Una factura es una solicitud de pago. Recibirla no la convierte en obligación válida.
- Hay que distinguir aprobación, instrucción enviada, procesamiento, confirmación bancaria, rechazo y conciliación.
- Un timeout no es un pago fallido.
- Enviar una solicitud no es un pago exitoso.
- El MVP registra el ciclo. No custodia fondos ni transfiere dinero.
- Contratos, anexos y presupuestos son evidencia de validación. No son un módulo contractual ni de compras completo.
- Cada dato de negocio pertenece a un tenant.

## Hipótesis

- Las empresas distinguen en la práctica al solicitante, al validador, al autorizador y a quien ejecutaría el pago. El hecho de la conversación con el CTO habla de jerarquías de aprobación, no de este reparto exacto de roles.
- Notas crédito, notas débito, facturas corregidas y facturas parciales necesitan entidades o vínculos propios, no solo un campo de texto. Es una hipótesis de modelo: el maestro exige distinguirlas, no elige la forma.

## Abierto

- El catálogo cerrado de estados y de transiciones permitidas.
- Cuándo una factura pasa a ser obligación.
- Si el pago del MVP es solo un registro de estado o también una intención lista para un sistema externo. La ejecución real está fuera.
- Fuentes y detalle de contratos y presupuestos.
- Identidad, roles y onboarding. No inventar el esquema aquí.

## Fuera de esta tarea

- Elegir D1 o PostgreSQL.
- Diseñar tablas, APIs o eventos.
- Modelar ingresos, nómina, reembolsos u órdenes de compra completas.
- Declarar estados de pago ejecutado para una demo que no paga.

## Conceptos que el modelo debe nombrar

Sin convertirlos todavía en tablas.

| Concepto | Qué conserva | Qué no debe implicar |
| --- | --- | --- |
| Tenant | La empresa dueña del dato | Un filtro solo de interfaz |
| Actor | Humano o proceso que actúa | Autoridad por estar autenticado |
| Departamento | Destino de una confirmación interna | Dueño automático del presupuesto |
| Mensaje | Correo o evento de prueba, con hilo | Una factura nueva |
| Documento y versión | Archivo y su revisión | Un único adjunto por operación |
| Factura | Solicitud de pago y campos extraídos si existen | Obligación válida |
| Línea | Concepto, importe y referencia si el documento los trae | Verdad si el campo vino vacío |
| Nota crédito o débito | Ajuste ligado a una operación | Una factura nueva sin vínculo |
| Proveedor | Registro y señales de identidad | Autorización de pago |
| Dato bancario | Cuenta sujeta a control reforzado | Verdad por aparecer en un PDF |
| Contrato o anexo | Condición comercial disponible | Un contrato inventado si no hay fuente |
| Política, presupuesto, límite | Regla configurada por la empresa | Un tope supuesto |
| Hallazgo | Discrepancia con severidad conceptual | Fraude o legitimidad automáticos |
| Workflow de aprobación | Etapa humana o de política | Ejecución de dinero |
| Decisión de auditoría | Evidencia, regla, actor, autoridad | Un log editable en silencio |
| Recurrencia | Patrón de gasto para el módulo B | Licencias sin uso |

## Relaciones que ya son requisito

- Un mensaje se relaciona con adjuntos, documentos, proveedores y operaciones.
- Una operación nueva no es lo mismo que una modificación, una respuesta o una notificación de una operación existente.
- Una factura puede discrepar de un contrato sin que la diferencia sea fraude ni un cargo válido.
- Un proveedor detectado puede no estar habilitado.
- Un mismo documento físico puede llegar con otro nombre de archivo. La identidad del documento no es el nombre.

## Campos de factura

Extraer solo si el documento los trae: proveedor, razón social, identificadores, número, fecha, vencimiento, importe, moneda, impuestos, concepto, líneas y referencias contractuales.

Si un campo no está, el modelo guarda ausencia de evidencia. No rellena el hueco.

## Estados que hay que separar

El nombre final de cada estado sigue abierto. El diseño no puede fusionar estas situaciones:

**Documento:** recibido, ilegible o no soportado, extraído, vinculado a una operación existente, versión que reemplaza a otra.

**Factura:** solicitud registrada, pendiente de evidencia, discrepancia abierta, lista para decisión, aprobada, rechazada, información pedida, escalada, invalidada porque cambió la evidencia después de aprobar.

**Pago:** no iniciado, aprobado para un paso posterior, instrucción preparada, instrucción enviada, en procesamiento, confirmado, rechazado por la fuente externa, timeout con resultado desconocido, conciliado. En el MVP los estados de movimiento real de dinero no se simulan como si hubieran ocurrido.

**Workflow:** en curso, en espera, delegado, bloqueado, cerrado. Quorum, delegación y tiempos exactos están abiertos.

## Entregable

Un modelo conceptual, en prosa o diagrama, que use solo los conceptos de este archivo y del glosario. Cada transición dudosa queda marcada como abierta, no como regla inventada.

## Criterios de aceptación

- Una factura de USD 10.000 contra un contrato mensual de USD 8.000 queda descrita como discrepancia con pedido de evidencia, no como fraude ni como aprobación.
- No existe un estado único que signifique a la vez "aprobado" y "pagado".
- La ausencia de contrato no aprueba ni rechaza sola.
- Notas crédito, reemplazos y reenvíos no crean por defecto una obligación nueva.
- El modelo cabe en un tenant y no contiene datos de Accounts Receivable.

## Riesgo si se cierra mal

Un enum de estados prematuro va a mentir en la demo: dirá que hubo pago, obligación o contrato cuando solo hubo un archivo. Corregir eso después rompe auditoría e idempotencia.
