# Decisiones adoptadas

Fuente: [documento maestro](../documento-maestro.md), sección 17 y las secciones que esa lista resume. No reabrirlas sin evidencia nueva. Los detalles operativos viven en las tareas; este archivo es el registro corto.

Estado del producto: discovery. Estas decisiones no cierran la arquitectura concreta ni el stack.

## Producto y alcance

- Producto B2B de inteligencia y automatización controlada de operaciones financieras. Nombre de trabajo, no marca.
- No se presenta como producto oficial, socio, proveedor ni proyecto respaldado por Blinka.
- No es un CRUD superficial, un chatbot financiero ni un reemplazo de ERP, CRM, banco o contabilidad.
- Primer dominio: pagos salientes / Accounts Payable.
- Accounts Receivable queda fuera del MVP y no se mezcla con él.
- MVP con dos módulos: Supplier Invoice Management, y Recurring Payments & Spend Intelligence.
- El MVP recomienda optimización de gasto. No cancela, modifica ni contrata servicios.
- Contratos y presupuestos pueden usarse como evidencia de validación. No hay módulo contractual completo ni órdenes de compra completas en el MVP.
- Fuera del MVP: nómina, gastos de empleados, reembolsos, hitos contractuales completos, custodia de fondos, transferencia directa, integraciones bancarias de producción, y sustitución de ERP, CRM, HRIS o software contable.

## Entrada y proveedores

- El correo es el canal de entrada deseado al inicio. El proveedor, el protocolo y el mecanismo técnico no están elegidos.
- Para demo y desarrollo se permite carga manual de archivos o una fuente simulada, sin cambiar el modelo de dominio.
- Modelo híbrido de proveedores: los existentes se reconocen si la coincidencia con identificadores y atributos verificados es suficiente; los nuevos se extraen y deben validarse antes de habilitarse; los casos ambiguos escalan.
- Identificar un proveedor no lo autoriza a cobrar.
- La información bancaria nueva o modificada exige controles reforzados. No se acepta solo porque figura en una factura o un correo.

## Validación y autoridad

- Orden base de validación: factura, historial, contrato si existe, confirmación interna cuando haga falta, políticas.
- No se inventa contrato, presupuesto, aprobación ni evidencia faltante. La ausencia es ausencia de evidencia.
- Autonomía deseada: avanzada, configurable y sujeta a políticas verificables.
- Excepciones: tratamiento híbrido según gravedad. La escala de severidad está nombrada y sin calibrar.
- Evolución prevista en dos modos configurables: dejar la operación lista para un sistema bancario, o enviar una instrucción por una integración bancaria futura. El MVP no hace ninguna de las dos como movimiento real de dinero.
- El MVP administra el ciclo y registra estados. No custodia fondos ni hace transferencias bancarias reales.
- Niveles conceptuales L0 Observar, L1 Decidir, L2 Actuar, L3 Ejecutar. Cada empresa configura el nivel según tipo de operación, monto, moneda, proveedor, departamento, presupuesto, riesgo y permisos.
- Ningún modelo de IA concede autoridad, eleva sus permisos ni autoriza por sí solo una operación financiera.
- La IA interpreta, clasifica o señala anomalías. El código determinista calcula y aplica reglas. Otro componente verifica autorización. Otro coordina el workflow. Otro ejecuta solo acciones ya autorizadas.
- Un puntaje de modelo no sustituye reglas duras, identidad, autoridad ni verificación de pagos.

## Plataforma

- Multi-tenancy desde el diseño. Aislamiento en backend y persistencia, no solo en el frontend.
- Cada consulta y mutación comprueba tenant y autorización del actor.
- Preferencia de despliegue: Cloudflare-first, serverless, scale-to-zero, demo accesible sin máquinas ni contenedores encendidos. Es preferencia, no dogma ni decisión irrevocable de cada componente.
- Objetivo de costo: cercano a cero en desarrollo y demo, sin servidores permanentes. Los free tiers no se asumen gratuitos para siempre.
- Orden de preferencia para resolver una tarea: código determinista, modelo ligero, evaluador estructurado si JEV u otro está realmente disponible y medido, modelo más capaz solo en ambigüedad real, revisión humana si falta evidencia o el riesgo es alto.
- JEV es una opción a evaluar. No es una dependencia aprobada.
- Datos de demo: sintéticos y marcados. Nunca datos reales de clientes.
- Secretos fuera del repositorio y fuera de los logs.

## Infraestructura y costo

Adoptado el 2026-11-10.

- Se adoptan los criterios de despliegue y los guardrails de costo del [modelo 09](../modelo/09-infraestructura-costo.md).
- Demo local primero y luego tramo gratuito. Un recurso de pago exige costo posible escrito, volumen medido y responsable; si falta, no se enciende.
- Cloudflare-first sigue siendo preferencia, no decisión irrevocable. Una salida por requisito de integridad se documenta.
- Se evitan Redis, contenedores, VM y bases siempre encendidas mientras no exista un requisito medido.
- **D1 es la persistencia por defecto de la demo**, con datos sintéticos. No se extiende por sí sola a producción ni a un piloto con datos reales.
- PostgreSQL serverless queda como salida para piloto o producción. La migración exige medir escrituras de auditoría, CPU de extracción de PDF, concurrencia de aprobadores y costo de salida; no se asume que D1 alcanza.
- Correo, inferencia, Queues/Workflows, frontend, dominio, identidad y retención siguen abiertos.
- La foto de límites y precios es del 2026-11-03; se vuelve a leer la página oficial antes de encender cada recurso.
- Detalle en [modelo 09](../modelo/09-infraestructura-costo.md) y [tarea 09](../tareas/09-infraestructura-costo-y-despliegue.md).
- Quedan abiertos: migración a PostgreSQL, correo, modelo de IA, Queues/Workflows, frontend, dominio, identidad y retención.

## Seguridad, multi-tenancy y auditoría

Adoptado el 2026-11-12.

- Se adopta el catálogo `C-01` a `C-40` de [seguridad, multi-tenancy y auditoría](../modelo/10-seguridad-tenancy.md) como controles obligatorios de demo.
- `C-01` a `C-24` y `C-26` a `C-40` son exigibles en la demo sintética. `C-25`, retención y borrado, se exige antes de un piloto con datos reales.
- La adopción es del control y su evidencia, no de una implementación. No se elige base, proveedor de identidad, mecanismo de aislamiento, audit log, algoritmo de quorum ni verificación bancaria.
- Denegar por defecto; tenant y autorización se comprueban en backend y persistencia; un recurso de otro tenant se deniega sin revelar su existencia.
- El registro mínimo de decisión es reconstruible y no guarda secretos, tokens ni PII innecesaria.
- Se adopta idempotencia en ingesta, eventos y acciones futuras; aprobar no es pagar y un timeout no es éxito ni fallo.
- La demo no se conecta a correo, banco ni ERP reales; el contenido de correos y documentos no cambia autoridad ni política.
- Quedan abiertos: proveedor y esquema de identidad, catálogo definitivo de roles, mecanismo de aislamiento en D1, audit log append-only o equivalente, retención, residencia, acceso de soporte y verificación bancaria fuera de banda.
- Detalle en [modelo 10](../modelo/10-seguridad-tenancy.md) y [tarea 10](../tareas/10-seguridad-multitenancy-y-auditoria.md).

## Edge cases y pruebas

Adoptado el 2026-11-12.

- Se adopta el catálogo de 23 casos de [edge cases](../modelo/11-edge-cases.md) como requisito de diseño y base de pruebas futuras.
- Se adoptan el `Esperado` y el `No hacer` de cada caso. Los puntos en `Abierto` no se cierran.
- Los casos críticos de dinero, identidad y aislamiento no se recortan si la demo muestra esa función; las funciones inexistentes no se simulan.
- Los casos se alinean con T02–T05, T08, T10, T13 y T15: sin reserva de presupuesto al iniciar, política congelada, cambios materiales listados, sin `Execution` en el MVP y datos sintéticos.
- Quedan abiertos: clave exacta de idempotencia, umbral de duplicado probable, efecto exacto de un cambio material, precedencia exacta, mecanismo de concurrencia, proveedor de webhooks, cola o workflow durable, OCR y límites de archivo.
- Detalle en [modelo 11](../modelo/11-edge-cases.md) y [tarea 11](../tareas/11-edge-cases-y-pruebas.md).

## Estados y transiciones

Adoptado el 2026-11-09.

- Catálogo conceptual de estados y transiciones adoptado en [modelo 12](../modelo/12-estados-transiciones.md). Separa mensaje, documento, factura, workflow, pago y obligación.
- Toda transición no listada se rechaza. Cada transición comprueba tenant, autoridad, evidencia y versión.
- `AUTORIZACION_REVOCADA` se adopta en el ciclo de pago para cambios materiales antes de enviar.
- La obligación no se declara reconocida; su momento sigue abierto.
- El enum de implementación, los identificadores técnicos y la persistencia no están adoptados.

## Identidad, roles y aprobaciones

Adoptado el 2026-11-09.

- Identidad global con membresía por tenant: una misma identidad humana puede pertenecer a varios tenants con roles distintos. Una cuenta por tenant queda descartada para el MVP.
- Permisos explícitos por acción y alcance; aprobar y rechazar son permisos separados; sin roles implícitos; denegar por defecto.
- Onboarding del MVP por invitación con administrador inicial verificado. El autoservicio queda abierto.
- Delegación como subconjunto del delegante, con alcance, vigencia y motivo; no se re-delega por defecto.
- Maker-checker y quorum con actores distintos; el mismo actor no cuenta dos veces; la IA no vota ni forma quorum.
- Precedencia determinista: la denegación explícita prevalece; un conflicto de igual prioridad se declara y se escala; no gana la última política evaluada.
- Procesos de servicio con permisos acotados y sin aprobación financiera por defecto.
- La evaluación de autorización produce `PERMITIDO`, `DENEGADO` o `REQUIERE_HUMANO`, con tenant, actor, recurso, política y versión, y deja registro.
- Detalle en [modelo 13](../modelo/13-identidad-aprobaciones.md) y [tarea 13](../tareas/13-identidad-aprobaciones.md).
- Quedan abiertos: proveedor y protocolo de identidad, MFA, SSO/SCIM, autoservicio, catálogo definitivo de roles, números de quorum, reglas de re-delegación, prioridad exacta de políticas, aprobación automática L2, aprobación por procesos de servicio, acceso de soporte y retención.

## Riesgo, severidad y umbrales

Adoptado el 2026-11-09.

- Se distingue señal, hallazgo, tipo de riesgo, confianza, severidad, umbral, evaluación y decisión. Una señal no declara fraude, legitimidad ni aprobación.
- `NO_EVALUABLE` es un resultado separado, no una severidad. Un dato faltante no se trata como "por debajo del umbral" ni como severidad baja.
- La IA puede añadir un hallazgo o recomendar revisión; no baja, cierra ni convierte en seguro un hallazgo.
- Todo umbral declara cantidad, unidad, moneda, alcance, operador, límite inclusivo o exclusivo, vigencia y versión. Sin valor declarado no se evalúa.
- Una tabla base de plataforma con override por tenant: endurecer no requiere permiso especial; aflojar exige decisión explícita y registro. Los valores base quedan marcados como no calibrados hasta el piloto.
- Una elevación prevalece; una reducción exige evidencia y autoridad. Un conflicto de igual prioridad se declara y escala.
- La severidad limita la autonomía: alta y crítica no admiten aprobación automática; crítica exige revisión especializada.
- Un override conserva el hallazgo original y registra actor, motivo, evidencia, alcance, vigencia y versión.
- La calibración es un proceso en fases con datos etiquetados; no se afirma precisión sin datos.
- Detalle en [modelo 14](../modelo/14-riesgo-severidad-umbrales.md) y [tarea 14](../tareas/14-riesgo-severidad-umbrales.md).
- Quedan abiertos: valores numéricos, señales incluidas en el MVP, puntaje compuesto, datos y momento de calibración, monedas y tasas, plazos de revisión, gobernanza de cambios, evidencia para bajar severidad y calibración por tenant o común.

## Arquitectura y separación

Adoptado el 2026-11-10.

- Nueve responsabilidades conceptuales con dependencias sin ciclos: Ingestion, Document Intelligence, Deterministic Core/Rules, Decision, Authorization, Workflow, Execution, Spend Intelligence y Audit & Compliance.
- Modular monolith o equivalente como opción inicial; microservicios, bus, colas, durable, base vectorial y agentes autónomos exigen requisito medido.
- `Execution` no se crea en el MVP: no hay módulo, interfaz vacía ni simulación. El workflow termina en aprobado, rechazado o pendiente.
- La IA solo interpreta o señala; no decide, autoriza, ejecuta, delega ni forma quorum.
- D1 es el default de demo; PostgreSQL serverless es la salida para piloto o producción.
- Detalle en [modelo 08](../modelo/08-arquitectura.md) y [tarea 08](../tareas/08-arquitectura-y-separacion.md).
- Quedan abiertos: arquitectura concreta, frontend, migración, cola/durable, correo, OCR, modelos, JEV e integraciones.

## Spend intelligence

Adoptado el 2026-11-10.

- El MVP emite solo recomendaciones de ahorro potencial, con fuentes, cálculo, periodo y supuestos.
- No registra ahorro validado ni realizado; ambos quedan como definiciones para una etapa posterior.
- El módulo es de solo lectura: no cancela, modifica ni contrata servicios.
- Una recomendación sin evidencia mínima no se emite o se emite como pregunta.
- No se declara una licencia sin uso sin evidencia verificable de uso o de no uso.
- Dos herramientas parecidas quedan como superposición aparente, no como redundancia.
- Cada recomendación usa solo datos del tenant actual.
- Detalle en [modelo 06](../modelo/06-spend-intelligence.md) y [tarea 06](../tareas/06-spend-intelligence.md).
- Quedan abiertos: umbrales, recurrencia mínima, tolerancia de fechas, comparabilidad, tasas, fechas de compromiso y retención.

## Workflows de aprobación

Adoptado el 2026-11-10.

- Ciclo configurable con aprobar, rechazar, pedir información, escalar y bloquear temporalmente, con autoridad verificable y evidencia por transición.
- El workflow reutiliza la versión de política congelada por T04 al iniciar la validación.
- No hay reserva de presupuesto al iniciar; se reevalúa al decidir y se registra consumido/comprometido.
- Cambios materiales: importe, moneda, proveedor, cuenta bancaria, versión de factura, contrato o anexo, política, presupuesto o evidencia. Invalidan o reabren la aprobación pendiente.
- Aprobador ausente: delegación válida o escalamiento, sin sustituto implícito.
- Timeout de solicitud de información: bloqueo o escalamiento, nunca aprobación.
- Concurrencia: una decisión vigente por operación y versión de evidencia, con compare-and-swap conceptual y rastro de intentos, sin last-write-wins.
- Aprobar no es pagar; el workflow no mueve dinero ni declara un pago.
- La IA no aprueba, no autoriza, no delega y no forma quorum.
- Detalle en [modelo 05](../modelo/05-workflows-aprobacion.md) y [tarea 05](../tareas/05-workflows-de-aprobacion.md).
- Quedan abiertos: números de quorum, precedencia exacta, duraciones de timeout, mecanismo concreto y proceso durable.

## Autoridad, autonomía e IA

Adoptado el 2026-11-10.

- Separación entre interpretación, decisión, autorización y ejecución; ninguna capa hereda autoridad de otra.
- La autoridad es por acción, tenant, recurso y momento; se verifica con política, permiso, alcance, vigencia y segregación, y se deniega por defecto.
- La IA interpreta, extrae, clasifica, resume, señala y propone. No concede autoridad, no aprueba, no autoriza, no delega, no forma quorum y no reduce severidad sola.
- El MVP opera en L0–L2 y no mueve dinero. L3 es evolución y no se simula.
- Cada uso de IA deja registro mínimo aunque la salida se descarte.
- Las prohibiciones absolutas de la sección 7 del modelo no admiten excepción por política.
- JEV sigue como opción a evaluar, no como dependencia aprobada.
- Detalle en [modelo 07](../modelo/07-autoridad-ia.md) y [tarea 07](../tareas/07-autoridad-autonomia-e-ia.md).
- Quedan abiertos: modelo/proveedor, JEV, precios y topes, umbrales, combinación de autonomía, esquema de roles, precedencia, plazos y retención.

## Validación de facturas

Adoptado el 2026-11-10.

- Orden: extracción y normalización, historial, contrato si existe, confirmación interna cuando haga falta, políticas y presupuestos.
- Cada paso devuelve evidencia o declara que no la tiene; nunca convierte la ausencia en aprobación ni en rechazo.
- La validación congela la versión de política y presupuesto al iniciar. Un cambio posterior se registra y puede exigir una nueva validación.
- La confirmación interna se registra como tarea del workflow con actor, fecha, pregunta y contenido. El correo solo notifica; no confirma por sí mismo.
- Duplicado exacto y probable son hallazgos distintos; la diferencia contra contrato no se clasifica sola como fraude ni como cargo legítimo.
- Cálculos, comparaciones, duplicados exactos y límites son deterministas; un modelo no sustituye reglas ni baja severidad.
- Detalle en [modelo 04](../modelo/04-validacion.md) y [tarea 04](../tareas/04-validacion-de-facturas.md).
- Quedan abiertos: umbrales, tasas de cambio, plazo/destinatario de confirmación y efecto de cambios de política a mitad de validación.

## Proveedores: identidad y autorización

Adoptado el 2026-11-10.

- El alta de proveedor nuevo y el cambio de cuenta bancaria nueva o modificada exigen maker-checker con dos actores distintos. Nadie autoriza su propia solicitud.
- El proveedor permanece no habilitado hasta completar identidad, riesgo, autorización y control; el estado visible lo refleja.
- Proveedor existente con identificadores verificados: reconocimiento automático para seguir la validación de la factura. No autoriza el pago.
- Nombre comercial, homónimos o identificadores inconsistentes no habilitan ni fusionan; escalan.
- La extracción automática no actualiza la cuenta bancaria registrada. Una factura o un correo no bastan para aceptar una cuenta.
- La revocación o suspensión deja al proveedor no habilitado y se registra; el mecanismo exacto sigue abierto.
- Detalle en [modelo 03](../modelo/03-proveedores.md) y [tarea 03](../tareas/03-proveedores-identidad-y-autorizacion.md).
- Quedan abiertos: identificadores verificados por jurisdicción, umbral de coincidencia, roles exactos, revocación y listas de riesgo.

## Ingesta de correo y documentos

Adoptado el 2026-11-10.

- La demo del MVP usa carga manual de PDF y eventos de correo sintéticos claramente marcados. No se presenta como integración real de buzón.
- La identidad del documento se basa en el tenant y una huella estable del contenido, no en el nombre del archivo. El algoritmo exacto sigue abierto.
- Un mensaje no es una factura. Se distinguen mensaje, adjunto, documento, versión y operación; la extracción no crea una obligación.
- Se adoptan las categorías de mensaje, la regla de no forzar vínculos cuando falta evidencia y el tratamiento del cuerpo y los adjuntos como datos no confiables.
- El proveedor, protocolo y mecanismo de correo real, el OCR, los límites de tamaño y tipo y los umbrales de duplicado siguen abiertos.
- Detalle en [modelo 02](../modelo/02-ingesta.md) y [tarea 02](../tareas/02-ingesta-correo-y-documentos.md).

## Contratos y presupuestos como evidencia

Adoptado el 2026-11-09.

- Fuentes del MVP: contrato o anexo, presupuesto y confirmación interna. La orden de compra no es obligatoria y su inclusión queda abierta.
- El contrato o anexo responde por condición comercial; el presupuesto por límite disponible; la confirmación interna por una excepción concreta. Ninguna sustituye a la otra.
- La ausencia de contrato, presupuesto o confirmación es ausencia de evidencia: no aprueba ni rechaza por sí sola.
- La vigencia se determina por fechas y condiciones declaradas, no por la fecha del archivo. Un contrato vencido es un hallazgo; no se usa como vigente.
- Un anexo modifica solo lo que declara y dentro de su vigencia. Dos anexos vigentes contradictorios producen conflicto explícito; no gana el más reciente por fecha.
- El disponible de presupuesto se calcula solo si existen importe autorizado y consumos o compromisos. Sin el dato, es `NO_EVALUABLE`. Un presupuesto agotado es un hallazgo, no un rechazo automático.
- El vínculo entre factura y fuente se demuestra con referencia y versión. La ambigüedad pide aclaración; una referencia a otro tenant se deniega sin revelar existencia.
- La comparación es determinista y cita fuente, versión, campo y moneda. Sin tasa, fuente y fecha, una comparación entre monedas distintas es evidencia insuficiente.
- Una confirmación interna no es contrato, no crea presupuesto ni equivale a aprobación. El silencio no es conformidad.
- Detalle en [modelo 15](../modelo/15-contratos-presupuestos-evidencia.md) y [tarea 15](../tareas/15-contratos-presupuestos-evidencia.md).
- Quedan abiertos: detalle contractual, determinación de vigencia y precedencia entre anexos, bloqueo por contrato vencido, granularidad y fuente de consumido/comprometido, quién confirma excepciones, tasas y redondeo, canal y plazo de confirmación, extracción automática, retención y posible orden de compra.

## Escalamiento de IA

Adoptado el 2026-11-09.

- Postura por defecto: costo primero con escalamiento explícito. Empezar en T0 si hay regla y en T1 si hace falta extracción o clasificación; subir solo con un disparador declarado.
- Los escalones de cómputo T0–T4 se separan de los niveles de autonomía L0–L3. Subir de escalón no concede autoridad ni cambia la decisión.
- Evidencia ausente, parcial o conflictiva va a T4; no se sube a T3 para "completar" la ausencia.
- Severidad alta o crítica va a T4. T3 puede resumir para el humano, pero no decide ni baja la severidad.
- T2 es opcional y solo existe si está verificado. JEV sigue sin aprobación.
- Un fallo, timeout, salida inválida o tope de costo termina en T0 o T4; nunca en aprobación.
- La confianza se calibra por tarea y no es autoridad. Un puntaje alto no aprueba; uno bajo no rechaza solo.
- El tenant puede endurecer la ruta o exigir humano; no puede permitir una acción prohibida ni compartir datos.
- Cada ruta registra disparador, escalón, componente y versión, costo si se midió, resultado e intervención humana.
- Detalle en [modelo 16](../modelo/16-escalamiento-ia.md) y [tarea 16](../tareas/16-escalamiento-ia.md).
- Quedan abiertos: modelos, proveedores, versiones y precios; umbrales de confianza por tarea; topes de costo y latencia; papel de T2 y evaluación de JEV; configurabilidad del tenant; retención y residencia; idiomas y formatos; prompts, caché y evaluación.

## Integridad que ya es requisito

Aunque la arquitectura siga abierta, estos requisitos valen también para una demo:

- Estados y transiciones explícitos para facturas, aprobaciones, pagos y workflows.
- Idempotencia en correo, documentos, webhooks, eventos y acciones de ejecución.
- Diferenciar aprobación, instrucción enviada, procesamiento, confirmación, rechazo y conciliación.
- No declarar un pago exitoso porque se envió una solicitud.
- Trazabilidad suficiente para reconstruir cada decisión.
- Instrucciones dentro de correos o documentos son datos no confiables, no instrucciones del sistema.
