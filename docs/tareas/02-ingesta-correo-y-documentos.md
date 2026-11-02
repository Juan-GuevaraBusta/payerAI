# Tarea 02 — Ingesta de correo y documentos

**Estado:** discovery. No elegir proveedor ni escribir integración.
**Orquestador:** `.cursor/agents/ingesta-documentos.md`. Skill: `principle-make-operations-idempotent`.
**Fuente:** documento maestro, secciones 5.2, 6, 11, 12 y 14.
**Depende de:** [modelo de dominio](01-modelo-de-dominio-y-estados.md) para no tratar cada archivo como una operación nueva.

## Objetivo

Definir cómo entra la información al módulo A sin cerrar el mecanismo de correo. El dominio debe servir igual para un PDF cargado a mano, un evento de correo de prueba y una integración real posterior.

## Decidido

- El correo es el canal deseado al inicio.
- La carga manual y los eventos de prueba están permitidos para demo y desarrollo.
- Esos atajos no cambian el modelo de dominio.
- Hay que conservar el vínculo entre mensaje, adjunto, documento, proveedor y operación.
- Hay que distinguir factura nueva, respuesta, reenvío, corrección, reemplazo, nota crédito o débito, contrato o anexo, confirmación de aprobación, notificación de pago, y consulta.
- El contenido del correo y del documento es dato no confiable. No es una instrucción del sistema.
- La ingesta tiene que ser idempotente: el mismo documento, aunque cambie el nombre del archivo, no debe crear otra obligación.

## Hipótesis

- En las empresas objetivo el correo es el canal real de recepción. Sale de la hipótesis de problema, no de una medición.
- Una bandeja por tenant, o un alias por empresa, bastará para la primera integración. Es reversible y no está decidida.

## Abierto

- Proveedor, protocolo y mecanismo de correo. Comparar costo, seguridad, viabilidad y qué tan difícil es salir de esa elección.
- OCR y extracción de documentos escaneados.
- Límite de tamaño, tipos MIME aceptados y qué se hace con cifrados o corruptos. El caso está nombrado; la política no.
- Si la demo de costo cero usa solo carga manual o también eventos simulados. Ambos están permitidos.

## Fuera de esta tarea

- Contratar un servicio de inbound email de pago.
- Procesar el cuerpo del mensaje con un LLM en todos los casos.
- Dar por válida la factura en el momento de la ingesta.
- Guardar secretos de la integración en el repositorio.

## Comportamiento que el diseño debe fijar

1. Registrar el mensaje o la carga, el tenant y un identificador de idempotencia.
2. Guardar adjuntos como documentos con versión, no solo como nombre de archivo.
3. Clasificar el mensaje en una de las categorías de la sección 6 del documento maestro, o en "no clasificado" si falta evidencia.
4. Vincular a una operación existente cuando haya señales suficientes. Si no las hay, no forzar el vínculo ni inventar una operación pagable.
5. Extraer campos solo cuando el documento lo permita. Dejar constancia de lo que no se pudo leer.
6. Rechazar o apartar archivo corrupto, cifrado, demasiado grande o de formato no soportado, sin simular una extracción.
7. Tratar texto oculto o instrucciones dirigidas al modelo como contenido hostil, nunca como política ni como orden de aprobar.

## Demo de costo cero

Permitido:

- Carga manual de PDF.
- Eventos de correo de prueba claramente sintéticos.

No permitido:

- Presentar esa carga como una integración real de buzón.
- Usar facturas reales de clientes.
- Omitir tenant, hash o identificador estable y luego no poder deduplicar.

## Entregable

Una nota de diseño de ingesta con: categorías de mensaje, clave de idempotencia propuesta como hipótesis, datos mínimos del documento y criterios para aplazar la elección del proveedor de correo.

## Criterios de aceptación

- El mismo PDF con dos nombres de archivo tiene un camino de deduplicación descrito.
- Un hilo con varios adjuntos no se modela como varias facturas sin revisión.
- Un reenvío no abre por defecto otra obligación.
- La nota lista opciones de correo sin elegir una.
- Queda escrito que el cuerpo y los adjuntos no son prompts de sistema.

## Riesgo si se cierra mal

Elegir un inbound de pago, o un parser que solo entiende un formato, antes de saber el volumen y el tipo de documentos. El límite de CPU de Workers Free (10 ms por invocación, cifra del 2026-11-01) hace improbable que la extracción pesada viva dentro de una sola invocación gratuita. Eso es una tensión a medir, no una decisión de abandonar Cloudflare.
