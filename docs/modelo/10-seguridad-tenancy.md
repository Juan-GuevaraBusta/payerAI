# Seguridad, multi-tenancy y auditoría

**Estado:** criterios adoptados el 2026-11-12; controles obligatorios de demo. El modelo conceptual de identidad, roles y aprobaciones está adoptado en [13-identidad-aprobaciones.md](13-identidad-aprobaciones.md); la estructura de riesgo, severidad y umbrales está adoptada en [14-riesgo-severidad-umbrales.md](14-riesgo-severidad-umbrales.md). El proveedor de identidad, el catálogo definitivo, los valores de umbral, los mecanismos técnicos, la auditoría y la retención siguen abiertos. No implementar.
**Tarea:** 10.
**Depende de:** las tareas 01 a 09.
**Orquestador:** `.cursor/agents/seguridad-tenancy.md`.
**Skill:** `review-security`.
**Fuente:** documento maestro, secciones 7, 9, 13 y 15.

## Fuentes y alcance

Este documento fija los controles que no se pueden posponer: aislamiento entre empresas, autorización distinta de autenticación, trazabilidad reconstruible, manejo de secretos, idempotencia y concurrencia. No elige proveedor de identidad, no define tablas, no cierra el catálogo definitivo de roles ni el esquema técnico y no implementa código. El modelo conceptual está adoptado en [13-identidad-aprobaciones.md](13-identidad-aprobaciones.md).

Los controles valen para la demo y para el primer piloto. La demo usa datos sintéticos y marcados; un piloto con datos reales exige revisar jurisdicción, retención, residencia, borrado y acceso antes de reutilizar estos mismos controles.

## Decisión adoptada (2026-11-12)

- Se adopta el catálogo `C-01` a `C-40` como controles obligatorios de demo.
- `C-01` a `C-24` y `C-26` a `C-40` son exigibles en la demo con datos sintéticos. `C-25` se exige antes de un piloto con datos reales y no bloquea la demo.
- La adopción es del **control y su evidencia**, no de una implementación. Un control adoptado no acredita que una base, un proveedor o una pantalla ya lo cumplan.
- Se adopta la separación entre controles de demo y controles que esperan jurisdicción, catálogo de roles, mecanismo de auditoría o esquema técnico.
- No se elige aquí proveedor de identidad, base de datos, mecanismo de aislamiento, algoritmo de quorum, forma de verificación bancaria ni tecnología de audit log.

## Principios que no se negocian

- **Denegar por defecto.** Si falta tenant, actor, permiso, política, evidencia o contexto, la operación se deniega. La ausencia de un dato no concede autoridad.
- **Autenticación no es autorización.** Saber quién es el actor no dice qué puede hacer con este recurso, en este tenant, en esta operación y en este momento.
- **El tenant no se deduce del frontend.** Cada consulta y cada mutación recibe y comprueba el tenant en backend y en persistencia.
- **La IA interpreta y señala.** No concede autoridad, no aprueba, no autoriza, no ejecuta, no delega y no forma parte de un quorum.
- **Aprobar no es pagar.** Una instrucción enviada no es un pago hecho. Un timeout no es un pago fallido ni un pago exitoso.
- **El contenido no es instrucción.** Correos, PDF, adjuntos, nombres de archivo y metadatos son datos no confiables. Nunca cambian reglas, permisos ni políticas.
- **Nada se simula.** Si una función no existe, no se devuelve un estado que sugiera que ocurrió.

## Modelo de control

Cada operación debe poder responder estas preguntas antes de ejecutarse:

| Pregunta | Respuesta mínima | Si falta |
| --- | --- | --- |
| ¿De qué tenant es el dato? | Identificador de tenant resuelto en backend, no aceptado a ciegas del cliente | Denegar |
| ¿Quién pide la acción? | Actor humano o proceso autenticado | Denegar |
| ¿Qué permiso y qué política la permiten? | Acción, recurso, alcance, vigencia, política y versión | Denegar |
| ¿Qué evidencia quedó? | Registro de decisión con actor, política, evidencia y resultado | Denegar o marcar incompleto |
| ¿Qué pasa si el recurso es de otro tenant? | Se deniega sin revelar si existe | Devolver el mismo resultado que un recurso inexistente |
| ¿Qué pasa si dos actores compiten? | Una sola decisión vigente; el perdedor recibe conflicto explícito | Denegar el intento perdedor y registrarlo |
| ¿Qué pasa si el contenido trae instrucciones? | Se trata como dato; no cambia permisos ni política | Ignorar la instrucción y registrar la señal |

## Controles obligatorios de demo

Cada control nombra la amenaza que corta y la evidencia que lo demuestra. “Implementado” no significa “probado”; la columna de verificación es la que manda.

### Aislamiento entre tenants

| ID | Control | Amenaza que corta | Verificación en demo |
| --- | --- | --- | --- |
| C-01 | Toda entidad de negocio lleva `tenant_id` y toda consulta lo usa como predicado obligatorio | Fuga de facturas, proveedores o políticas entre empresas | Prueba con dos tenants sintéticos: el tenant A no ve ni cuenta filas del tenant B |
| C-02 | La persistencia impone el aislamiento además del backend: política de fila, esquema por tenant, base por tenant o restricción equivalente | Una consulta que olvida el filtro devuelve datos ajenos | Prueba directa contra la base sin pasar por la API |
| C-03 | Un identificador de otro tenant se trata como inexistente: se deniega sin revelar existencia, nombre ni estado | Enumeración de recursos y fuga por diferencia de error | Mismo código y mismo mensaje para “no existe” y “es de otro tenant” |
| C-04 | Búsqueda, listados, exportaciones, métricas, URLs firmadas y adjuntos aplican el mismo tenant | Fuga por una superficie lateral | Prueba de búsqueda y descarga cruzada; la URL de A no sirve para B |
| C-05 | Cachés, resultados, embeddings, extracciones y comparaciones se separan por tenant o no se comparten | Mezcla de datos financieros en un cache global | Prueba de dos tenants con el mismo nombre de archivo y contenido distinto |
| C-06 | Los trabajos en segundo plano, reintentos, webhooks y eventos conservan el tenant y vuelven a autorizar | Un job pierde contexto y escribe en el tenant equivocado | Prueba de evento duplicado y de job reanudado con tenant A |
| C-07 | Logs, trazas y métricas no mezclan cuerpos de documentos ni datos personales de varios tenants en un mismo registro | Fuga por observabilidad | Revisión de un log de prueba: solo IDs, tenant, correlación y resultado |
| C-08 | Los datos de demo son sintéticos, marcados y no reversibles a una persona o empresa real | Uso de datos reales en un entorno de prueba | Inventario de datos de demo con etiqueta y origen |

`C-02` exige que la persistencia imponga el aislamiento; no elige el mecanismo. D1 es el default de demo, pero esta decisión no acredita que D1 tenga políticas de fila. La demo debe demostrar el control con dos tenants y una prueba directa contra la capa de datos, sin afirmar una capacidad no verificada.

### Autorización, roles y segregación

| ID | Control | Amenaza que corta | Verificación en demo |
| --- | --- | --- | --- |
| C-09 | Autorización separada de autenticación: se evalúa actor, acción, recurso, tenant, política, alcance y vigencia | Un usuario autenticado hace todo | Prueba con el mismo usuario en dos tenants y con dos permisos distintos |
| C-10 | Denegar por defecto; ningún permiso se hereda por rol implícito ni por ausencia de política | Autorización implícita | Prueba de actor sin permiso: recibe denegación explícita |
| C-11 | Roles y permisos explícitos, con catálogo abierto y mínimo privilegio | Permisos acumulados por conveniencia | Matriz de pruebas por rol y por acción, sin roles inventados |
| C-12 | Maker-checker cuando la política lo exige: quien prepara no aprueba la misma operación | Autoprobación y fraude interno | Prueba de mismo actor en ambos pasos: se bloquea |
| C-13 | Delegación con delegante, delegado, alcance, vigencia, motivo y revocación | Delegación permanente o total | Prueba de delegación vencida y de delegación fuera de alcance |
| C-14 | Quorum cuando la política lo exige; el mecanismo exacto está abierto, pero el conteo y la identidad de cada aprobador son verificables | Un solo actor simula varias aprobaciones | Prueba de aprobadores distintos y de aprobador repetido |
| C-15 | Precedencia de políticas explícita y resolución de conflictos registrada | Una política contradice a otra y gana la última evaluada | Prueba con dos políticas en conflicto: se registra cuál prevaleció y por qué |
| C-16 | Override humano con actor, motivo, fecha, evidencia y autoridad usada | Excepción sin rastro o sin permiso | Prueba de override sin motivo: se rechaza; con motivo: queda registrado |
| C-17 | La IA no aparece como actor con permiso de aprobar, autorizar, ejecutar, delegar ni formar quorum | Conceder autoridad a un modelo | Revisión de la matriz de permisos: la IA solo interpreta o señala |
| C-18 | La información bancaria nueva o cambiada no se acepta solo desde el documento; exige un control adicional y fuera de banda | Cambio de cuenta por factura manipulada | Prueba de cambio de cuenta desde PDF: no se aplica sin verificación adicional |
| C-19 | Los permisos de administración no se mezclan con los de aprobación si la política exige segregación | Administrador que también aprueba y paga | Prueba de conflicto de funciones según política |

`C-18` se apoya en el maker-checker de [T03](03-proveedores.md): la extracción no actualiza la cuenta y un segundo actor con permiso autoriza el cambio. La forma exacta de verificación fuera de banda sigue abierta.

### Trazabilidad y auditoría

| ID | Control | Amenaza que corta | Verificación en demo |
| --- | --- | --- | --- |
| C-20 | Cada transición deja un registro reconstruible con tenant, operación, documento y versión, evidencia consultada y ausente, regla y versión de política, actor o proceso, decisión, motivo, autoridad, estado anterior y resultante, fecha y correlación | Decisión sin rastro | Reconstruir una operación completa desde el registro, sin memoria del actor |
| C-21 | Si intervino IA, se registran modelo, versión, entradas permitidas y salida estructurada | Interpretación no auditable | Prueba de extracción con modelo: el registro permite repetir la evaluación |
| C-22 | El audit log es append-only o tiene un control equivalente que impide cambios silenciosos | Log alterado para ocultar una aprobación | Prueba de intento de edición o borrado: falla o deja una marca visible |
| C-23 | El registro no guarda secretos, tokens, credenciales ni el cuerpo completo del correo si no hace falta para reconstruir la decisión | Fuga por auditoría | Revisión de un registro de prueba: campos permitidos y redacción |
| C-24 | Las denegaciones, conflictos, reintentos y errores también se registran | Solo se audita el camino feliz | Prueba de acceso cruzado y de timeout: ambos dejan evidencia |
| C-25 | La retención y el borrado del registro se declaran antes de un piloto con datos reales | Registro eterno o borrado que destruye evidencia | Todavía abierto: depende de jurisdicción |

### Secretos, datos y superficie de aplicación

| ID | Control | Amenaza que corta | Verificación en demo |
| --- | --- | --- | --- |
| C-26 | Secretos en variables de entorno o secret manager; nunca en el repositorio, en logs, en capturas ni en mensajes de error | Secreto filtrado | Búsqueda en el repo y en logs de prueba: sin claves, tokens ni cadenas de conexión |
| C-27 | Los logs no incluyen datos personales innecesarios; se redactan correo, teléfono, cuenta y cualquier identificador sensible | PII filtrada | Revisión de un log de prueba con redacción |
| C-28 | Los errores no revelan stack traces, rutas internas, consultas SQL ni si un recurso de otro tenant existe | Fuga por mensaje de error | Prueba de error forzado: mensaje genérico y correlación |
| C-29 | Los archivos y adjuntos se sirven con URLs de alcance limitado, vigencia corta y tenant verificado; el bucket no es público | Descarga cruzada o pública | Prueba de URL vencida y de URL de otro tenant: se deniega |
| C-30 | Los webhooks verifican origen, firma o secreto, y son idempotentes | Webhook falso o repetido | Prueba de firma inválida y de entrega duplicada |
| C-31 | El contenido de correos, PDF y adjuntos se trata como no confiable: no se ejecuta, no se interpreta como instrucción y no cambia política ni permisos | Prompt injection y manipulación | Prueba con un PDF que pide aprobar o cambiar la cuenta: no cambia la autoridad |
| C-32 | La demo no se conecta a correo real, banco real ni ERP real; las integraciones externas quedan detrás de una bandera y con datos sintéticos | Efecto real desde una demo | Inventario de integraciones: ninguna real en demo |

### Idempotencia, concurrencia y estados

| ID | Control | Amenaza que corta | Verificación en demo |
| --- | --- | --- | --- |
| C-33 | Idempotencia en recepción de correo, carga de documentos, webhooks, eventos y acciones de ejecución | Duplicado por reintento o reenvío | Prueba de mismo documento con otro nombre y de webhook repetido: una sola operación |
| C-34 | El nombre del archivo no es la identidad del documento; se usa una identidad de contenido o equivalente | Duplicado evadido renombrando | Prueba de mismo contenido con nombres distintos: se detecta |
| C-35 | Una sola decisión vigente por operación y versión de evidencia; los intentos concurrentes se registran y el perdedor recibe conflicto explícito | Dos aprobadores sobrescriben | Prueba de dos aprobaciones simultáneas: una gana y la otra queda como conflicto |
| C-36 | Un evento tardío o fuera de orden no revive una operación cerrada | Reapertura silenciosa | Prueba de evento antiguo después del cierre: se ignora o se marca |
| C-37 | Un cambio de factura, contrato, datos bancarios, presupuesto o política después de aprobar obliga a reevaluar la autorización | Aprobación sobre datos viejos | Prueba de cambio de importe después de aprobar: se invalida o se reabre según la regla |
| C-38 | Los estados distinguen solicitud, aprobación, instrucción enviada, procesamiento, confirmación, rechazo y conciliación | Confundir aprobación con pago | Prueba de estado: aprobar no produce “pagado” |
| C-39 | Un timeout o una ausencia de respuesta no se convierte en éxito ni en fallo definitivo; se consulta la fuente de verdad antes de reintentar | Pago duplicado o perdido | Prueba de timeout simulado: estado “desconocido” y verificación pendiente |
| C-40 | No se declara un pago exitoso por haber enviado una solicitud | Pago simulado | Revisión de la máquina de estados: no existe transición directa de “enviado” a “pagado” sin confirmación |

`C-33`, `C-39` y `C-40` no crean un módulo de ejecución. En el MVP no hay `Execution` ni pago externo: el timeout se diseña como resultado desconocido y no se simula una confirmación. Las acciones de ejecución solo aplican cuando esa frontera exista.

## Controles que esperan jurisdicción y esquema de roles

Estos no se pueden cerrar en la demo. Se nombran para que nadie los dé por resueltos.

| Tema | Qué falta decidir | Por qué no se cierra aquí |
| --- | --- | --- |
| Identidad | Proveedor, protocolo, MFA, recuperación, SSO/SCIM y autoservicio. El modelo conceptual está en [13](13-identidad-aprobaciones.md). | El proveedor y el esquema técnico no son un control de demo |
| Catálogo de roles | Nombres finales, roles personalizados y catálogo cerrado. Los permisos y arquetipos están en [13](13-identidad-aprobaciones.md). | El catálogo definitivo depende del producto; la tarea 10 exige roles explícitos |
| Quorum | Número de aprobadores, pesos, suplencias y empate. Las reglas de conteo están en [13](13-identidad-aprobaciones.md). | Depende de política y riesgo |
| Delegación | Límites, renovación y re-delegación. El alcance y la vigencia están en [13](13-identidad-aprobaciones.md). | Depende de la política del tenant |
| Precedencia de políticas | Orden exacto, prioridad y excepciones. La regla de conflicto está en [13](13-identidad-aprobaciones.md). | Depende del catálogo de políticas |
| Umbrales de riesgo | Valores numéricos y calibración. La estructura está en [14](14-riesgo-severidad-umbrales.md). | Sin datos de piloto no se inventan números |
| Acceso de soporte | Quién puede ver datos de un tenant y con qué registro. El modelo conceptual está en [13](13-identidad-aprobaciones.md). | Depende de la organización |
| Jurisdicción | Residencia, transferencia internacional y encargados | Puede cambiar dónde se guarda y procesa |
| Retención y borrado | Plazos, legal hold y derecho al olvido | Depende de jurisdicción y contrato |
| Auditoría | Append-only por almacenamiento o por control de aplicación | Depende de la base y del proveedor |
| Cifrado | Claves, rotación y custodia | Depende de la plataforma y del contrato |
| Correo real | Proveedor, protocolo, autenticación y reputación | Sigue abierto |
| Integraciones | ERP, banco, CRM y contabilidad | Fuera del MVP |

## Superficies de aislamiento que se prueban

No basta con probar el listado principal. Cada superficie se prueba con dos tenants sintéticos:

1. Identificadores cruzados en rutas, cuerpos y parámetros.
2. Acceso directo por URL.
3. Búsqueda y filtros.
4. Listados, paginación y exportaciones.
5. Archivos y URLs firmadas.
6. Cachés de extracción, resultados y embeddings.
7. Métricas, dashboards y reportes.
8. Webhooks, eventos y trabajos en segundo plano.
9. Logs y trazas.
10. Prompts y contexto enviado a un modelo.
11. Respuestas de error y tiempos de respuesta.
12. Copias de seguridad y datos de demo.

## Registro mínimo de una decisión

La lista completa está en la sección 13 del documento maestro. El registro mínimo no puede omitir:

| Campo | Para qué sirve |
| --- | --- |
| Tenant | Delimita el dato y la autorización |
| Operación | Identifica qué se estaba decidiendo |
| Documento y versión | Fija la evidencia sobre la que se decidió |
| Evidencias y fuentes consultadas | Permite reconstruir la evaluación |
| Evidencias ausentes | Explica por qué no se cerró una validación |
| Regla y versión de política | Muestra qué se aplicó y con qué vigencia |
| Resultado de validaciones | Separa hechos de interpretaciones |
| Actor humano o proceso | Identifica quién ejecutó la acción |
| Decisión, motivo y autoridad | Explica qué se decidió y con qué permiso |
| Estado anterior y resultante | Prueba la transición |
| Fecha y correlación | Ordena la secuencia y permite cruzar eventos |
| Modelo, versión y salida estructurada | Solo si intervino IA |

El registro no guarda el secreto, el token, la credencial ni el cuerpo completo del correo si no hace falta para reconstruir la decisión. Guarda la referencia y el hash o identificador de la evidencia cuando el contenido completo no sea necesario.

## Demo con datos sintéticos frente a piloto con datos reales

| Dimensión | Demo | Piloto |
| --- | --- | --- |
| Datos | Sintéticos, marcados y sin correspondencia con una persona o empresa real | Datos reales de un cliente con contrato y base legal |
| Correo | Sin proveedor real; contenido de prueba | Proveedor, protocolo y autenticación definidos |
| Banco | Sin conexión real | Verificación fuera de banda y control reforzado |
| Identidad | Actores de prueba | Proveedor de identidad, MFA y onboarding |
| Retención | Declarada y corta | Aprobada por jurisdicción y contrato |
| Auditoría | Registro de demo verificable | Retención, inmutabilidad y acceso de soporte |
| Integraciones | Ninguna real | Evaluadas una por una |
| IA | Modelo y costo aprobados para demo | Política de datos, retención y proveedor revisados |

Un piloto no reutiliza la demo sin revisar esta tabla. La demo no se conecta a datos reales “para probar mejor”.

## Verificación de la demo

| Prueba | Resultado esperado |
| --- | --- |
| Tenant A pide un recurso de tenant B | Denegación sin revelar existencia |
| Usuario autenticado sin permiso intenta aprobar | Denegación explícita |
| Mismo actor prepara y aprueba con maker-checker | Bloqueo |
| Delegación vencida intenta aprobar | Bloqueo |
| Dos aprobaciones simultáneas | Una gana; la otra recibe conflicto y queda registrada |
| Mismo documento con otro nombre | Una sola operación |
| Webhook duplicado | Un solo efecto |
| PDF con instrucción de cambiar cuenta | La instrucción no cambia autoridad ni datos |
| Timeout de una acción externa | Estado desconocido, no éxito ni fallo definitivo |
| Intento de editar el audit log | Falla o deja marca visible |
| Log de prueba | Sin secretos ni PII innecesaria |
| URL de archivo de otro tenant | Denegada |
| Reconstrucción de una operación | Todos los campos mínimos presentes |

## No hacer

- Confiar el aislamiento a un filtro de frontend.
- Aceptar `tenant_id` del cliente sin verificarlo contra el actor.
- Devolver “no autorizado” solo para recursos existentes y “no encontrado” para el resto; eso revela existencia.
- Compartir un cache global de extracciones, embeddings o resultados.
- Guardar secretos en el repositorio, en logs o en mensajes de error.
- Aceptar un cambio de cuenta bancaria desde el documento solo.
- Dar a la IA un permiso de aprobar, autorizar, ejecutar, delegar o formar quorum.
- Convertir un timeout en pago fallido o en pago exitoso.
- Declarar pago exitoso por enviar una solicitud.
- Usar datos reales en la demo.
- Implementar un estado que no existe.
- Cerrar el esquema de roles o el proveedor de identidad en este documento.

## Riesgos si se cierra mal

| Riesgo | Efecto |
| --- | --- |
| Un filtro solo en la interfaz | Un usuario ve facturas de otra empresa |
| Un cache global | Dos tenants reciben la misma extracción |
| Un ID de otro tenant con error distinto | Se puede enumerar y confirmar existencia |
| Un rol implícito | Cualquier usuario autenticado aprueba |
| Un log con el cuerpo del correo | Se filtran datos financieros y personales |
| Un audit log editable | Se oculta una aprobación o un cambio de cuenta |
| Un cambio de cuenta aceptado desde el PDF | Se desvía un pago |
| Un timeout tratado como fallo | Se reintenta y se duplica una acción |
| Un estado “pagado” sin confirmación | Se declara un pago que no ocurrió |

## Criterios de aceptación

- Ningún control de aislamiento vive solo en el frontend.
- Hay una salida explícita para un ID de otro tenant: denegar sin revelar existencia.
- Toda consulta y mutación comprueba tenant y autorización del actor.
- El registro de decisión no incluye el secreto ni el cuerpo completo del correo si no hace falta para reconstruir la decisión.
- Queda escrito que un pago no se marca exitoso al enviar la petición.
- Los roles aparecen como requisito, no como una tabla ya elegida.
- La demo con datos sintéticos está distinguida de un piloto con datos reales.
- Los controles que esperan jurisdicción y esquema de roles están separados.
- Cada control obligatorio nombra la amenaza que corta y la evidencia que lo demuestra.
- El catálogo `C-01` a `C-40` está adoptado; los mecanismos técnicos abiertos no se presentan como implementados.
- `bash scripts/ci.sh` pasa.

## Fuentes internas

- [Documento maestro](../documento-maestro.md), secciones 7, 9, 13 y 15.
- [Decisiones adoptadas](../decisiones/adoptadas.md) y [asuntos abiertos](../decisiones/abiertas.md).
- [Glosario](../glosario.md).
- [Tarea 10](../tareas/10-seguridad-multitenancy-y-auditoria.md).
- [Modelo de dominio](01-dominio.md), [ingesta](02-ingesta.md), [proveedores](03-proveedores.md), [validación](04-validacion.md), [workflows](05-workflows-aprobacion.md), [autoridad e IA](07-autoridad-ia.md) y [arquitectura](08-arquitectura.md).
- [Tarea 09](../tareas/09-infraestructura-costo-y-despliegue.md): la base de datos y el proveedor de identidad siguen abiertos.
