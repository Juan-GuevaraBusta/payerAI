# Tarea 16 — Política de escalamiento de IA

**Estado:** discovery. Propuesta para decisión; no implementar.
**Orquestador:** `.cursor/agents/autoridad-ia.md`. Skill: `karpathy-guidelines`.
**Fuente:** master prompt, secciones 7, 8, 10 y 11; tareas 07, 11, 14 y 15.
**Depende de:** autoridad e IA, validación, riesgo/severidad, contratos y presupuestos. No depende de un proveedor de modelos, JEV, OCR, base de datos ni infraestructura.

## Objetivo

Convertir el orden de preferencia —código determinista, modelo ligero, evaluador estructurado, modelo capaz, humano— en una política operable: cuándo se empieza en cada escalón, qué dispara una subida, cuándo se detiene, cuánto puede costar y qué se registra. No elige modelo ni proveedor.

## Decidido

- Ningún modelo concede autoridad, aprueba, rechaza, ejecuta ni reduce severidad.
- El código determinista es la primera opción y no se sustituye por un modelo.
- Un modelo más capaz no compensa evidencia faltante.
- La severidad alta o crítica deriva a humano; no compra un modelo más caro.
- La salida de un modelo se valida contra un contrato estructurado antes de usarse.
- Cada uso de IA registra modelo, versión, entradas permitidas, salida, evidencias, política y resultado.
- JEV es una opción a evaluar, no una dependencia aprobada.
- No se comparten datos, contexto, cachés ni resultados entre tenants.
- El MVP no mueve dinero ni ejecuta L3.
- Los umbrales de riesgo y severidad se rigen por la tarea 14; los valores siguen abiertos.

## Hipótesis

- La mayoría de las facturas del MVP se resuelven con T0 o T1; T3 es excepción.
- Un solo proveedor de inferencia puede bastar para la demo, pero no se elige aquí.
- El costo se puede medir por caso si el proveedor expone consumo; si no, se registra como no medido.
- La calidad de un modelo ligero es suficiente para extracción y clasificación con esquema cerrado.
- La revisión humana es más cara por caso que T3, pero no se usa como atajo de calidad.

## Abierto

- Política por defecto: costo primero, calidad primero o humano primero.
- Modelos concretos, proveedores, versiones y precios.
- Umbrales de confianza por tarea y su calibración.
- Topes de costo por caso, por tenant y por periodo.
- Latencias objetivo y plazos de espera.
- Qué tareas requieren T2 y si JEV pasa la evaluación.
- Si el tenant puede restringir escalones o solo endurecerlos.
- Retención, residencia y tratamiento por proveedor externo.
- Idioma, formatos y tipos de documento cubiertos.
- Estrategia de prompts, caché y evaluación.
- Adopción formal de este modelo.

## Fuera de esta tarea

- Elegir modelo, proveedor de inferencia, JEV, OCR, base de datos o infraestructura.
- Fijar precios, cuotas, licencias o límites de un proveedor.
- Diseñar APIs, colas, esquemas de persistencia o código.
- Conceder autonomía o autoridad a un modelo.
- Calibrar severidad o umbrales de riesgo.
- Implementar L3 o mover dinero.
- Declarar que un modelo es seguro o preciso sin medición.
- Usar datos reales de clientes.

## Entregable

`docs/modelo/16-escalamiento-ia.md` con:

- definición de escalones de cómputo y su diferencia con L0–L3;
- principios de enrutamiento;
- entradas de decisión y tabla de rutas;
- disparadores de subida, detención y reversión;
- separación entre escalamiento de cómputo y escalamiento humano;
- política de costo, latencia y disponibilidad;
- validación, confianza y calidad;
- seguridad, tenancy y datos;
- observabilidad y registro;
- modos de fallo y fallback;
- ejemplos sintéticos;
- pregunta crítica para adoptar.

## Criterios de aceptación

- Una regla determinista existente no se envía a un modelo.
- Una factura sin contrato no sube a un modelo más capaz para "resolver" la ausencia; se pide evidencia o se escala a humano.
- Una severidad alta o crítica no se trata con un modelo más caro como sustituto de revisión humana.
- Un modelo no puede aprobar, rechazar, ejecutar ni bajar severidad.
- Un fallo de modelo no termina en aprobación; termina en fallback determinista o humano.
- Un tope de costo no salta una validación obligatoria.
- Cada ruta registra disparador, escalón, modelo, versión, costo si se midió y resultado.
- No se comparten datos entre tenants.
- El modelo no elige proveedor ni inventa precios.
- Las preguntas abiertas quedan explícitas.

## Riesgo si se cierra mal

Un sistema que escala a un modelo más capaz cada vez que falta evidencia convierte la falta de datos en una respuesta fluency. Eso produce decisiones seguras de apariencia y falsas de fondo.
