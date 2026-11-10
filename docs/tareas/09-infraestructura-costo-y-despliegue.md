# Tarea 09 — Infraestructura, costo y despliegue

**Estado:** criterios de despliegue adoptados el 2026-11-10; persistencia, correo, IA y frontend abiertos. No implementar.
**Orquestador:** `.cursor/agents/infraestructura-costo.md`. Skill: `figure-it-out`.
**Fuente:** documento maestro, sección 12. Límites citados el 2026-11-01. Volver a leer las páginas oficiales antes de cualquier implementación.

## Objetivo

Dejar criterios para un despliegue de demo en internet, serverless, sin máquinas encendidas siempre, y sin activar nada facturable a ciegas. No elegir todavía la base de datos ni el correo.

## Decisión adoptada (2026-11-10)

- Se adoptan los criterios de despliegue y los guardrails de costo del [modelo 09](../modelo/09-infraestructura-costo.md).
- Demo local primero, luego tramo gratuito. Un recurso de pago exige costo posible escrito, volumen medido y responsable.
- Cloudflare-first es preferencia, no decisión irrevocable.
- D1 frente a PostgreSQL serverless sigue abierto hasta medir escrituras de auditoría, CPU de extracción, concurrencia y costo de salida.
- Correo, inferencia, Queues/Workflows, frontend, dominio, identidad y retención siguen abiertos.

## Decidido

- Preferencia Cloudflare-first, serverless, scale-to-zero.
- La demo debe poder tener frontend y backend accesibles sin VM ni contenedor permanente.
- Objetivo de costo cercano a cero en desarrollo y demo. No es una garantía: un free tier puede dejar de serlo, y scale-to-zero no implica factura cero.
- Evitar, mientras no sean necesarios: Redis, contenedores, bases siempre encendidas, mínimos mensuales y tamaño sobredimensionado.
- No activar servicios de pago, créditos, APIs externas ni recursos facturables sin dejar el costo posible por escrito.
- Configurar límites, alertas y protección contra consumo inesperado cuando se implemente.
- Comparar un servicio externo contra una opción de Cloudflare y documentar la razón si se sale de la plataforma.
- Verificar precios y límites vigentes en la documentación oficial. La tabla de abajo es una foto, no un contrato.

## Hipótesis

- Pages o Workers Static Assets, más Workers, bastan para la demo. Hipótesis alineada con la preferencia. No está probada con un build, porque no hay aplicación.
- R2 encaja con documentos y adjuntos si el volumen cabe en el tramo gratuito. Hay que medirlo con el tamaño real de los PDF de demo, que todavía no existen.

## Abierto

- D1 o PostgreSQL serverless. Comparar transacciones, integridad, consultas, concurrencia, experiencia de desarrollo, costo y migración. No decidir en este archivo.
- Proveedor y protocolo de email.
- Workers AI u otro proveedor de inferencia, según costo, límites y calidad.
- Si Queues o Workflows aportan algo que una petición no puede hacer. Ver la tarea de arquitectura.
- Stack de frontend.

## Fuera de esta tarea

- Crear cuentas de pago.
- Provisionar producción.
- Copiar límites de esta nota dentro del código como si fueran permanentes.
- Elegir Cloudflare en un punto donde falle un requisito de integridad, solo por mantener la preferencia.

## Foto de límites al 2026-11-01

| Pieza | Límite citado | Para qué mirarlo |
| --- | --- | --- |
| Workers Free | 100.000 solicitudes/día y 10 ms de CPU por invocación | La extracción de PDF puede no caber en 10 ms de CPU |
| D1 Free | 5 millones de lecturas/día, 100.000 escrituras/día, 5 GB | Puede no alcanzar si el audit log es verboso |
| R2 Standard Free | 10 GB-mes, 1 millón Class A y 10 millones Class B al mes | Adjuntos de la demo |
| Workers AI | 10.000 Neurons/día. Algunos modelos piden método de pago o créditos | No asumir que todo modelo es gratis |
| Workflows Free | 3.000 pasos/día y 1 GB-mes. La espera no gasta CPU. El estado guardado sí gasta almacenamiento. Por encima puede haber cargo | Aprobaciones en espera |
| Pages | Las Functions cuentan como Workers. Los assets estáticos, según la doc de Pages, son gratuitos e ilimitados | Separar estático de API |

Fuentes:

- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/r2/pricing/
- https://developers.cloudflare.com/workflows/reference/pricing/
- https://developers.cloudflare.com/workers-ai/platform/pricing/
- https://developers.cloudflare.com/pages/functions/pricing/

## Comparación que hay que hacer antes de cerrar la persistencia

Misma lista para D1 y para PostgreSQL serverless, con cifras sacadas de documentación vigente, no de esta tabla:

- Transacciones e integridad referencial que el modelo de factura, aprobación y audit log necesita.
- Concurrencia de dos aprobadores.
- Consultas previstas de duplicados e historial.
- Experiencia de desarrollo y de migraciones.
- Costo en demo y en un uso bajo, no solo el precio de lista del tramo más grande.
- Cómo se saldría de esa base si la elección falla.

Hasta completar esa comparación, las dos siguen abiertas.

## Entregable

Una hoja de criterios de despliegue de demo: qué puede encenderse en free tier, qué exige relectura de precios, y qué no se enciende. Sin cuentas creadas y sin vendor de correo.

## Criterios de aceptación

- La preferencia Cloudflare no aparece como decisión irrevocable de D1, Queues, Workflows ni Workers AI.
- Los límites tienen fecha y enlace.
- Queda prohibido activar un recurso de pago sin anotar el costo.
- La hoja no contiene secretos ni identificadores de cuenta.
- El correo sigue sin proveedor.

## Riesgo si se cierra mal

Un workflow durable por cada factura de prueba puede gastar el cupo de pasos o el almacenamiento del estado aunque nadie apruebe. Un modelo de IA "pequeño" puede exigir créditos. Hay que verlo en la tarifa vigente antes de encenderlo.
