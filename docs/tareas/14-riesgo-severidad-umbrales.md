# Tarea 14 — Riesgo, severidad y umbrales

**Estado:** discovery. Propuesta para decisión; no implementar.
**Orquestador:** `.cursor/agents/autoridad-ia.md`. Skill: `karpathy-guidelines`.
**Fuente:** documento maestro, secciones 8, 9, 11 y 15; tareas 04, 05, 07, 10, 11, 12 y 13.
**Depende de:** validación, autoridad, workflow, seguridad, edge cases, estados e identidad. No depende de un proveedor de base de datos, OCR, correo ni modelo de IA.

## Objetivo

Definir cómo se detecta una señal, cómo se convierte en hallazgo, cómo se asigna o eleva la severidad y cómo los umbrales de la política limitan la autonomía. El resultado es un contrato de decisión verificable, no una tabla de números inventados.

## Decidido

- La escala de severidad es informativa, baja, media, alta y crítica.
- La severidad es una entrada para la decisión, no una decisión.
- Una severidad mayor no reduce la autoridad requerida; la aumenta o la mantiene.
- Una severidad crítica nunca se aprueba automáticamente.
- La severidad no concede autoridad por sí sola.
- Un modelo de IA puede señalar una anomalía, pero no asigna autoridad, no baja la severidad y no cierra una alerta.
- La ausencia de evidencia no es severidad baja: es ausencia de evidencia.
- Cada empresa configura sus políticas y umbrales dentro de los límites del tenant.
- Un override humano lleva actor, motivo, fecha y evidencia.
- Los cálculos, comparaciones y umbrales son deterministas; un modelo no los sustituye.
- No se declara fraude ni legitimidad de forma automática.
- Ningún cambio material queda cubierto por una evaluación anterior.

## Hipótesis

- La plataforma ofrece una tabla base de señales y severidades, y cada tenant la ajusta. Es una hipótesis de producto, no una decisión validada.
- La demo se resuelve con pocas señales y casos sintéticos; no hay datos reales para calibrar números.
- Un puntaje compuesto de riesgo no es necesario para el MVP; la severidad operativa y las reglas explícitas bastan.

## Abierto

- Los valores numéricos de cada umbral.
- Si la tabla base es de plataforma con override por tenant o si cada tenant define todo desde cero.
- Qué señales entran en el MVP y cuáles quedan para después.
- Si existe un puntaje compuesto de riesgo y, si existe, con qué fórmula versionada.
- La fuente de datos para calibrar y el momento de hacerlo.
- El trato exacto de monedas, tasas y fechas de conversión.
- Los plazos de revisión, bloqueo y suspensión.
- Quién puede cambiar umbrales y con qué aprobación.
- Qué evidencia permite bajar una severidad.
- Si la calibración es por tenant o común, y cómo se evita mezclar datos.
- Adopción formal de este modelo.

## Fuera de esta tarea

- Elegir proveedor de base de datos, correo, OCR, JEV o modelo de IA.
- Definir tablas, APIs, eventos o un enum de implementación.
- Inventar importes, porcentajes, plazos o puntajes.
- Aprobar o rechazar facturas; eso es workflow y autoridad.
- Ejecutar pagos o L3.
- Declarar fraude, legitimidad o responsabilidad legal.
- Calibrar con datos reales de clientes.

## Entregable

`docs/modelo/14-riesgo-severidad-umbrales.md` con:

- distinción entre señal, hallazgo, tipo de riesgo, severidad, umbral y decisión;
- catálogo de señales y su riesgo asociado, sin conclusiones automáticas;
- reglas de asignación y elevación de severidad;
- modelo de umbral con unidad, moneda, alcance, límite inclusivo o exclusivo, vigencia y versión;
- precedencia, conflicto y reutilización de la política de identidad;
- acoplamiento con L0–L3, quorum y workflow;
- override humano y límites absolutos;
- protocolo de calibración y métricas, sin números inventados;
- ejemplos sintéticos marcados;
- pregunta crítica para adoptar.

## Criterios de aceptación

- Una señal no se presenta como fraude, legitimidad ni decisión.
- La misma entrada, evidencia y versión de política producen la misma severidad.
- Un dato ausente no se trata como "por debajo del umbral" ni como severidad baja.
- Un umbral inclusivo o exclusivo no se decide por conveniencia: la política lo declara.
- Dos políticas contradictorias de igual prioridad producen conflicto y escalamiento.
- La IA puede elevar la necesidad de revisión, pero no bajar ni cerrar una severidad.
- Una severidad crítica bloquea cualquier aprobación automática.
- Un override no puede saltarse una prohibición absoluta ni el aislamiento entre tenants.
- Un cambio de evidencia o de política obliga a reevaluar.
- Cada evaluación deja señal, evidencia, regla, umbral, versión, severidad y actor.
- El modelo no elige proveedor ni inventa números.
- Los ejemplos son sintéticos y están marcados.

## Riesgo si se cierra mal

Un umbral inventado o una severidad que baja sola convierten un control en una apariencia de control. En este producto, eso permite aprobar gasto riesgoso con un registro que parece completo.
