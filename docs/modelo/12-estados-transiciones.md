# Catálogo de estados y transiciones

Catálogo adoptado de la tarea 12. Convierte las situaciones que la tarea 01 exige distinguir en un catálogo cerrado de estados, transiciones, guardas e invariantes. No es un esquema de base de datos, ni un enum de implementación, ni una elección de motor de workflows.

Este documento **adopta** el cierre conceptual del catálogo. Los nombres son conceptuales. El enum de implementación, los identificadores técnicos y el esquema de persistencia siguen sin adoptarse.

## Fuentes y alcance

- [Documento maestro](../documento-maestro.md), secciones 5.2, 9 y 13.
- [Master prompt](../../MASTER_PROMPT_FINANCIAL_OPERATIONS.md).
- [Glosario](../glosario.md).
- [Decisiones adoptadas](../decisiones/adoptadas.md) y [asuntos abiertos](../decisiones/abiertas.md).
- [Tarea 12](../tareas/12-estados-transiciones.md).
- [Modelo de dominio](01-dominio.md), [validación](04-validacion.md), [workflows](05-workflows-aprobacion.md), [autoridad e IA](07-autoridad-ia.md) y [edge cases](11-edge-cases.md).

**Alcance:** cuentas por pagar. No incluye Accounts Receivable, nómina, reembolsos ni órdenes de compra completas. No custodia fondos ni mueve dinero.

## Cómo leer este documento

- **Decidido.** Ya acordado en el documento maestro, las decisiones adoptadas, el glosario o las tareas 01, 05, 07 y 11.
- **Propuesto.** Parte de esta propuesta que aún requiere adopción. No es una regla vigente hasta que se decida.
- **Hipótesis.** Supuesto reversible. No es requisito.
- **Abierto.** Falta una decisión. No se implementa ni se usa para cerrar otra discusión.

Toda transición que no figure en una tabla de este documento se rechaza. No se completa "porque la demo lo necesita".

## 1. Principios del catálogo

1. **Dimensiones ortogonales.** No hay un enum único de operación. Mensaje, documento, factura, workflow y pago son dimensiones distintas que se componen. Fusionarlas produce estados imposibles, como "aprobado y pagado".
2. **Estado, evento y decisión son cosas distintas.** Un evento es algo que llega. Una transición es un cambio de estado con guarda, autoridad y evidencia. Una decisión es el acto registrado de un actor autorizado.
3. **La autoridad no se hereda.** Cada transición vuelve a comprobar tenant, actor, permiso, política, alcance, segregación y versión de la evidencia. Una aprobación anterior no autoriza una etapa posterior.
4. **La IA propone; no transiciona.** Una salida de modelo puede clasificar, extraer o señalar. No aprueba, no rechaza, no autoriza, no confirma un pago ni reduce severidad.
5. **La ausencia de evidencia no decide.** Falta de contrato, presupuesto o respuesta no aprueba ni rechaza por sí sola.
6. **El silencio no es conformidad.** Una espera sin respuesta no completa una aprobación ni un rechazo.
7. **No se simula.** Un estado reservado no se alcanza en el MVP solo para que la demo se vea completa.
8. **Toda transición deja evidencia reconstruible.** Sin evidencia de autorización, la transición no ocurrió.

## 2. Dimensiones

| Dimensión | Qué responde | Documento que la origina | Alcanzable en el MVP |
| --- | --- | --- | --- |
| Mensaje | Qué llegó y cómo se clasificó | Tareas 01 y 02 | Sí |
| Documento y versión | Qué archivo es y qué se pudo leer | Tareas 01 y 02 | Sí |
| Factura | Qué solicitud de pago existe y en qué situación está | Tareas 01, 04 y 05 | Sí |
| Workflow | Cómo se coordina la decisión | Tarea 05 | Sí |
| Pago | Qué se autorizó, preparó o confirmó | Tareas 01, 07 y 11 | Parcial |
| Obligación | Cuándo el compromiso se reconoce | Tarea 01 | No definida |

La composición mínima: un mensaje puede producir varios documentos; un documento puede vincularse a una factura; una factura tiene un workflow; una factura aprobada puede tener un ciclo de pago. Ninguna composición crea una obligación por sí sola.

## 3. Mensaje e ingesta

La clasificación es una interpretación con evidencia y grado de duda. No crea una operación ni una obligación.

| Estado | Qué conserva | Qué no implica |
| --- | --- | --- |
| `RECIBIDO` | El mensaje llegó con tenant y clave de idempotencia. | Que sea una factura ni que su contenido sea confiable. |
| `CLASIFICADO` | Hay una categoría propuesta con evidencia. | Que la categoría sea correcta ni que exista operación. |
| `NO_CLASIFICADO` | No hay evidencia suficiente para clasificar. | Que el mensaje se descarte. |
| `VINCULADO` | Se relacionó con una operación nueva o existente. | Que se haya creado una obligación. |

| Desde | Transición | Guarda | Autoridad | Hacia |
| --- | --- | --- | --- | --- |
| — | Recepción | Tenant y clave de idempotencia válidos; duplicado exacto no crea mensaje nuevo. | Sistema | `RECIBIDO` |
| `RECIBIDO` | Clasificar | Categoría propuesta con evidencia y grado de duda. | Sistema con propuesta de IA (L0/L1) | `CLASIFICADO` |
| `RECIBIDO` | No clasificar | Evidencia insuficiente o ambigua. | Sistema | `NO_CLASIFICADO` |
| `NO_CLASIFICADO` | Revisar | Revisión humana o reprocesamiento con evidencia nueva. | Actor autorizado o sistema | `CLASIFICADO` |
| `CLASIFICADO` | Vincular a operación nueva | Señales suficientes; no hay operación equivalente. | Sistema determinista | `VINCULADO` |
| `CLASIFICADO` | Vincular a operación existente | Señales suficientes; no crea operación nueva. | Sistema determinista | `VINCULADO` |
| `VINCULADO` | Reenvío idéntico | Mismo contenido y misma operación. | Sistema | Sin cambio (idempotente) |

Un reenvío, una corrección o una nota crédito no abren una operación nueva por defecto. Si el vínculo no puede establecerse con señales suficientes, se deja `NO_CLASIFICADO` o se escala; no se inventa una operación pagable.

## 4. Documento y versión

Un documento puede estar procesado y vinculado a la vez. La versión anterior no se borra: se reemplaza y queda relacionada.

| Estado | Qué conserva | Qué no implica |
| --- | --- | --- |
| `RECIBIDO` | El archivo llegó y tiene identidad por contenido, no por nombre. | Que se haya leído ni que sea una factura. |
| `NO_PROCESABLE` | No se pudo extraer. El motivo se guarda como atributo: ilegible, corrupto, cifrado, demasiado grande o no soportado. | Que el documento no exista ni que su contenido sea válido. |
| `EXTRAIDO` | Se intentó la extracción y se registró lo presente y lo ausente. | Que el contenido sea correcto ni que exista obligación. |
| `VINCULADO` | Se relacionó con una operación o como evidencia de una. | Que la operación esté aprobada. |
| `REEMPLAZADO` | Otra versión lo sustituye; la anterior se conserva. | Que la versión nueva esté aprobada. |

| Desde | Transición | Guarda | Autoridad | Hacia |
| --- | --- | --- | --- | --- |
| — | Recepción | Tenant, identidad por contenido y clave de idempotencia. | Sistema | `RECIBIDO` |
| `RECIBIDO` | Extraer | Lectura completada; se registran campos ausentes. | Sistema | `EXTRAIDO` |
| `RECIBIDO` | No procesar | Fallo de lectura con motivo registrado. | Sistema | `NO_PROCESABLE` |
| `RECIBIDO` | Vincular como evidencia | Documento no factura (contrato, anexo) con vínculo suficiente. | Sistema | `VINCULADO` |
| `NO_PROCESABLE` | Reprocesar | Nuevo intento con OCR o reingesta y evidencia del intento. | Sistema | `EXTRAIDO` |
| `NO_PROCESABLE` | Reemplazar | Llega una versión legible que lo sustituye. | Sistema | `REEMPLAZADO` |
| `EXTRAIDO` | Vincular | Vínculo suficiente con operación existente o nueva. | Sistema | `VINCULADO` |
| `EXTRAIDO` | Reemplazar | Llega una versión nueva antes del vínculo. | Sistema | `REEMPLAZADO` |
| `VINCULADO` | Reemplazar | Llega una versión nueva; se conserva la anterior y la relación. | Sistema | `REEMPLAZADO` |
| `REEMPLAZADO` | — | Estado terminal para esa versión. | — | — |

Reglas adicionales:

- Un documento `NO_PROCESABLE` nunca aparece como `EXTRAIDO` sin un intento nuevo registrado.
- Un mismo contenido con otro nombre de archivo no crea una versión nueva.
- Un contenido distinto con el mismo nombre sí crea una versión nueva.
- `EXTRAIDO` no valida el contenido; solo registra lo que se pudo leer.

## 5. Factura

La factura es una solicitud de pago. Ninguno de sus estados implica obligación, aprobación de pago ni pago.

| Estado | Qué conserva | Qué no implica |
| --- | --- | --- |
| `REGISTRADA` | La solicitud existe con tenant y evidencia vinculada. | Validación completa ni obligación. |
| `EVIDENCIA_PENDIENTE` | Falta evidencia para concluir la validación. | Rechazo ni aprobación. |
| `INFORMACION_PEDIDA` | Se solicitó evidencia o aclaración a un departamento. | Que el silencio apruebe. |
| `DISCREPANCIA_ABIERTA` | Hay un hallazgo o discrepancia registrada con severidad conceptual. | Fraude ni legitimidad. |
| `LISTA_PARA_DECISION` | La validación disponible permite decidir. | Que la decisión esté tomada. |
| `ESCALADA` | La decisión pasó a revisión humana o especializada. | Aprobación implícita. |
| `APROBADA` | Un actor autorizado aprobó dentro de la política. | Pago, obligación ni confirmación externa. |
| `RECHAZADA` | Un actor autorizado decidió que no continúa. | Timeout ni fallo de integración. |
| `INVALIDADA` | Cambió la evidencia después de aprobar y la aprobación anterior no cubre la versión nueva. | Que el nuevo resultado sea rechazo. |

| Desde | Transición | Guarda | Autoridad | Hacia |
| --- | --- | --- | --- | --- |
| — | Registrar | Evidencia vinculada y tenant válido. | Sistema | `REGISTRADA` |
| `REGISTRADA` | Validar con evidencia faltante | Falta evidencia y no hay discrepancia bloqueante. | Sistema | `EVIDENCIA_PENDIENTE` |
| `REGISTRADA` | Abrir discrepancia | Hallazgo registrado con severidad conceptual. | Sistema | `DISCREPANCIA_ABIERTA` |
| `REGISTRADA` | Concluir validación | Validación suficiente y sin hallazgo bloqueante. | Sistema | `LISTA_PARA_DECISION` |
| `EVIDENCIA_PENDIENTE` | Llega evidencia suficiente | Nueva versión de evidencia validada. | Sistema | `LISTA_PARA_DECISION` |
| `EVIDENCIA_PENDIENTE` | Llega evidencia parcial | La evidencia nueva no alcanza para decidir; se registra nueva versión. | Sistema | Sin cambio de estado |
| `EVIDENCIA_PENDIENTE` | Pedir información | Solicitud concreta registrada. | Actor autorizado (L2) | `INFORMACION_PEDIDA` |
| `EVIDENCIA_PENDIENTE` | Abrir discrepancia | La falta de evidencia pasa a hallazgo con severidad. | Sistema | `DISCREPANCIA_ABIERTA` |
| `EVIDENCIA_PENDIENTE` | Escalar | Severidad alta o crítica, o falta de responsable. | Sistema o actor autorizado | `ESCALADA` |
| `INFORMACION_PEDIDA` | Llega respuesta suficiente | Respuesta validada y sin hallazgo bloqueante. | Sistema | `LISTA_PARA_DECISION` |
| `INFORMACION_PEDIDA` | Llega respuesta parcial | La respuesta no alcanza para decidir. | Sistema | `EVIDENCIA_PENDIENTE` |
| `INFORMACION_PEDIDA` | La respuesta abre discrepancia | La respuesta revela diferencia registrada. | Sistema | `DISCREPANCIA_ABIERTA` |
| `INFORMACION_PEDIDA` | Escalar | No hay respuesta o requiere revisión humana. | Actor autorizado | `ESCALADA` |
| `DISCREPANCIA_ABIERTA` | Pedir información | Solicitud concreta sobre la discrepancia. | Actor autorizado (L2) | `INFORMACION_PEDIDA` |
| `DISCREPANCIA_ABIERTA` | Resolver discrepancia | Evidencia suficiente o aceptación explícita registrada. | Sistema o actor autorizado | `LISTA_PARA_DECISION` |
| `DISCREPANCIA_ABIERTA` | Escalar | Severidad alta o crítica. | Sistema o actor autorizado | `ESCALADA` |
| `LISTA_PARA_DECISION` | Aprobar | Autoridad, política, segregación y quorum vigentes para la versión de evidencia actual. | Actor autorizado (L2) | `APROBADA` |
| `LISTA_PARA_DECISION` | Rechazar | Autoridad y motivo registrados. | Actor autorizado (L2) | `RECHAZADA` |
| `LISTA_PARA_DECISION` | Pedir información | La decisión requiere evidencia adicional. | Actor autorizado (L2) | `INFORMACION_PEDIDA` |
| `LISTA_PARA_DECISION` | Escalar | La decisión requiere revisión especializada. | Sistema o actor autorizado | `ESCALADA` |
| `ESCALADA` | Devolver a decisión | Revisión terminada con evidencia suficiente. | Humano especializado | `LISTA_PARA_DECISION` |
| `ESCALADA` | Rechazar | Revisión decide que no continúa. | Humano especializado | `RECHAZADA` |
| `ESCALADA` | Pedir más evidencia | La revisión no concluye. | Humano especializado | `EVIDENCIA_PENDIENTE` |
| `APROBADA` | Invalidar | Cambio material en factura, contrato, datos bancarios, presupuesto o política; versiones registradas. | Sistema o actor autorizado | `INVALIDADA` |
| `INVALIDADA` | Reevaluar | Revalidación con la versión nueva de evidencia. | Sistema o actor autorizado | `LISTA_PARA_DECISION` |
| `INVALIDADA` | Rechazar | Decisión autorizada sobre la versión nueva. | Actor autorizado (L2) | `RECHAZADA` |
| `RECHAZADA` | — | Estado terminal. Una factura nueva o una versión nueva requiere un ciclo nuevo. | — | — |

Reglas adicionales:

- Solo se aprueba desde `LISTA_PARA_DECISION`.
- Solo se rechaza desde `LISTA_PARA_DECISION` o `ESCALADA`. No hay rechazo por silencio.
- `APROBADA` no es terminal, pero su única salida es `INVALIDADA`. No pasa directamente a pago confirmado.
- Una discrepancia no se resuelve en silencio: o hay evidencia nueva o hay aceptación explícita registrada.
- Un cambio material después de aprobar obliga a evaluar invalidación o nueva aprobación. La regla exacta sigue abierta; la transición a `INVALIDADA` y su registro no.

## 6. Workflow

El workflow coordina la decisión. No interpreta documentos, no concede autoridad y no mueve dinero.

| Estado | Qué conserva | Qué no implica |
| --- | --- | --- |
| `EN_CURSO` | Hay una etapa activa y un responsable. | Que la decisión esté tomada. |
| `EN_ESPERA` | Se pidió información, evidencia o una decisión y no llegó. | Que el silencio apruebe. |
| `BLOQUEADO` | Hay una condición explícita que impide avanzar. | Rechazo definitivo ni aprobación pendiente. |
| `CERRADO` | Salió del workflow por una decisión registrada. | Pago. |

Atributos que no son estados:

- `asignacion`: `RESPONSABLE`, `DELEGADA` o `ESCALADA`. Un workflow delegado sigue `EN_CURSO` o `EN_ESPERA`.
- `alcance_delegacion` y `vigencia_delegacion`.
- `motivo_espera` o `motivo_bloqueo`.
- `version_politica` y `version_evidencia`.
- `quorum_requerido` y `quorum_alcanzado`.

| Desde | Transición | Guarda | Autoridad | Hacia |
| --- | --- | --- | --- | --- |
| — | Abrir | Factura con validación concluida y evidencia disponible. | Sistema | `EN_CURSO` |
| `EN_CURSO` | Esperar | Se pidió información o evidencia externa. | Actor autorizado o sistema | `EN_ESPERA` |
| `EN_ESPERA` | Reanudar | Llegó la entrada esperada con versión registrada. | Sistema | `EN_CURSO` |
| `EN_CURSO` | Bloquear | Condición de bloqueo explícita. | Sistema o actor autorizado | `BLOQUEADO` |
| `EN_ESPERA` | Bloquear | Severidad, conflicto o condición que impide avanzar. | Sistema o actor autorizado | `BLOQUEADO` |
| `BLOQUEADO` | Desbloquear | La condición desapareció o un humano autorizado decidió y lo registró. | Humano autorizado | `EN_CURSO` |
| `EN_CURSO` | Cerrar | Decisión registrada: aprobar o rechazar. | Actor autorizado (L2) | `CERRADO` |
| `EN_ESPERA` | Cerrar | Decisión explícita registrada; el silencio no cierra. | Actor autorizado (L2) | `CERRADO` |
| `BLOQUEADO` | Cerrar | Decisión explícita con motivo y evidencia. | Actor autorizado u override humano | `CERRADO` |
| `CERRADO` | — | Estado terminal. Un evento tardío o duplicado no lo revive. | — | — |

Reglas adicionales:

- `DELEGADA` no es un estado: cambia el responsable. Una delegación vencida o revocada impide la transición, pero no crea otro estado.
- `ESCALADA` en la factura corresponde a `EN_CURSO` con `asignacion=ESCALADA`.
- El quorum no alcanzado impide `CERRADO`; cada intento y cada aprobación quedan registrados.
- Un bloqueo no se libera por tiempo transcurrido sin constancia.
- Dos actores concurrentes no producen dos cierres; una decisión queda vigente y ambos intentos se registran.

## 7. Pago

El pago es una dimensión separada. Un pago puede existir solo después de una factura aprobada y de una autorización vigente para el siguiente paso.

| Estado | Qué conserva | Alcanzable en el MVP |
| --- | --- | --- |
| `NO_INICIADO` | No hay ciclo de pago abierto. | Sí |
| `APROBADO_PARA_PASO_POSTERIOR` | La operación quedó aprobada para un paso posterior, con autorización registrada. | Sí |
| `AUTORIZACION_REVOCADA` | La autorización previa dejó de ser válida antes de enviar una instrucción. | Sí |
| `INSTRUCCION_PREPARADA` | Se preparó una intención para un sistema externo; no se envió. | Reservado |
| `INSTRUCCION_ENVIADA` | Se entregó una orden a un sistema externo. | Reservado |
| `EN_PROCESAMIENTO` | El sistema externo está tratando la instrucción. | Reservado |
| `CONFIRMADO` | La fuente de verdad externa informó el resultado. | Reservado |
| `RECHAZADO_EXTERNO` | La fuente externa informó rechazo. | Reservado |
| `TIMEOUT_DESCONOCIDO` | No hubo respuesta a tiempo; el resultado es desconocido. | Reservado |
| `CONCILIADO` | Se cruzaron lo aprobado, lo instruido y lo confirmado. | Reservado |

| Desde | Transición | Guarda | Autoridad | Hacia |
| --- | --- | --- | --- | --- |
| `NO_INICIADO` | Aprobar para paso posterior | Factura `APROBADA` vigente, autorización del siguiente paso y política aplicable. | Motor de autorización o actor L2 | `APROBADO_PARA_PASO_POSTERIOR` |
| `APROBADO_PARA_PASO_POSTERIOR` | Preparar instrucción | Modo "preparar" configurado y autorización vigente. | Sistema | `INSTRUCCION_PREPARADA` (reservado) |
| `INSTRUCCION_PREPARADA` | Enviar instrucción | Integración autorizada y autorización vigente. | Sistema de ejecución | `INSTRUCCION_ENVIADA` (reservado) |
| `INSTRUCCION_ENVIADA` | Acuse externo | Confirmación de entrega o de procesamiento por la fuente externa. | Fuente externa | `EN_PROCESAMIENTO` (reservado) |
| `EN_PROCESAMIENTO` | Confirmar | La fuente de verdad informa pago. | Fuente externa | `CONFIRMADO` (reservado) |
| `EN_PROCESAMIENTO` | Rechazar | La fuente de verdad informa rechazo. | Fuente externa | `RECHAZADO_EXTERNO` (reservado) |
| `INSTRUCCION_ENVIADA` | Timeout | No hay respuesta en el plazo definido. | Sistema | `TIMEOUT_DESCONOCIDO` (reservado) |
| `EN_PROCESAMIENTO` | Timeout | No hay respuesta en el plazo definido. | Sistema | `TIMEOUT_DESCONOCIDO` (reservado) |
| `TIMEOUT_DESCONOCIDO` | Verificar resultado | Consulta a la fuente de verdad; nunca reintento a ciegas. | Fuente externa | `EN_PROCESAMIENTO`, `CONFIRMADO` o `RECHAZADO_EXTERNO` (reservado) |
| `CONFIRMADO` | Conciliar | Cruce posterior registrado. | Sistema | `CONCILIADO` (reservado) |
| `APROBADO_PARA_PASO_POSTERIOR` | Revocar autorización | Factura invalidada o autorización revocada antes de enviar. | Sistema o actor autorizado | `AUTORIZACION_REVOCADA` |
| `INSTRUCCION_PREPARADA` | Revocar autorización | La autorización deja de ser válida antes de enviar. | Sistema o actor autorizado | `AUTORIZACION_REVOCADA` (reservado) |
| `INSTRUCCION_ENVIADA` o posterior | — | No se revoca una instrucción ya enviada; se verifica su resultado. | — | — |
| `AUTORIZACION_REVOCADA` | — | Estado terminal para ese ciclo. Un nuevo ciclo exige nueva aprobación. | — | — |

Reglas adicionales:

- `APROBADO_PARA_PASO_POSTERIOR` no es pago. `INSTRUCCION_ENVIADA` no es pago hecho. `EN_PROCESAMIENTO` no es confirmación.
- `CONFIRMADO` solo se alcanza por la fuente de verdad externa. Ni el envío ni el timeout ni la aprobación lo producen.
- `TIMEOUT_DESCONOCIDO` no es "fallido" ni autoriza reintento. Antes de actuar se verifica el estado.
- `AUTORIZACION_REVOCADA` es una adición adoptada, necesaria para representar un cambio material después de aprobar. No aparece en la lista original de la tarea 01.
- Un pago parcial no marca la factura como pagada: el saldo sigue distinto de cero. La representación exacta del saldo y de los pagos parciales está abierta.
- Un webhook duplicado no crea un segundo pago ni una segunda confirmación.

## 8. Obligación

La obligación es una dimensión separada que este catálogo **no define**. El momento en que una factura pasa a obligación sigue en [asuntos abiertos](../decisiones/abiertas.md).

Invariantes que sí se conservan:

- Ningún estado de mensaje, documento, factura o workflow implica obligación.
- `APROBADA` no es obligación.
- `APROBADO_PARA_PASO_POSTERIOR` no es obligación.
- `CONFIRMADO` no crea por sí solo la regla de obligación.
- La obligación no se declara reconocida sin la decisión que aún falta.

## 9. Invariantes globales

1. No existe un estado ni una transición que signifique a la vez "aprobado" y "pagado".
2. Toda transición comprueba tenant, actor, acción, política, alcance, segregación y versión de evidencia.
3. Solo una decisión vigente por operación y versión de evidencia.
4. Los intentos concurrentes se registran; el intento perdedor no se borra.
5. Una transición con versión de evidencia o política anterior no cubre en silencio la versión nueva.
6. Todo evento duplicado es idempotente y no crea una segunda operación, aprobación ni pago.
7. Un evento tardío o fuera de orden no revive un estado terminal ni reabre un workflow cerrado.
8. Una denegación por concurrencia, permiso o conflicto de política es explícita, no un error silencioso.
9. La ausencia de evidencia no aprueba ni rechaza.
10. El silencio no aprueba ni rechaza.
11. Una salida de IA no es autoridad suficiente para ninguna transición.
12. Un modelo no reduce severidad ni convierte un hallazgo en aprobación.
13. Un cruce entre tenants se detiene y se escala sin revelar si el recurso ajeno existe.
14. Cada transición deja evidencia reconstruible.
15. Toda transición no listada se rechaza.

## 10. Transiciones prohibidas

- `REGISTRADA` o cualquier estado de factura a un estado de pago `CONFIRMADO`.
- `APROBADA` a `APROBADO_PARA_PASO_POSTERIOR` sin autorización independiente del siguiente paso.
- `APROBADA` a obligación reconocida.
- Cualquier estado a `CONFIRMADO` sin fuente de verdad externa.
- `TIMEOUT_DESCONOCIDO` a reintento o a "fallido" sin verificar la fuente de verdad.
- `RECHAZADA` a `APROBADA` sin un ciclo nuevo y una decisión nueva.
- `CERRADO` a `EN_CURSO`.
- `REEMPLAZADO` a `EXTRAIDO` sobre la misma versión.
- `NO_PROCESABLE` a `EXTRAIDO` sin un intento nuevo registrado.
- `INSTRUCCION_ENVIADA` o posterior a `AUTORIZACION_REVOCADA`.
- Cualquier transición cuyo único fundamento sea una salida de IA.
- Cualquier transición que cruce tenants.

## 11. Idempotencia y concurrencia

- Cada evento lleva una clave de idempotencia por tenant y tipo de evento.
- Un duplicado exacto no produce transición; deja constancia de que se recibió de nuevo.
- Cada transición exige la versión actual del estado. Una transición sobre una versión anterior se rechaza como conflicto, no se aplica con last-write-wins.
- Una operación cerrada no revive por un evento tardío.
- Si dos actores compiten por la misma decisión, se conserva una sola decisión vigente y se registran ambos intentos.
- Si dos procesos compiten por la misma transición, se serializa solo el invariante que lo requiera; no se bloquea todo el sistema por defecto.
- El mecanismo concreto de bloqueo, la base de datos y la forma de la clave siguen abiertos.

## 12. Evidencia por transición

Cada transición registra, según aplique:

- tenant y operación;
- estado anterior y estado resultante;
- actor o proceso y autoridad usada;
- documento y versión de evidencia decidida;
- hallazgos, severidad y reglas aplicadas;
- versión de política, presupuesto y límites;
- motivo de la decisión o del bloqueo;
- si intervino IA: modelo, versión, entradas permitidas, salida estructurada y evidencias;
- si hubo delegación: alcance y vigencia;
- si hubo override: actor, motivo y evidencia;
- si hubo conflicto de concurrencia: intentos y resultado;
- fecha y correlation ID.

Sin esta evidencia, la transición no se considera realizada. No se guardan secretos ni datos personales innecesarios.

## 13. Alcanzabilidad en el MVP

| Dimensión | Alcanzable | Reservado o no definido |
| --- | --- | --- |
| Mensaje | Todos los estados. | — |
| Documento | Todos los estados. | — |
| Factura | Todos los estados, con actores autorizados y datos sintéticos. | — |
| Workflow | Todos los estados. | — |
| Pago | `NO_INICIADO`, `APROBADO_PARA_PASO_POSTERIOR`, `AUTORIZACION_REVOCADA`. | `INSTRUCCION_PREPARADA` y posteriores, salvo que se adopte el modo preparar. |
| Obligación | Ninguno. | Toda la dimensión. |

En el MVP, los estados reservados de pago no se simulan como si hubieran ocurrido. Si una demo necesita mostrar el ciclo completo, muestra la distinción y el estado real, no una confirmación inventada.

## 14. Decidido, hipótesis y abierto

### Decidido

- Las dimensiones que no se pueden fusionar: mensaje, documento, factura, workflow, pago y obligación.
- Aprobación no es pago; instrucción enviada no es pago hecho; procesamiento no es confirmación; timeout no es fallido.
- No existe un estado único "aprobado y pagado".
- En el MVP no se simula movimiento real de dinero.
- Toda transición comprueba tenant, autoridad y evidencia.
- La IA no ejecuta transiciones por sí sola.
- Idempotencia y registro de intentos concurrentes son requisitos.
- La obligación no se declara sin decidir el momento.

### Adoptado

- El catálogo conceptual de esta tarea.
- Dimensiones ortogonales en lugar de un enum único de operación.
- `DELEGADA` y `ESCALADA` como atributos de asignación, no como estados del workflow.
- `NO_PROCESABLE` con motivo como atributo.
- `AUTORIZACION_REVOCADA` en el ciclo de pago.
- Rechazo solo desde `LISTA_PARA_DECISION` o `ESCALADA`.
- `APROBADA` con única salida a `INVALIDADA`.
- Nombres conceptuales de estados; no son identificadores de implementación.

### Abierto

- Cuándo una factura pasa a obligación y qué estados tendría esa dimensión.
- Si el MVP prepara una intención de pago o solo registra el ciclo.
- Roles, permisos, segregación y override por transición.
- Quorum, delegación, plazos de espera y caducidad.
- Precedencia de políticas y umbrales inclusivos o exclusivos.
- Qué cambios son materiales y si invalidan o exigen nueva aprobación.
- Si la política y el presupuesto se congelan o se leen en cada transición.
- Calibración de severidad y reglas de riesgo.
- Mecanismo concreto de concurrencia e idempotencia.
- Representación de pagos parciales y saldo.
- Retención, borrado y jurisdicción.
- Nombres técnicos, enum de implementación y persistencia.

### Hipótesis

- Un catálogo cerrado por dimensiones cubre la demo sin inventar obligación ni pago.
- La mayoría de los edge cases de la tarea 11 se expresan como guardas o invariantes sin añadir estados.
- La delegación como atributo evita combinaciones imposibles mejor que un estado `DELEGADO`.

## 15. Casos de aceptación

1. Una factura de USD 10.000 contra un contrato de USD 8.000 queda en `DISCREPANCIA_ABIERTA` con pedido de evidencia; no en `APROBADA` ni en fraude.
2. No existe transición desde `APROBADA` a `CONFIRMADO`.
3. Un timeout produce `TIMEOUT_DESCONOCIDO`, no "fallido"; la verificación es obligatoria antes de reintentar.
4. Un documento ilegible queda `NO_PROCESABLE` y no aparece `EXTRAIDO`.
5. Un reenvío idéntico no crea mensaje, documento, factura ni obligación nuevos.
6. Un webhook duplicado no crea un segundo pago ni una segunda confirmación.
7. Dos aprobadores concurrentes dejan una sola decisión vigente y dos intentos registrados.
8. Una factura modificada después de aprobar pasa a `INVALIDADA` y exige reevaluación; la aprobación anterior no cubre la versión nueva.
9. Un workflow `CERRADO` no revive por un evento tardío.
10. Un actor sin permiso o con delegación vencida no completa la transición.
11. Una salida de IA no produce por sí sola ninguna transición de factura, workflow ni pago.
12. Una factura `RECHAZADA` no pasa a `APROBADA` sin un ciclo nuevo.
13. Una operación de otro tenant se deniega sin revelar si existe.
14. Una factura `APROBADA` no se presenta como obligación ni como pago.
15. Una transición no listada se rechaza.

## 16. Relación con otras tareas

| Tarea | Relación |
| --- | --- |
| 01 Dominio | Origina las situaciones que este catálogo cierra como propuesta. |
| 04 Validación | Alimenta las transiciones de factura con evidencia y hallazgos. |
| 05 Workflows | Define las salidas y la coordinación que este catálogo estructura. |
| 07 Autoridad e IA | Define la autoridad y los límites de la IA que cada transición consume. |
| 10 Seguridad y tenancy | Implementa aislamiento, autorización y auditoría de las transiciones. |
| 11 Edge cases | Aporta los casos que las guardas e invariantes deben cubrir. |

## 17. Fuera de alcance

- Elegir D1 o PostgreSQL, correo, OCR, frontend, modelo de IA o motor de workflows.
- Diseñar tablas, APIs, eventos o un enum de implementación.
- Definir roles, permisos, quorum, plazos, importes o umbrales.
- Definir el momento de la obligación.
- Implementar L3 o simular un pago.
- Cerrar cualquier punto de [asuntos abiertos](../decisiones/abiertas.md) sin una decisión explícita.
