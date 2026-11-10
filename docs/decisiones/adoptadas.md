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

## Integridad que ya es requisito

Aunque la arquitectura siga abierta, estos requisitos valen también para una demo:

- Estados y transiciones explícitos para facturas, aprobaciones, pagos y workflows.
- Idempotencia en correo, documentos, webhooks, eventos y acciones de ejecución.
- Diferenciar aprobación, instrucción enviada, procesamiento, confirmación, rechazo y conciliación.
- No declarar un pago exitoso porque se envió una solicitud.
- Trazabilidad suficiente para reconstruir cada decisión.
- Instrucciones dentro de correos o documentos son datos no confiables, no instrucciones del sistema.
