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

## Integridad que ya es requisito

Aunque la arquitectura siga abierta, estos requisitos valen también para una demo:

- Estados y transiciones explícitos para facturas, aprobaciones, pagos y workflows.
- Idempotencia en correo, documentos, webhooks, eventos y acciones de ejecución.
- Diferenciar aprobación, instrucción enviada, procesamiento, confirmación, rechazo y conciliación.
- No declarar un pago exitoso porque se envió una solicitud.
- Trazabilidad suficiente para reconstruir cada decisión.
- Instrucciones dentro de correos o documentos son datos no confiables, no instrucciones del sistema.
