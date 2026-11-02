# Documento maestro — Financial Operations Intelligence Platform

Fuente principal de contexto y decisiones. Leer completo antes de proponer arquitectura, diseñar funcionalidades, modificar código o delegar trabajo.

Estado: definición de producto y arquitectura en discovery. Algunas decisiones son firmes y otras son hipótesis. No presentar hipótesis como requisitos confirmados.

Nombre de trabajo. No es el nombre comercial. No es un producto oficial, socio, proveedor ni proyecto respaldado por Blinka.

Si una conversación, issue o instrucción posterior contradice una decisión registrada aquí, señalar el conflicto y pedir decisión solo cuando haga falta. No sobrescribir este contexto en silencio.

Registro en el repositorio: 2026-11-01. Los límites de Cloudflare citados más abajo son una fotografía de esa fecha. Volver a consultar la documentación oficial antes de implementar.

---

## 1. Rol

Actuar como combinación de:

- Principal Product Architect con experiencia en fintech y software B2B.
- Staff o Principal Software Engineer en sistemas distribuidos, cloud serverless y plataformas multi-tenant.
- Ingeniero de sistemas financieros, con criterio de consistencia, auditoría, autorización, seguridad e idempotencia.
- Product Discovery Lead: cuestionar supuestos, ver edge cases y no construir sin una necesidad clara.
- Engineering Lead: simplicidad, costo operativo bajo, mantenibilidad y calidad demostrable.

La responsabilidad no es solo escribir código. El producto tiene que ser técnicamente sólido, verificable, extensible y comercialmente creíble.

Comunicación en español, con criterio técnico y de producto. Ser directo y crítico: no validar ideas de forma automática. Explicar trade-offs y distinguir hechos, decisiones, hipótesis y recomendaciones. Trabajar en conversación. Una pregunta importante por turno cuando sea necesaria. No volver a preguntar lo que este documento ya decidió.

## 2. Visión y objetivo

Plataforma B2B de Financial Operations Intelligence. La intención es un producto real, demostrable a empresas medianas y grandes, y presentable entre otros interlocutores a personas de Blinka, sin atribución ni respaldo de Blinka.

Objetivo: reducir trabajo manual, errores y fricción en operaciones financieras mediante:

- Interpretación de documentos y comunicaciones financieras.
- Validación contra registros, contratos, políticas e historial.
- Detección de excepciones y anomalías.
- Flujos de aprobación configurables.
- Decisiones explicables y trazables.
- Automatización controlada de tareas y, en fases futuras, ejecución de instrucciones financieras mediante integraciones autorizadas.
- Visibilidad de gastos recurrentes y oportunidades justificadas de optimización.

No es un CRUD superficial, un chatbot financiero ni un reemplazo de ERP, CRM, bancos o sistemas contables. La propuesta es una capa de inteligencia, decisión, workflow y control sobre los sistemas que la empresa ya utiliza.

## 3. Contexto del problema y evidencia

### Hecho

El problema inicial surge de conversaciones con el CTO de Blinka sobre dificultades de clientes de Blinka, no de Blinka internamente. El CTO explicó que los procesos de aprobación y desaprobación de pagos a proveedores varían entre empresas y según sus políticas. La complejidad crece con muchos elementos variables, pagos en serie, múltiples proveedores y jerarquías de aprobación.

### Hipótesis de problema, pendientes de investigación

- La recepción, revisión y aprobación de facturas y pagos puede depender de correos, documentos y aprobaciones manuales.
- Las políticas y responsabilidades varían por empresa, departamento, monto, moneda, proveedor y tipo de gasto.
- Pueden existir facturas duplicadas, proveedores ambiguos, contratos vencidos, diferencias comerciales, documentación incompleta o gastos fuera de presupuesto.
- Los ciclos de revisión pueden demorarse y consumir tiempo administrativo.
- La fragmentación de información puede aumentar el riesgo de errores, pagos incorrectos y falta de trazabilidad.
- Las empresas pueden pagar por servicios recurrentes redundantes o licencias que no utilizan. Esta última afirmación requiere evidencia de utilización. No puede inferirse solo de facturas.

No inventar estadísticas, entrevistas, validaciones de mercado, clientes, integraciones ni endorsements. Separar lo que viene de la conversación con el CTO de lo que es hipótesis del producto.

## 4. Cliente objetivo

Hipótesis inicial, no segmento cerrado: empresas medianas y grandes, locales o internacionales, con una o más de estas características:

- Múltiples proveedores y un volumen relevante de facturas.
- Operaciones locales e internacionales y pagos en varias monedas.
- Equipos de finanzas, procurement y departamentos solicitantes.
- Diferentes niveles de aprobación y políticas internas.
- Contratos, acuerdos de servicio, presupuestos y renovaciones.
- Necesidad de auditar quién solicitó, validó, autorizó y ejecutó cada operación.

El segmento exacto, el tamaño, las industrias prioritarias, el volumen mínimo de facturas y el comprador económico siguen en discovery.

## 5. Alcance funcional

### 5.1 Primer dominio

Outgoing Operations / Accounts Payable: obligaciones y pagos salientes a proveedores.

Accounts Receivable puede ser una expansión posterior. No se mezcla con el MVP.

### 5.2 MVP: dos módulos

#### Módulo A — Supplier Invoice Management

1. Recibir facturas y documentos relacionados. El correo es el canal deseado al inicio. Para demos y desarrollo puede haber carga manual o una fuente simulada, sin cambiar el modelo de dominio.
2. Extraer campos relevantes según disponibilidad: proveedor, razón social, identificadores, número de factura, fecha, vencimiento, importe, moneda, impuestos, concepto, líneas y referencias contractuales.
3. Identificar al proveedor y resolver coincidencias con el registro existente.
4. Detectar duplicados exactos y posibles duplicados semánticos o parciales.
5. Validar contra el historial de facturas y pagos disponible.
6. Comparar con contratos y condiciones comerciales disponibles: importe, moneda, vigencia, periodicidad, conceptos, límites y condiciones.
7. Detectar inconsistencias, documentación faltante, cambios y anomalías.
8. Aplicar políticas, presupuestos y límites disponibles.
9. Aprobar, rechazar, solicitar información o escalar con workflows configurables.
10. Registrar y seguir el estado de la obligación y del pago.
11. Mantener evidencia y trazabilidad de cada decisión.

Una factura es una solicitud de pago, no una obligación automáticamente válida. Ejemplo: una factura de USD 10.000 frente a un contrato mensual de USD 8.000 puede incluir servicios adicionales. El sistema no asume que la diferencia es legítima ni fraudulenta. Identifica la discrepancia y pide evidencia o confirmación al departamento responsable.

#### Módulo B — Recurring Payments & Spend Intelligence

Objetivo: detectar compromisos y gastos recurrentes, descubrir posibles duplicidades o ineficiencias y recomendar optimización.

- Identificar pagos, facturas, renovaciones y suscripciones recurrentes.
- Detectar aumentos de precio y cambios de condiciones.
- Identificar servicios con funcionalidades aparentemente superpuestas.
- Detectar servicios o pagos duplicados.
- Identificar licencias potencialmente no utilizadas solo con evidencia verificable de uso o de falta de uso.
- Comparar costos y condiciones entre proveedores cuando existan datos comparables.
- Recomendar consolidaciones o alternativas y estimar ahorro potencial.
- Seguir fechas de renovación, vencimiento, cancelación y compromisos contractuales.

El MVP genera recomendaciones justificadas. No cancela, modifica ni contrata servicios. Dos herramientas parecidas no son necesariamente redundantes: pueden servir a departamentos, usuarios o necesidades distintas.

Separar siempre:

- Ahorro potencial: estimación que aún requiere validación.
- Ahorro validado: oportunidad confirmada por la empresa.
- Ahorro realizado: reducción que ocurrió y pudo comprobarse.

El correo y las facturas pueden mostrar proveedores, importes, renovaciones y contratos. No demuestran cuántas personas usan una licencia ni si una aplicación está activa. Ese análisis puede exigir integraciones futuras con identity providers, sistemas de uso o datos aportados por la empresa.

### 5.3 Fuera del MVP

No implementar todavía:

- Accounts Receivable ni gestión integral de pagos entrantes.
- Nómina, gastos de empleados y reembolsos.
- Hitos contractuales y órdenes de compra completas.
- Cancelación o modificación automática de suscripciones.
- Custodia de fondos o transferencia directa de dinero.
- Integraciones bancarias de producción.
- Sustitución de ERP, CRM, HRIS o software contable.

Los contratos sí pueden usarse como fuentes de validación de facturas aunque no exista un módulo contractual completo.

## 6. Ingesta y correo

El correo es el primer canal deseado. No hay proveedor, protocolo ni mecanismo técnico elegido. No seleccionar una integración de pago ni diseñar una dependencia irreversible sin comparar opciones, costo, seguridad y viabilidad.

No todo correo es una factura nueva. Puede ser:

- Una factura nueva.
- Una respuesta o conversación de una factura existente.
- Un reenvío del mismo documento.
- Una factura corregida o reemplazada.
- Una nota crédito o débito.
- Un contrato o anexo.
- Una confirmación de aprobación.
- Una notificación de pago.
- Una consulta o solicitud de información.

El sistema conserva relaciones entre mensajes, adjuntos, documentos, proveedores y operaciones. Distingue una operación nueva de una modificación, respuesta o notificación de una operación existente.

Para demos de costo cero se puede permitir carga manual de PDFs y eventos de correo de prueba. Eso no sustituye diseñar el dominio para una integración real de email.

## 7. Identificación y onboarding de proveedores

Decisión: modelo híbrido.

- Los proveedores existentes se reconocen automáticamente cuando la coincidencia con identificadores y atributos verificados es suficiente.
- Los proveedores nuevos pueden detectarse y extraerse, y deben pasar validaciones de identidad, riesgo y autorización antes de quedar habilitados.
- Los casos ambiguos escalan: nombres comerciales y razones sociales distintas, homónimos, identificadores inconsistentes o datos bancarios modificados.
- Identificar un proveedor no equivale a autorizarlo a recibir pagos.
- La información bancaria nueva o modificada recibe controles reforzados. No se acepta únicamente porque aparece en una factura o un correo.

No confundir coincidencia de nombre, identidad legal, validación de cuenta bancaria, alta de proveedor y autorización para recibir pagos.

## 8. Validación de facturas

Modelo acordado como base:

1. Factura: extraer y normalizar.
2. Historial: comparar con facturas, proveedores, documentos y pagos anteriores.
3. Contrato: contrastar condiciones, vigencia, periodicidad, moneda, montos y servicios, si la fuente existe.
4. Confirmación interna: pedir validación al departamento responsable si hay servicios adicionales, diferencias no explicadas o evidencia insuficiente.
5. Políticas: aplicar reglas, presupuestos, límites y autorizaciones de la empresa.

Nunca inventar un contrato, un presupuesto, una aprobación o una evidencia faltante. La ausencia de datos es ausencia de evidencia, no un resultado positivo ni negativo automático.

## 9. Autonomía y autoridad

Decisiones:

- Autonomía deseada: avanzada, configurable y sujeta a políticas verificables.
- Excepciones: tratamiento híbrido según gravedad.
- Ejecución, en la evolución del producto: dos modos configurables. (a) Aprobar y dejar la operación lista para un sistema bancario. (b) Aprobar y enviar una instrucción de pago mediante integración bancaria futura.
- Autoridad: modelo híbrido de políticas, límites y autorizaciones especiales.
- El MVP administra el ciclo y registra estados. No custodia fondos ni realiza transferencias bancarias reales.

Niveles conceptuales:

- L0 Observar: capturar, extraer, clasificar y registrar.
- L1 Decidir: evaluar reglas, evidencia, riesgo y políticas; proponer una decisión.
- L2 Actuar: aprobar, rechazar, solicitar información, escalar o bloquear temporalmente dentro de la autoridad configurada.
- L3 Ejecutar: preparar o enviar instrucciones de pago y verificar su resultado cuando existan integraciones autorizadas.

Cada empresa configura el nivel permitido según tipo de operación, monto, moneda, proveedor, departamento, presupuesto, riesgo y permisos.

Regla innegociable: ningún modelo de IA puede concederse autoridad, elevar sus permisos ni autorizar por sí solo una operación financiera. La autoridad deriva de políticas configuradas, permisos verificables, segregación de funciones y controles técnicos independientes.

## 10. Arquitectura conceptual

No elegir microservicios, agentes ni un framework por moda. Empezar por un diseño modular y separar responsabilidades. La arquitectura concreta sale de requisitos medibles.

Módulos conceptuales:

- Ingestion Layer: email, documentos y eventos.
- Document Intelligence Layer: extracción, clasificación, normalización y vinculación.
- Deterministic Core / Rules Engine: cálculos, comparaciones, reglas, límites, validaciones y transiciones de estado.
- Decision Engine: combina resultados verificables y señales de inteligencia en una decisión estructurada.
- Authorization Engine: verifica si el actor o proceso tiene autoridad para la acción.
- Workflow Engine: aprobaciones, escalamiento, solicitudes de información, delegación, esperas y reanudación.
- Execution Engine: preparación o envío de acciones externas futuras, con idempotencia y verificación.
- Spend Intelligence: recurrencias, redundancias y recomendaciones.
- Audit & Compliance: evidencia, decisiones, actores, versiones y resultados.

Separación esencial:

- La IA puede interpretar documentos, correos y contexto, o señalar posibles anomalías.
- El código determinista aplica reglas y cálculos financieros.
- El motor de autorización verifica permisos.
- El motor de workflow coordina la intervención humana y las etapas.
- El motor de ejecución realiza solo acciones expresamente autorizadas.

No usar agentes autónomos para tareas que el código determinista puede resolver. No introducir base vectorial, event bus, microservicios o múltiples agentes sin un requisito concreto que los justifique.

## 11. IA, JEV y costo

Minimizar el costo de operación desde el diseño. Ideal de gasto cercano a cero durante desarrollo y demo, sin servidores encendidos de forma permanente. No suponer que todos los free tiers son gratuitos indefinidamente ni que scale-to-zero garantiza factura cero.

Principio: la alternativa más simple, económica y verificable que resuelva cada tarea.

Orden de preferencia:

1. Código determinista para validaciones, comparaciones, cálculos, duplicados exactos, permisos y reglas.
2. Modelos ligeros o económicos para clasificación y extracción cuando hagan falta.
3. JEV u otro evaluador estructurado si su implementación, interfaz, costo y utilidad están disponibles y verificados.
4. Modelos más capaces solo para ambigüedad que requiera razonamiento adicional.
5. Revisión humana cuando no haya evidencia suficiente o el riesgo sea alto.

JEV es una opción a evaluar, no una dependencia aprobada. Antes de integrarlo:

- Inspeccionar la implementación, documentación, API y licencia realmente disponibles.
- Verificar qué significa JEV en el contexto del repositorio. No inventar primitivas, métodos, capacidades ni precios.
- Medir calidad, latencia, costo, determinismo y facilidad de evaluación.
- Decidir en qué tareas aporta y dónde sobra.

No enviar todas las facturas a un LLM si una regla resuelve el caso. No permitir que un puntaje del modelo sustituya reglas duras, controles de identidad, autoridad o verificación de pagos. Cuando se use IA, registrar modelo, versión, entradas relevantes permitidas, salida estructurada, evidencias y política aplicada.

## 12. Infraestructura y despliegue

Preferencia actual: Cloudflare-first, serverless y scale-to-zero. La aplicación debe poder desplegar frontend y backend y funcionar como demo en internet sin máquinas virtuales ni contenedores encendidos.

Componentes candidatos, no decisiones irrevocables:

- Cloudflare Pages o Workers Static Assets para frontend estático.
- Cloudflare Workers para API y lógica backend.
- Cloudflare D1 o PostgreSQL serverless (por ejemplo, Neon) para persistencia relacional. La selección sigue abierta: comparar transacciones, integridad, consultas, concurrencia, experiencia de desarrollo, costo y migración.
- Cloudflare R2 para documentos y adjuntos.
- Cloudflare Queues para procesamiento asíncrono si la necesidad lo justifica.
- Cloudflare Workflows para procesos duraderos y aprobaciones con esperas y reintentos, si el costo y la semántica encajan.
- Workers AI u otro proveedor de inferencia bajo demanda, si el costo, los límites y la calidad son adecuados.

No elegir Cloudflare por dogma. Si una parte requiere un servicio externo, compararlo con opciones dentro de Cloudflare y documentar por qué. Evitar Redis, contenedores, bases siempre encendidas, mínimos mensuales y recursos sobredimensionados mientras no sean necesarios.

Verificar costos y límites en documentación oficial vigente antes de implementar. Configurar límites, alertas y protección contra consumo inesperado. No activar servicios de pago, créditos, APIs externas o recursos facturables sin dejar claro el posible costo.

### Límites citados el 2026-11-01

Pueden cambiar. No implementar apoyándose solo en esta lista.

- Workers Free: 100.000 solicitudes por día y 10 ms de CPU por invocación.
- D1 Free: 5 millones de filas leídas por día, 100.000 escritas por día y 5 GB de almacenamiento total.
- R2 Standard Free: 10 GB-mes, 1 millón de operaciones Class A y 10 millones Class B por mes.
- Workers AI: 10.000 Neurons gratuitos al día. Algunos modelos requieren método de pago o créditos.
- Workflows: disponible en el plan Free, con 3.000 pasos por día y 1 GB-mes de almacenamiento incluido. Por encima de lo incluido puede haber cargos. El tiempo de espera no consume CPU. El estado persistido sí cuenta como almacenamiento.
- Las solicitudes de Pages Functions se contabilizan como Workers. Las peticiones a assets estáticos de Pages son gratuitas e ilimitadas según la documentación de Pages.

Referencias oficiales iniciales:

- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/r2/pricing/
- https://developers.cloudflare.com/workflows/reference/pricing/
- https://developers.cloudflare.com/workers-ai/platform/pricing/
- https://developers.cloudflare.com/pages/functions/pricing/

## 13. Integridad, seguridad y confiabilidad

Estos requisitos son centrales, también para una demo.

### Multi-tenancy

- Diseñar para múltiples empresas desde el comienzo.
- Cada tenant tiene sus usuarios, proveedores, facturas, contratos, políticas, departamentos, workflows y registros.
- El aislamiento se impone en backend y en persistencia. Nunca depender solo de filtros del frontend.
- Cada consulta y mutación comprueba el contexto del tenant y la autorización del actor.
- No compartir datos, documentos, embeddings, caches ni resultados entre tenants.

### Identidad y autorización

- Roles y permisos explícitos.
- Segregación de funciones (maker-checker) cuando aplique.
- Delegaciones con vigencia y alcance.
- Quorum o múltiples aprobadores cuando la política lo requiera.
- Precedencia de políticas y resolución explícita de conflictos.
- Excepciones y overrides humanos con actor, motivo, fecha y evidencia.
- La autenticación no equivale a autorización.

El esquema concreto de identidad, roles y onboarding de empresas sigue abierto.

### Trazabilidad

Cada decisión debe poder reconstruirse. Registrar, según aplique:

- Operación y tenant.
- Documento y versión.
- Evidencias y fuentes consultadas.
- Reglas y versiones de políticas evaluadas.
- Resultado de validaciones.
- Modelo o componente y versión, cuando se use IA.
- Actor humano o proceso que ejecutó la acción.
- Decisión, motivo, autoridad y resultado.
- Fechas, cambios de estado, errores y reintentos.

Evaluar un audit log append-only o controles equivalentes para impedir modificaciones silenciosas. No almacenar secretos ni datos personales innecesarios en logs.

### Estados, idempotencia y consistencia

- Definir estados y transiciones explícitas para facturas, aprobaciones, pagos y workflows.
- Diseñar idempotencia para recepción de email, documentos, webhooks, eventos y acciones de ejecución.
- Un timeout no significa que un pago falló. Antes de reintentar una acción externa, verificar el estado con la fuente de verdad.
- Gestionar webhooks duplicados, fuera de orden y retrasados.
- Controlar concurrencia cuando dos aprobadores o procesos modifican una operación a la vez.
- Si cambian una factura, un contrato, datos bancarios o una política después de aprobar, evaluar invalidación o nueva aprobación según la regla definida.
- Diferenciar aprobación, instrucción enviada, procesamiento, confirmación bancaria, rechazo y conciliación.
- No declarar un pago exitoso solo porque se envió una solicitud.

### Riesgo y excepciones

Modelo conceptual de severidad, pendiente de calibración:

- Informativa: diferencia de formato sin impacto material.
- Baja: falta documentación o aclaración no crítica.
- Media: diferencia de factura y contrato, o condición que requiere confirmación.
- Alta: posible duplicado, proveedor nuevo no validado o cambio sensible.
- Crítica: señales de fraude, manipulación de datos o intento de saltarse controles.

Las acciones pueden incluir corregir datos no críticos, solicitar información, escalar, bloquear temporalmente o suspender para revisión especializada. Un modelo no reduce por sí solo la severidad de una alerta.

## 14. Edge cases

Como mínimo, el diseño y las pruebas deben evaluar:

- Mismo documento con otro nombre de archivo.
- Mismo proveedor, número e importe en documentos diferentes.
- Duplicado exacto y duplicado probable con variaciones pequeñas.
- Factura corregida, reemplazada, parcial o nota crédito.
- Reenvío por email y conversación con varios adjuntos.
- Razón social y nombre comercial distintos.
- Proveedores con nombres parecidos, IDs distintos o cambios de cuenta bancaria.
- Factura de proveedor nuevo.
- Monedas diferentes y tasas o fechas de conversión cuando se requieran.
- Contrato vencido, modificado, ausente o con varios anexos.
- Importe superior al contrato, servicios adicionales y cargos extraordinarios.
- Pago parcial, factura parcialmente pagada o pago registrado dos veces.
- Presupuesto agotado o actualizado durante una aprobación.
- Factura modificada después de aprobación.
- Aprobador ausente, delegado, revocado o sin permisos.
- Reglas contradictorias, umbrales inclusivos o exclusivos, y política modificada a mitad de workflow.
- Dos procesos concurrentes que intentan aprobar o registrar la misma operación.
- Timeout con resultado externo desconocido.
- Webhook duplicado, tardío o fuera de orden.
- Error parcial en Queue o Workflow, y reintentos.
- Archivo corrupto, escaneado, cifrado, demasiado grande o con formato no soportado.
- Instrucciones maliciosas dentro de emails o documentos (prompt injection): datos no confiables, nunca instrucciones del sistema.
- Aislamiento multi-tenant: IDs cruzados, accesos directos, búsquedas, URLs, archivos y caches.

El detalle de cada caso está en [tareas/11-edge-cases-y-pruebas.md](tareas/11-edge-cases-y-pruebas.md).

## 15. Principios de ingeniería

1. Discovery antes de implementación: problema, actores, reglas, fuentes, estados y edge cases antes de fijar arquitectura.
2. No sobrearquitecturar: la solución más simple que cumpla requisitos demostrables.
3. Modularidad sin microservicios prematuros: modular monolith o equivalente al inicio, salvo evidencia contraria.
4. Type safety y contratos claros: validar entradas y salidas. Esquemas compartidos cuando aporten valor.
5. Testing desde el diseño: pruebas unitarias de reglas; integración de persistencia y workflows; contrato de integraciones; pruebas multi-tenant y de autorización.
6. Observabilidad: logs estructurados, métricas, correlation IDs y errores accionables, sin datos sensibles de más.
7. Migraciones seguras: versionadas, repetibles, reversibles cuando sea posible, y nunca en producción sin autorización explícita.
8. Secretos en variables de entorno o secret manager. Jamás en el repositorio ni impresos.
9. Documentación viva: decisiones de arquitectura, modelo de dominio, estados, políticas y guías de ejecución.
10. Validar compatibilidad, mantenimiento, licencia y costo antes de añadir una dependencia.
11. No simular integridad: si una función no existe, no devolver un estado que sugiera que ocurrió.
12. No inventar datos de demo: sintéticos, marcados, y nunca datos reales de clientes.

## 16. Cómo colaborar

- Antes de una decisión estructural, resumir el problema y las alternativas con ventajas y desventajas.
- Si falta un dato no crítico, declarar una hipótesis reversible y continuar.
- Si falta un dato crítico de dominio, seguridad, autorización o costo, hacer una sola pregunta concreta.
- No convertir cada decisión en un formulario ni en una lista larga de preguntas.
- Conservar las decisiones previas. No reabrirlas sin evidencia nueva.
- Señalar cuando una idea suba el costo, el riesgo, el acoplamiento o la complejidad.
- No empezar a programar solo para producir actividad. Confirmar alcance y criterios de aceptación.
- Para tareas de código, inspeccionar primero el repositorio y sus convenciones reales. No asumir stack, estructura ni scripts.

## 17. Decisiones adoptadas y asuntos abiertos

El registro operativo está partido a propósito:

- [Decisiones adoptadas](decisiones/adoptadas.md)
- [Asuntos abiertos](decisiones/abiertas.md)

Esos archivos no sustituyen este documento. Si discrepan, manda este documento y hay que corregir el registro.

### Adoptado

- Producto B2B de inteligencia y automatización de operaciones financieras.
- Primer dominio: pagos salientes / Accounts Payable.
- MVP: Supplier Invoice Management y Recurring Payments & Spend Intelligence.
- Correo como canal de entrada deseado; carga manual o simulada permitida para demo.
- Proveedores: identificación híbrida. Los existentes se reconocen. Los nuevos se validan y autorizan.
- Validación: factura, historial, contrato, confirmación interna y políticas.
- Autonomía avanzada y configurable. Excepciones híbridas por gravedad.
- IA sin autoridad autónoma para aprobar pagos.
- Políticas y autorizaciones verificables, separadas de la interpretación de IA.
- Recomendaciones de gasto, sin cancelaciones automáticas en el MVP.
- Multi-tenancy desde el diseño.
- Preferencia Cloudflare-first, serverless, sin servidores siempre encendidos, con objetivo de costo cero o cercano a cero durante la demo.

### Abierto

- Nombre y marca.
- Segmento de industria y tamaño de cliente más prioritario.
- Arquitectura concreta y stack frontend.
- D1 frente a PostgreSQL serverless.
- Proveedor y protocolo de email.
- OCR y extracción de PDF escaneado.
- Implementación, alcance y costo real de JEV.
- Modelos de IA y política de selección o escalamiento.
- Esquema de identidad, roles y onboarding de empresas.
- Fuentes y nivel de detalle de contratos y presupuestos.
- Modelo exacto de aprobaciones, delegación y quorum.
- Reglas de riesgo y umbrales.
- Integraciones futuras con ERP, CRM, bancos, contabilidad, HRIS o sistemas de uso.
- Requisitos regulatorios y jurisdicciones según el mercado objetivo.

## 18. Primera forma de trabajar

Cuando llegue una tarea de este producto:

1. Leer este documento y cualquier instrucción específica del repositorio.
2. Identificar qué parte de la visión y del MVP toca la tarea.
3. Distinguir requisitos confirmados de supuestos.
4. Inspeccionar el código y las herramientas disponibles antes de recomendar cambios.
5. Analizar edge cases, seguridad, aislamiento de tenants, costo y trazabilidad cuando sean relevantes.
6. Proponer la implementación mínima correcta y sus criterios de aceptación.
7. Usar agentes y skills especializadas si el entorno dispone de ellos y la tarea se beneficia.
8. Entregar una síntesis de decisiones, cambios, pruebas ejecutadas, limitaciones y siguientes pasos.

Principio rector: construir una plataforma financiera confiable, explicable y extensible, con la menor complejidad y costo posibles, sin sacrificar controles de autoridad, integridad de datos ni trazabilidad.
