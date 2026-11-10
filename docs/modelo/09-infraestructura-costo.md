# Infraestructura, costo y despliegue

**Estado:** criterios adoptados el 2026-11-10; D1 es default de demo. Correo, cola, workflow durable, modelo de IA y stack de frontend siguen abiertos. No implementar.
**Tarea:** 09.
**Depende de:** las tareas 01 a 08.
**Orquestador:** `.cursor/agents/infraestructura-costo.md`.
**Skill:** `figure-it-out`.
**Fuente:** documento maestro, sección 12. Precios y límites verificados en documentación oficial el 2026-11-03.

## Fuentes y alcance

Este documento es una hoja de criterios para una demo en internet. No crea cuentas, no provisiona recursos, no elige proveedor de correo y no cierra la persistencia. La preferencia Cloudflare-first es una inclinación de despliegue; no convierte a D1, Queues, Workflows ni Workers AI en decisiones irrevocables.

La tabla de límites es una foto con fecha. El precio de lista no es la factura: impuestos, tipo de cambio, cargos de red, dominio y consumo real pueden cambiarla. Antes de encender cualquier recurso se vuelve a leer la página oficial y se anota el costo posible.

## Lo que está decidido, lo que es hipótesis y lo que sigue abierto

### Adoptado el 2026-11-10

- Se adoptan los criterios de despliegue y los guardrails de costo de este documento.
- La demo se prepara primero en local y luego en el tramo gratuito. Un recurso de pago no se enciende sin costo posible escrito, volumen medido y responsable.
- Se evitan Redis, contenedores, VM y bases siempre encendidas mientras no exista un requisito medido.
- Cloudflare-first sigue siendo preferencia, no decisión irrevocable. Si un requisito de integridad falla, se documenta la salida.
- **D1 es la persistencia por defecto de la demo.** La decisión aplica a la demo con datos sintéticos, no a producción ni a un piloto con datos reales.
- PostgreSQL serverless sigue abierto como salida para piloto o producción. El disparo de migración exige medir escrituras de auditoría, CPU de extracción, concurrencia de aprobadores y costo de salida.
- Correo, inferencia, Queues/Workflows, frontend, dominio, identidad y retención siguen abiertos.
- La foto de límites y precios es del 2026-11-03; se vuelve a leer la página oficial antes de encender cada recurso.

### Decidido

- Preferencia Cloudflare-first, serverless y scale-to-zero.
- Frontend y backend deben poder funcionar como demo en internet sin VM ni contenedor permanente.
- Objetivo de costo cercano a cero en desarrollo y demo, sin prometer factura cero.
- Evitar Redis, contenedores, bases siempre encendidas, mínimos mensuales y recursos sobredimensionados mientras no exista un requisito medido.
- No activar servicios de pago, créditos, APIs externas ni recursos facturables sin dejar el costo posible por escrito.
- Configurar límites, alertas y protección contra consumo inesperado cuando se implemente.
- Comparar un servicio externo contra una opción de Cloudflare y documentar la razón si se sale de la plataforma.
- Verificar precios y límites vigentes antes de implementar.

### Hipótesis

- Pages o Workers Static Assets, más Workers, bastan para la demo. No está probado con un build porque todavía no hay aplicación.
- R2 encaja con documentos y adjuntos si el volumen cabe en el tramo gratuito. Falta medir el tamaño real de los PDF de demo.
- Un solo entorno de demo es suficiente para validar el ciclo. No se asume alta disponibilidad ni recuperación multi-región.

### Abierto

- Migración de D1 a PostgreSQL serverless para piloto o producción, y criterios de disparo.
- Proveedor y protocolo de correo.
- Workers AI u otro proveedor de inferencia, según costo, límites y calidad.
- Si Queues o Workflows aportan algo que una petición no puede hacer.
- Stack de frontend.
- Dominio, certificados y política de acceso a la demo.
- Retención de documentos, logs y datos de demo.

## Mapa de despliegue de demo

| Capacidad | Opción inicial a evaluar | Qué debe probarse antes de encenderla | Estado |
| --- | --- | --- | --- |
| Frontend estático | Pages o Workers Static Assets | Build reproducible, assets y rutas | Candidato |
| API y lógica de backend | Workers o Pages Functions | CPU por invocación, subrequests y límites de tiempo | Candidato |
| Documentos y adjuntos | R2 | Tamaño, operaciones y retención | Candidato |
| Persistencia relacional | D1 para demo; PostgreSQL serverless como salida | Transacciones, integridad, concurrencia, costo y salida | D1 default de demo; migración abierta |
| Procesamiento asíncrono | Queues | Si existe trabajo que no cabe en la petición | Solo con requisito medido |
| Esperas y reintentos | Workflows | Pasos, almacenamiento y semántica de reintento | Solo con requisito medido |
| Inferencia | Workers AI u otro | Modelo, calidad, costo por uso y límites | Abierto |
| Correo | Ninguno | Proveedor, protocolo, reputación y costo | Abierto |
| Identidad de usuarios | Ninguno | Esquema y proveedor | Abierto |

Ninguna fila autoriza a crear el recurso. La fila “solo con requisito medido” significa que primero hay que describir la espera, el reintento o el trabajo que no cabe en una petición.

## Foto de límites y precios al 2026-11-03

### Cloudflare

| Pieza | Tramo gratuito | Tramo de pago | Qué mirar en la demo | Página y fecha |
| --- | --- | --- | --- | --- |
| Workers | 100.000 solicitudes/día; 10 ms de CPU por invocación; 50 subrequests por solicitud; 6 conexiones salientes simultáneas; 128 MB de memoria; Worker de 64 MiB; 100 Workers; 5 cron triggers; 20.000 archivos estáticos de 25 MiB cada uno; 64 variables de entorno | Desde USD 5/mes; incluye 10 millones de solicitudes y 30 millones de CPU-ms; luego USD 0,30 por millón de solicitudes y USD 0,02 por millón de CPU-ms; CPU máxima de 5 minutos | La extracción de PDF puede no caber en 10 ms de CPU. Medir antes de asumir que la demo queda gratis | `workers/platform/limits/` y `workers/platform/pricing/`; actualizadas 2026-10-29 y 2026-10-02 |
| D1 | 5 millones de filas leídas/día; 100.000 filas escritas/día; 5 GB de almacenamiento total; 10 bases; base máxima de 500 MB; 50 consultas por invocación; Time Travel 7 días | Incluye 25.000 millones de filas leídas/mes, 50 millones escritas/mes, 5 GB y 100.000 bases; luego USD 0,001 por millón de lecturas, USD 1,00 por millón de escrituras, USD 0,75/GB-mes y USD 0,10 por base/mes; base máxima de 10 GB; 1.000 consultas por invocación; Time Travel 30 días; almacenamiento total máximo de 1 TB | El audit log puede consumir las 100.000 escrituras/día. La base de 500 MB gratuita y la de 10 GB pagada acotan el piloto | `d1/platform/pricing/` y `d1/platform/limits/`; actualizadas 2026-10-30 |
| R2 Standard | 10 GB-mes; 1 millón de Class A; 10 millones de Class B; egreso sin cargo | USD 0,015/GB-mes; USD 4,50 por millón de Class A; USD 0,36 por millón de Class B; egreso sin cargo | Adjuntos de demo; el egreso no es el costo principal, sí el almacenamiento y las operaciones | `r2/pricing/`; actualizada 2026-10-30 |
| R2 Infrequent Access | No usa el mismo tramo gratuito que Standard para todo el consumo | USD 0,01/GB-mes; USD 9,00 por millón de Class A; USD 0,90 por millón de Class B; recuperación USD 0,01/GB; egreso sin cargo | Solo si el patrón de acceso es realmente frío; no para documentos que se abren en la demo | `r2/pricing/`; actualizada 2026-10-30 |
| Pages | Assets estáticos gratuitos e ilimitados según la documentación; Functions se facturan como Workers | Igual que Workers | Separar assets de API para no contar el frontend como invocación | `pages/functions/pricing/`; actualizada 2026-09-08 |
| Workflows | 3.000 pasos/día; 1 GB-mes de almacenamiento; la espera no consume CPU; el estado persistido sí cuenta | Incluye 500.000 pasos/mes y 1 GB; luego USD 0,80 por cada 100.000 pasos y USD 0,20/GB-mes; el cobro de pasos y almacenamiento aplica desde 2026-08-10 | Un workflow por factura puede gastar pasos y almacenamiento aunque nadie apruebe | `workflows/reference/pricing/`; actualizada 2026-09-21 |
| Queues | 10.000 operaciones/día | Incluye 1 millón de operaciones/mes; luego USD 0,40 por millón; 10.000 colas incluidas y USD 0,10/cola/mes; retención 24 h en Free y 4 días por defecto en Paid, hasta 14 | Cada mensaje consume varias operaciones; no encender sin medir el trabajo asíncrono | `queues/platform/pricing/`; actualizada 2026-10-30 |
| Workers AI | 10.000 Neurons/día | USD 0,011 por 1.000 Neurons; algunos modelos exigen método de pago o créditos | No asumir que todo modelo es gratuito; verificar el modelo concreto | `workers-ai/platform/pricing/`; actualizada 2026-10-20 |

### PostgreSQL serverless, como referencia comparativa

Neon y Supabase se usan como ejemplos de PostgreSQL serverless. No son una elección.

| Pieza | Tramo gratuito | Tramo de pago | Qué mirar en la demo | Página y fecha |
| --- | --- | --- | --- | --- |
| Neon | USD 0; 100 proyectos; 100 CU-horas por proyecto/mes; 1 GB de almacenamiento por proyecto, hasta 20 GB en total; 5 GB de egreso por proyecto; 10 ramas por proyecto; scale-to-zero a los 5 minutos; historial de 6 horas hasta 1 GB | Launch: USD 0,106/CU-hora y USD 0,35/GB-mes, sin mínimo mensual; Scale: USD 0,222/CU-hora; egreso y ramas según plan | 1 CU es aproximadamente 1 vCPU y 4 GB de RAM. Un CU encendido todo el mes cuesta USD 77,38; con scale-to-zero el consumo baja, pero el arranque en frío aparece | `neon.com/pricing` y `neon.com/docs/introduction/plans`; actualizadas 2026-10-31 y 2026-10-23 |
| Supabase | USD 0; 500 MB de base; 2 proyectos activos; se pausa tras una semana de inactividad | Pro desde USD 25/mes; 8 GB de disco; USD 10 de créditos de compute; instancia Micro desde USD 10/mes | La pausa por inactividad no sirve para una demo que debe responder sin despertar a mano | `supabase.com/pricing`; consultada 2026-11-03 |

La comparación de precios no incluye impuestos, tipo de cambio, dominio ni costos de correo. Tampoco incluye el costo de una persona operando la demo.

## Comparación D1 frente a PostgreSQL serverless

La comparación usa la misma lista que pide la tarea 09. Ninguna fila cierra la persistencia: cada una deja una medición pendiente.

| Criterio | D1 | PostgreSQL serverless | Qué falta medir |
| --- | --- | --- | --- |
| Transacciones e integridad | SQLite con auto-commit. `batch()` envía varias sentencias en una transacción: si una falla, se revierte la secuencia. No hay transacción interactiva entre varias peticiones. Claves foráneas aplicadas por defecto; se pueden diferir dentro de la transacción | ACID con transacciones interactivas, niveles de aislamiento, bloqueos de fila y `SAVEPOINT`. Claves foráneas y restricciones verificables | Cuántas escrituras de una aprobación deben ser atómicas y si caben en un solo `batch()` |
| Concurrencia de dos aprobadores | Una base D1 se ejecuta en un solo hilo; las consultas se serializan. El límite de 30 s por consulta y el `batch()` acotan la unidad de trabajo | MVCC y bloqueos permiten lecturas y escrituras concurrentes. Un pooler en modo transacción limita el estado de sesión; las migraciones y `SET` necesitan conexión directa | Cómo se evita que dos aprobadores sobrescriban la misma decisión y qué error ve el perdedor |
| Consultas de duplicados e historial | SQLite; consultas relacionales, índices y agregados. El historial verboso compite con el límite de 1.000 consultas por invocación en Paid y 50 en Free | SQL más expresivo, funciones de ventana, CTEs, índices parciales y extensiones. El costo de compute puede subir con consultas largas | Volumen de filas del audit log, selectividad de índices y consultas de duplicado exacto |
| Aislamiento multi-tenant | Un `tenant_id` por fila más el filtro en cada consulta. También cabe una base por tenant: 10 gratis y 100.000 en Paid, con 500 MB o 10 GB por base | `tenant_id` con políticas de fila, un esquema por tenant o una base por tenant. Las políticas de fila necesitan contexto de sesión y cuidado con el pooler | Si la base elegida puede imponer el tenant sin depender de que cada consulta lo recuerde |
| Experiencia de desarrollo y migraciones | `wrangler` y Miniflare para local; migraciones versionadas; Time Travel de 7 o 30 días; exportación a SQL | Herramientas maduras de PostgreSQL, ramas de base, `pg_dump`, migraciones y clientes estándar; Neon ofrece ramas e historial | Si el equipo puede reproducir la base local sin fricción y si las migraciones son reversibles |
| Costo en demo y uso bajo | Free: 5 M lecturas/día, 100 k escrituras/día, 5 GB y 10 bases. Paid: desde USD 5/mes de Workers, con 25 B lecturas/mes, 50 M escrituras/mes y 5 GB incluidos | Neon Free: 100 CU-horas/proyecto/mes y 1 GB. Launch: USD 0,106/CU-hora; un CU siempre encendido cuesta USD 77,38/mes. Supabase Free se pausa; Pro desde USD 25/mes | Consumo real de escrituras de auditoría, CPU de extracción, tamaño de PDF y horas de base despierta |
| Migración y salida | Exportación a SQL compatible con SQLite. Pasar de D1 a PostgreSQL exige traducir tipos, fechas, secuencias y consultas. El límite de 10 GB por base Paid acota la copia | `pg_dump` y estándares de PostgreSQL; la salida a otro PostgreSQL es directa. Pasar a D1 también exige traducción | Qué tan grande será la base al final del piloto y cuánto cuesta una copia verificable |
| Operación | Sin servidor de base que administrar; límites de plataforma y menos superficie | Hay que elegir región, plan, pooler, backups y ventana de mantenimiento; más control y más operación | Quién responde por backups, restauración y retención en la demo |

### Lectura de la comparación

- D1 es más simple de encender dentro de Cloudflare y tiene un tramo gratuito suficiente para una demo pequeña. Su límite de escritura diaria y su base máxima son los primeros topes que hay que medir.
- PostgreSQL serverless da transacciones y consultas más ricas, pero añade un proveedor, un pooler, una región y un costo de compute que puede dejar de ser cero. Neon puede escalar a cero; Supabase Free se pausa por inactividad.
- D1 se adopta para la demo por simplicidad de despliegue y tramo gratuito. La decisión no se extiende a producción ni a un piloto con datos reales.
- La demo en D1 debe probar el `batch()` con la secuencia real de una aprobación y medir las escrituras del audit log. Si el tramo gratuito no alcanza, se optimiza, se pasa a Workers/D1 Paid o se evalúa la salida a PostgreSQL; no se asume que D1 sigue siendo gratis.
- PostgreSQL serverless queda como salida para piloto o producción. Si se migra, hay que probar el pooler en modo transacción con la misma secuencia.
- La salida de D1 hacia PostgreSQL es más costosa que la salida entre PostgreSQL. Esa asimetría cuenta si la demo se convierte en piloto.

## Criterios para encender la demo

| Etapa | Qué puede encenderse | Condición | Evidencia que se guarda |
| --- | --- | --- | --- |
| Local | Nada en la nube | La demo corre en local con datos sintéticos | Comando reproducible y versión de herramientas |
| Demo pública gratuita | Pages o Workers Static Assets, Workers, R2 y una base gratuita | Cada recurso cabe en su tramo gratuito y el costo posible está escrito | Captura de la tabla de límites con fecha y enlace |
| Demo con Workers Paid | Workers Paid desde USD 5/mes | La CPU de extracción o el volumen de solicitudes supera el tramo gratuito | Medición de CPU y solicitudes antes de activar |
| Demo con D1 Paid | D1 Paid | Se superan 5 M lecturas/día, 100 k escrituras/día, 5 GB o 10 bases | Conteo de lecturas y escrituras por operación |
| Demo con R2 Paid | R2 Paid | Se superan 10 GB-mes, 1 M Class A o 10 M Class B | Tamaño de adjuntos y operaciones por carga |
| Demo con Workflows | Workflows Free y luego Paid | Existe una espera o reintento que no cabe en una petición; los pasos y el estado están medidos | Número de pasos por operación y almacenamiento del estado |
| Demo con Queues | Queues Free y luego Paid | Existe trabajo asíncrono medido; las operaciones por mensaje están contadas | Operaciones por mensaje y retención |
| Demo con IA | Workers AI Free u otro proveedor | El modelo es gratuito o el costo por uso está aprobado por escrito | Modelo, versión, Neurons o tokens por operación |
| Demo con PostgreSQL | Neon Free, Supabase Free u otro | El tramo gratuito cubre el uso y el costo de salir de cero está escrito | Horas de compute, almacenamiento y egreso |
| Demo con correo | Nada todavía | Hay proveedor, protocolo y costo aprobados | Aún no existe |

Regla de corte: si un recurso no tiene costo posible escrito, no se enciende. Si el costo depende de un volumen que no se midió, primero se mide con datos sintéticos.

## Costo posible por escrito

No se inventa un total. Se anotan los factores que lo mueven y la fórmula de cada uno.

| Factor | Cómo se calcula | Límite que lo vuelve pago |
| --- | --- | --- |
| Solicitudes a Workers | Solicitudes por operación × operaciones del mes | 100.000/día en Free; 10 M/mes incluidas en Paid |
| CPU de Workers | CPU-ms por invocación × invocaciones | 10 ms por invocación en Free; 30 M CPU-ms incluidas en Paid |
| Lecturas y escrituras D1 | Filas leídas y escritas por operación × operaciones | 5 M lecturas/día y 100 k escrituras/día en Free; 25 B lecturas/mes y 50 M escrituras/mes incluidas en Paid |
| Almacenamiento D1 | Tamaño de la base y del audit log | 5 GB en Free; 5 GB incluidos en Paid y USD 0,75/GB-mes después |
| Almacenamiento R2 | GB-mes de documentos y adjuntos | 10 GB-mes en Free; USD 0,015/GB-mes en Standard |
| Operaciones R2 | Class A y Class B por carga, lectura y listado | 1 M Class A y 10 M Class B/mes en Free |
| Pasos de Workflows | Pasos por operación × operaciones | 3.000 pasos/día en Free; 500.000/mes incluidos en Paid |
| Almacenamiento de Workflows | Estado persistido de cada espera | 1 GB-mes incluido; USD 0,20/GB-mes después |
| Operaciones de Queues | Operaciones por mensaje × mensajes | 10.000/día en Free; 1 M/mes incluido en Paid |
| Neurons de Workers AI | Neurons por operación × operaciones | 10.000/día en Free; USD 0,011/1.000 después |
| Compute de PostgreSQL | CU-horas encendidas × tarifa | 100 CU-horas/proyecto/mes en Neon Free; USD 0,106/CU-hora en Launch |
| Almacenamiento PostgreSQL | GB-mes | 1 GB/proyecto en Neon Free; USD 0,35/GB-mes en Launch |
| Egreso PostgreSQL | GB transferidos | 5 GB/proyecto en Neon Free; según plan después |
| Dominio y correo | Costo fijo del registrador o proveedor | No incluido en ningún tramo anterior |

Antes de activar un recurso de pago se escribe: recurso, plan, límite gratuito, disparador del cobro, costo unitario, volumen medido, costo posible del mes, fecha de verificación y responsable. Sin identificadores de cuenta ni secretos.

## Qué no se enciende en esta etapa

- Redis, contenedores, VM, Kubernetes o una base siempre encendida.
- Un plan de pago sin costo posible escrito.
- Créditos prepagos o APIs externas sin presupuesto aprobado.
- Un proveedor de correo.
- OCR o un modelo de IA de pago sin medir el volumen.
- Un workflow durable por cada factura sin contar pasos y almacenamiento.
- Una cola sin trabajo asíncrono medido.
- Workers AI con un modelo que exige método de pago.
- Producción, multi-región, alta disponibilidad o backups gestionados.
- Datos reales de clientes.

## Riesgos y mediciones pendientes

| Riesgo | Por qué importa | Medición que lo resuelve |
| --- | --- | --- |
| Extracción de PDF fuera de 10 ms de CPU | Workers Free puede rechazar o degradar la extracción | CPU-ms por PDF típico y por PDF grande, en local y en el runtime |
| Audit log verboso | D1 Free permite 100 k escrituras/día; una operación puede escribir varias filas | Filas escritas por transición y por operación completa |
| Workflows por factura | 3.000 pasos/día y 1 GB-mes pueden agotarse aunque nadie apruebe | Pasos por operación, tamaño del estado y operaciones en espera |
| Modelo de IA no gratuito | Algunos modelos de Workers AI exigen pago | Modelo, versión y condición de facturación |
| Base D1 pequeña | 500 MB en Free y 10 GB en Paid | Tamaño de base y audit log al final del piloto |
| Free tier que cambia | Las páginas tienen fecha y pueden cambiar | Relectura antes de cada activación |
| PostgreSQL que no escala a cero | El compute cobra por hora encendida | Horas de actividad real y política de scale-to-zero |
| Supabase que se pausa | Una demo inactiva deja de responder | Prueba de despertar y política de plan |
| Salida de D1 | La migración a PostgreSQL no es directa | Prueba de exportación y traducción de un subconjunto |
| Costo en moneda local | Precios en USD y tipos de cambio | Factura estimada con impuestos y tipo de cambio |

## Lo que este documento no decide

- La base de datos de piloto o producción; D1 es default de demo. La migración a PostgreSQL sigue abierta.
- El proveedor de correo.
- El modelo de IA.
- El stack de frontend.
- Si hacen falta Queues o Workflows.
- La región, el dominio, el proveedor de identidad y la retención.
- Ningún punto de `docs/decisiones/abiertas.md`.

## Criterios de aceptación

- La preferencia Cloudflare no aparece como decisión irrevocable de D1, Queues, Workflows ni Workers AI.
- Los límites y precios tienen fecha y enlace oficial.
- Está prohibido activar un recurso de pago sin anotar el costo posible.
- La hoja no contiene secretos ni identificadores de cuenta.
- El correo sigue sin proveedor.
- D1 es default de demo; PostgreSQL serverless queda comparado como salida para piloto o producción.
- La comparación no declara superioridad general para producción.
- La demo con datos sintéticos se distingue de un piloto con datos reales.
- `bash scripts/ci.sh` pasa.

## Fuentes

Consultadas el 2026-11-03. La fecha entre paréntesis es la última actualización que muestra la página.

- https://developers.cloudflare.com/workers/platform/limits/ (2026-10-29)
- https://developers.cloudflare.com/workers/platform/pricing/ (2026-10-02)
- https://developers.cloudflare.com/d1/platform/pricing/ (2026-10-30)
- https://developers.cloudflare.com/d1/platform/limits/ (2026-10-30)
- https://developers.cloudflare.com/d1/worker-api/d1-database/ (2026-06-22)
- https://developers.cloudflare.com/d1/sql-api/foreign-keys/ (2026-04-21)
- https://developers.cloudflare.com/r2/pricing/ (2026-10-30)
- https://developers.cloudflare.com/pages/functions/pricing/ (2026-09-08)
- https://developers.cloudflare.com/workflows/reference/pricing/ (2026-09-21)
- https://developers.cloudflare.com/queues/platform/pricing/ (2026-10-30)
- https://developers.cloudflare.com/workers-ai/platform/pricing/ (2026-10-20)
- https://neon.com/pricing (2026-10-31)
- https://neon.com/docs/introduction/plans (2026-10-23)
- https://neon.com/docs/connect/connection-pooling (2026-10-19)
- https://supabase.com/pricing (consultada 2026-11-03)
