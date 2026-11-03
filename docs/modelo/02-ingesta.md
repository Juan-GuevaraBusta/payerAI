# Ingesta de correo y documentos

Nota de diseño de la tarea 02. Define cómo entra la información al módulo A sin cerrar el mecanismo de correo. No es una integración, ni un esquema, ni una elección de proveedor.

## Fuentes y alcance

- [Documento maestro](../documento-maestro.md), secciones 5.2, 6, 11, 12 y 14.
- [Glosario](../glosario.md).
- [Modelo de dominio](01-dominio.md).
- [Tarea 02](../tareas/02-ingesta-correo-y-documentos.md).

**Depende de:** el modelo de dominio, para no tratar cada archivo como una operación nueva.

**Alcance:** la entrada del módulo A. El mismo modelo debe servir para un PDF cargado a mano, un evento de correo de prueba y una integración real posterior.

## Principios que hereda del modelo

- Un mensaje no es una factura. Recibir o extraer un documento no lo convierte en obligación.
- La identidad de un documento es su contenido y sus señales estables, no el nombre del archivo.
- La ingesta registra y clasifica; no valida la factura ni la aprueba.
- Todo dato de negocio pertenece a un tenant.
- El cuerpo del mensaje y los adjuntos son datos no confiables. Nunca son instrucciones del sistema.

## Categorías de mensaje

El mensaje se clasifica en una de estas categorías, o queda como no clasificado si falta evidencia. La clasificación es una interpretación y no autoriza ninguna acción.

- **Factura nueva.** Indica una solicitud de pago que aún no está vinculada a una operación existente. No la convierte en obligación.
- **Respuesta o conversación de una factura existente.** Aporta contexto, aclaración o evidencia sobre una operación ya registrada.
- **Reenvío del mismo documento.** Repite contenido ya recibido. No abre por defecto una operación nueva.
- **Factura corregida o reemplazada.** Sustituye o corrige una versión anterior. Se vincula a la operación existente; no crea obligación nueva por defecto.
- **Nota crédito o débito.** Ajuste ligado a una operación existente.
- **Contrato o anexo.** Evidencia de condiciones comerciales. No es una factura.
- **Confirmación de aprobación.** Informa una decisión, no un pago ejecutado.
- **Notificación de pago.** Informa un evento de pago. No acredita por sí sola que el pago ocurrió; hace falta la fuente de verdad.
- **Consulta o solicitud de información.** Pide datos o aclaraciones. No es una factura.
- **No clasificado.** No hay evidencia suficiente para asignar categoría. Se conserva para revisión; no se fuerza una operación pagable.

## Registro de la entrada

Toda entrada se registra antes de interpretar:

- Tenant y contexto de autorización del actor o proceso.
- Origen: carga manual o mensaje recibido.
- Identificador de idempotencia de la entrada.
- Fecha y hora de recepción.
- Vínculo con el hilo o la carga de origen, si existe.
- Referencia al contenido original conservado.

El registro no afirma que el contenido sea válido, legible ni pagable.

## Clave de idempotencia

**Hipótesis, no decisión.** Una clave posible sería la combinación de tenant, una huella estable del contenido del documento y las señales de identidad disponibles del mensaje y del adjunto. La forma concreta, el algoritmo y los campos exactos están abiertos.

Restricciones que la hipótesis debe respetar:

- El nombre del archivo no forma parte de la identidad del documento.
- La misma huella de contenido debe reconocerse aunque el archivo llegue con otro nombre, otro mensaje o en otro reenvío.
- Una huella igual no basta para vincular una operación: identifica el contenido, no la intención ni la obligación.
- Un documento corregido o reemplazado puede compartir señales con el anterior pero ser una versión distinta. Debe poder registrarse como versión, no como operación nueva.
- La ambigüedad se escala; no se resuelve creando una operación.

La deduplicación de facturas semánticamente parecidas, con variaciones pequeñas, es un requisito del maestro. Sus umbrales y reglas están abiertos.

## Datos mínimos del documento

Solo se registran si están disponibles. Si faltan, se guarda ausencia de evidencia y no se rellena el hueco.

- Tenant.
- Versión del documento y relación con versiones anteriores.
- Huella de contenido estable.
- Tipo de archivo y tamaño.
- Mensaje o carga de origen.
- Fecha de recepción.
- Estado de lectura: legible, ilegible, no soportado, cifrado, corrupto o pendiente.
- Campos extraídos de la factura cuando el documento los trae: proveedor, razón social, identificadores, número, fecha, vencimiento, importe, moneda, impuestos, concepto, líneas y referencias contractuales.
- Constancia explícita de cada campo que no se pudo leer.

No se inventan campos, montos, contratos ni números de factura.

## Vínculo con operaciones existentes

Se intenta vincular cuando hay señales suficientes, por ejemplo identificadores de proveedor, número de factura, importe, moneda, fecha, referencia contractual o hilo de conversación. El nombre del archivo, el asunto por sí solo o el parecido de nombres no son señales suficientes.

- Si el vínculo es suficiente, el documento se asocia a la operación existente y se clasifica como respuesta, reenvío, corrección, reemplazo, nota o notificación.
- Si no lo es, no se fuerza el vínculo ni se inventa una operación pagable. El mensaje queda pendiente, no clasificado o escalado.
- Un hilo con varios adjuntos no se modela como varias facturas sin revisión. Cada adjunto se registra y se vincula por separado; la interpretación del conjunto requiere revisión cuando no hay evidencia suficiente.
- Una operación nueva se distingue de una modificación, una respuesta o una notificación de una operación existente.

Estas reglas de vinculación son conceptuales. La condición exacta de suficiencia y el orden de comprobación están abiertos.

## Extracción

- Se extrae solo lo que el documento permite.
- Se deja constancia de lo que no se pudo leer.
- Un archivo corrupto, cifrado, demasiado grande o de formato no soportado se aparta sin simular una extracción.
- El límite de tamaño, los tipos aceptados y la política para archivos problemáticos están abiertos.
- El OCR y la extracción de documentos escaneados están abiertos. No se elige técnica ni proveedor aquí.

## Contenido hostil

El cuerpo del correo, el texto oculto y los adjuntos son datos no confiables. Pueden contener instrucciones dirigidas a un modelo o a un operador. Nunca se tratan como política, como instrucción del sistema ni como orden de aprobar, pagar o saltarse un control.

## Idempotencia en el ciclo

Camino conceptual para el mismo contenido con dos nombres de archivo:

1. Se calcula la identidad estable del contenido, no la del nombre.
2. Se busca un documento existente con la misma identidad en el mismo tenant.
3. Si existe, se registra como el mismo documento o como una nueva versión según corresponda, y se vincula a la operación existente.
4. Si hay duda sobre si es el mismo documento o una versión distinta, se escala. No se crea una obligación nueva.

Un reenvío sigue el mismo camino y no abre por defecto otra obligación.

## Correo: opciones y criterios, sin elegir

Opciones a comparar, sin seleccionar ninguna:

- Carga manual de archivos para demo y desarrollo.
- Eventos de correo de prueba claramente sintéticos.
- Recepción por un servicio de correo entrante que entregue eventos o adjuntos.
- Consulta periódica de un buzón.
- Alias o dirección por tenant que reenvíe a la plataforma.

Criterios para aplazar la elección:

- Costo y límites reales del canal, incluido el costo de salida.
- Seguridad, autenticidad del remitente y tratamiento de adjuntos.
- Aislamiento por tenant y posibilidad de alias o dirección por empresa.
- Idempotencia y comportamiento ante entregas duplicadas, tardías o fuera de orden.
- Retención, datos personales y qué se conserva.
- Tamaño y tipos de adjunto admitidos.
- Latencia y capacidad de procesar fuera de una sola invocación.
- Observabilidad y facilidad de reintento.
- Viabilidad de migrar a otro canal sin cambiar el modelo de dominio.

Ninguna opción se adopta en este documento. La elección requiere volumen, tipo de documentos, revisión de seguridad y costo medido.

## Demo de costo cero

Permitido:

- Carga manual de PDF.
- Eventos de correo de prueba claramente sintéticos.

No permitido:

- Presentar la carga manual como una integración real de buzón.
- Usar facturas reales de clientes.
- Omitir tenant, huella o identificador estable y después no poder deduplicar.

La tensión entre el límite de CPU de una invocación gratuita y la extracción pesada es una medición pendiente, no una decisión de abandonar la plataforma.

## Decidido

- El correo es el canal deseado al inicio.
- La carga manual y los eventos de prueba están permitidos para demo y desarrollo.
- Esos atajos no cambian el modelo de dominio.
- Hay que conservar el vínculo entre mensaje, adjunto, documento, proveedor y operación.
- Hay que distinguir factura nueva, respuesta, reenvío, corrección, reemplazo, nota crédito o débito, contrato o anexo, confirmación de aprobación, notificación de pago y consulta.
- El contenido del correo y del documento es dato no confiable. No es una instrucción del sistema.
- La ingesta tiene que ser idempotente: el mismo documento, aunque cambie el nombre del archivo, no debe crear otra obligación.

## Hipótesis

- En las empresas objetivo el correo es el canal real de recepción. Sale de la hipótesis de problema, no de una medición.
- Una bandeja por tenant, o un alias por empresa, bastará para la primera integración. Es reversible y no está decidida.
- La clave de idempotencia propuesta arriba es suficiente como punto de partida, sin haber sido probada con documentos reales.

## Abierto

- Proveedor, protocolo y mecanismo de correo. Comparar costo, seguridad, viabilidad y costo de salida.
- OCR y extracción de documentos escaneados.
- Límite de tamaño, tipos aceptados y política para archivos cifrados, corruptos o no soportados.
- Si la demo de costo cero usa solo carga manual o también eventos simulados.
- Algoritmo y campos exactos de la clave de idempotencia.
- Umbrales y reglas de duplicado exacto y de duplicado probable.
- Condición exacta de suficiencia para vincular un mensaje a una operación existente.
- Orden de comprobación entre vínculo, clasificación y extracción.

## Criterios de aceptación cubiertos

- El mismo PDF con dos nombres de archivo tiene un camino de deduplicación descrito.
- Un hilo con varios adjuntos no se modela como varias facturas sin revisión.
- Un reenvío no abre por defecto otra obligación.
- La nota lista opciones de correo sin elegir una.
- Queda escrito que el cuerpo y los adjuntos no son prompts de sistema.

## Fuera de alcance

- Contratar un servicio de correo entrante de pago.
- Procesar el cuerpo del mensaje con un modelo en todos los casos.
- Dar por válida la factura en el momento de la ingesta.
- Guardar secretos de la integración en el repositorio.
- Diseñar tablas, APIs o eventos.
