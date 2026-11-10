# Política de escalamiento de IA

**Estado:** adoptado el 2026-11-09. No implementar.
**Tarea:** 16.
**Orquestador:** `.cursor/agents/autoridad-ia.md`.
**Skill:** `karpathy-guidelines`.

Política conceptual para decidir qué componente resuelve una tarea y cuándo se sube de escalón. No elige modelo, proveedor, JEV, OCR, base de datos ni infraestructura. No concede autoridad.

Este documento fija la postura y la ruta base. Los modelos concretos, umbrales, precios y topes siguen abiertos.

## Fuentes y alcance

- [Documento maestro](../documento-maestro.md), secciones 9, 11 y 13.
- [Master prompt](../../MASTER_PROMPT_FINANCIAL_OPERATIONS.md), secciones 7, 8, 10 y 11.
- [Decisiones adoptadas](../decisiones/adoptadas.md) y [asuntos abiertos](../decisiones/abiertas.md).
- [Tarea 16](../tareas/16-escalamiento-ia.md).
- [Autoridad, autonomía e IA](07-autoridad-ia.md).
- [Validación](04-validacion.md), [edge cases](11-edge-cases.md), [riesgo, severidad y umbrales](14-riesgo-severidad-umbrales.md) y [contratos y presupuestos](15-contratos-presupuestos-evidencia.md).

**Alcance:** enrutamiento de cómputo, subida, detención, fallback, costo, calidad y registro. **No es** la escala de autonomía L0–L3, ni una autorización, ni una decisión de producto sobre qué modelo contratar.

## Decisión adoptada (2026-11-09)

- **Postura por defecto:** costo primero con escalamiento explícito.
- Se empieza en T0 si hay regla; en T1 si hace falta extracción o clasificación. Se sube solo con un disparador declarado.
- La evidencia ausente, parcial o conflictiva va a T4. No se sube a T3 para "completar" la ausencia.
- La severidad alta o crítica va a T4. T3 puede resumir para el humano, pero no decide ni baja la severidad.
- T2 es opcional y solo existe si está verificado. JEV no está aprobado.
- Un fallo o un tope de costo termina en T0 o T4; nunca en aprobación.
- La confianza se calibra por tarea y no es autoridad.
- El tenant puede endurecer; no puede permitir lo prohibido.
- La ruta y la intervención humana se registran.
- Quedan abiertos: modelos, proveedores, precios, umbrales de confianza, topes de costo y latencia, papel de T2/JEV, configurabilidad del tenant, retención y residencia.

## 1. Dos escalas que no se mezclan

| Escala | Pregunta | Qué decide | Qué no decide |
| --- | --- | --- | --- |
| **Escalones de cómputo T0–T4** | ¿Qué componente resuelve esta tarea? | Ruta de procesamiento y costo. | Autoridad, aprobación, pago ni severidad. |
| **Niveles de autonomía L0–L3** | ¿Qué puede hacer el sistema y quién responde? | Acción permitida y autoridad requerida. | Qué modelo se usa ni cuánto cuesta. |

Un escalón más alto **no** concede un nivel L más alto. Un nivel L más alto **no** obliga a usar un modelo más caro. La política de autonomía está en [modelo 07](07-autoridad-ia.md); esta política solo decide cómputo.

### 1.1 Escalones

| Escalón | Componente | Uso típico | Límite |
| --- | --- | --- | --- |
| **T0 Determinista** | Reglas, cálculos, comparaciones y validaciones | Regla existente, cálculo, duplicado exacto, permiso, transición. | No interpreta prosa ambigua que ninguna regla alcanza. |
| **T1 Modelo ligero** | Modelo económico con esquema cerrado | Clasificación, extracción, normalización propuesta. | No decide, no autoriza, no inventa campos. |
| **T2 Evaluador estructurado** | Evaluador con interfaz y costo verificados; JEV solo si pasa la evaluación | Tarea estructurada con criterios explícitos. | No se asume disponible; no sustituye reglas duras. |
| **T3 Modelo capaz** | Modelo de mayor capacidad para ambigüedad real | Razonamiento sobre evidencia suficiente y lenguaje ambiguo. | No compensa evidencia faltante ni concede autoridad. |
| **T4 Humano** | Actor con autoridad | Evidencia faltante, conflicto, severidad alta o crítica, excepción, acción prohibida. | No es una aprobación automática; el silencio no aprueba. |

T2 es opcional. Si no existe un evaluador verificado, la ruta pasa de T1 a T3 solo si se cumple un disparador y hay evidencia suficiente. La ausencia de T2 no bloquea el MVP.

## 2. Principios

1. **Empezar en el escalón más bajo que pueda resolver.** No se empieza en T3 por comodidad.
2. **La suficiencia se demuestra.** Una regla, un esquema válido o evidencia suficiente habilitan el escalón; la preferencia del modelo no.
3. **Subir exige un disparador.** No se escala por intuición, por marca ni por "por si acaso".
4. **La evidencia faltante no se resuelve con más modelo.** Se pide evidencia o se escala a humano.
5. **La severidad alta no compra un modelo más caro.** Compra revisión humana.
6. **Un modelo más capaz no sustituye una regla dura.** Si la regla existe, se aplica.
7. **La salida es no confiable hasta validarse.** Esquema, evidencia y límites se comprueban.
8. **La confianza no es autoridad.** Un puntaje alto no aprueba; uno bajo no rechaza solo.
9. **El costo no salta una validación.** Si se agota el presupuesto, se degrada a T0 o T4, no a "aprobar".
10. **La ruta se registra.** Cada subida, detención y fallback deja motivo y versión.
11. **El tenant puede endurecer, no aflojar lo absoluto.** Puede restringir escalones o exigir humano; no puede permitir lo prohibido.
12. **Todo pertenece a un tenant.** No se comparten entradas, cachés, resultados ni evaluaciones.

## 3. Entradas de la decisión de ruta

La ruta se decide con hechos verificables, no con la auto-percepción del modelo:

- **Tipo de tarea:** extracción, clasificación, anomalía, comparación, resumen, explicación.
- **Cobertura determinista:** existe regla, no existe, o hay conflicto.
- **Estado de evidencia:** suficiente, ausente, parcial, ambigua, vencida o conflictiva.
- **Validez de esquema:** salida completa, incompleta o inválida.
- **Ambigüedad:** de formato, de identidad, de fuente, de lenguaje o de política.
- **Riesgo y severidad:** informativa, baja, media, alta o crítica.
- **Sensibilidad:** datos personales, bancarios, contractuales o restringidos por el tenant.
- **Reversibilidad e impacto:** informativo o con efecto en una decisión financiera.
- **Costo y latencia:** presupuesto disponible, objetivo de tiempo y salud del proveedor.
- **Política del tenant:** escalones permitidos, revisión humana obligatoria y topes de costo.
- **Disponibilidad:** modelo o evaluador disponible, con versión identificable.

No son entradas válidas:

- "el modelo se siente seguro";
- el prestigio del proveedor;
- una preferencia personal sin política;
- el deseo de impresionar en una demo;
- un precio no medido.

## 4. Tabla de ruta

La tabla es conceptual. No fija umbrales numéricos.

| Situación | Ruta inicial | Subida permitida | Techo |
| --- | --- | --- | --- |
| Existe una regla determinista aplicable | T0 | Ninguna; si la regla falla, T4 o corrección de regla | T0 |
| Extracción o clasificación con esquema cerrado y evidencia suficiente | T1 | T2 si está verificado; T3 si T1 no valida y la evidencia sigue siendo suficiente | T3 |
| T1 devuelve esquema inválido o campo requerido ausente | T1 corregido una vez | T3 si hay evidencia suficiente; T4 si falta evidencia | T3 o T4 |
| Ambigüedad de lenguaje con evidencia suficiente | T2 si está verificado; si no, T3 | T4 si no se resuelve | T3 o T4 |
| Ambigüedad de identidad de proveedor | T0 para señales fuertes; T1 para candidatos | T4 para confirmar identidad | T4 |
| Evidencia faltante, parcial o conflictiva | T4 | Ninguna subida de modelo compensa la ausencia | T4 |
| Contrato vencido, anexos contradictorios o presupuesto sin dato | T0 para detectar; T4 para decidir | Ninguna | T4 |
| Severidad alta o crítica | T4 | T3 solo como resumen asistido, no como decisión | T4 |
| Datos bancarios nuevos o modificados | T4 | Ninguna | T4 |
| Conflicto de políticas o política ausente | T0 para detectar; T4 para resolver | Ninguna | T4 |
| Señal de cruce entre tenants | Bloqueo | Ninguna | Bloqueo + seguridad |
| Prompt injection o instrucción en documento | Bloqueo de la instrucción | T4 para revisión | Bloqueo + T4 |
| Acción L3 en el MVP | No existe | Ninguna | T4 / fuera de alcance |
| Costo agotado | T0 o T4 | Ninguna que implique gasto no autorizado | T0 o T4 |
| Proveedor caído, timeout o rate limit | Fallback T0 o T4 | Reintento acotado | T0 o T4 |

Reglas de la tabla:

- Una ruta a T4 **no** es una aprobación ni un rechazo; es una derivación.
- Una ruta a T3 **no** cambia la severidad ni la autoridad.
- T3 puede resumir evidencia para un humano; el humano sigue decidiendo.
- Si T3 contradice T0 o T1, no se elige la salida más conveniente: se escala a T4.
- Si no hay salida válida, no se usa.

## 5. Disparadores de subida

### 5.1 Cómputo

- No existe regla determinista para el caso.
- La regla existe pero la entrada queda fuera de su dominio declarado.
- La extracción no valida contra el esquema.
- Falta un campo requerido y la evidencia no está disponible.
- Hay más de un candidato y ninguno se resuelve con señales fuertes.
- El lenguaje es ambiguo y la evidencia es suficiente para razonar.
- El modelo ligero no alcanza el umbral calibrado para esa tarea.
- El evaluador estructurado no puede aplicar sus criterios.

### 5.2 Riesgo y humano

- Severidad alta o crítica.
- Evidencia ausente, parcial o conflictiva.
- Contrato vencido, anexos contradictorios o presupuesto no evaluable.
- Datos bancarios nuevos o modificados.
- Identidad de proveedor ambigua.
- Conflicto de políticas o política ausente.
- Acción prohibida para un modelo.
- Señal de cruce entre tenants.
- Prompt injection o instrucción embebida.
- El tenant exige revisión humana para esa categoría.
- L3 en el MVP.

### 5.3 Operación

- Timeout.
- Rate limit.
- Error de proveedor.
- Salida malformada.
- Versión de modelo no identificable.
- Costo estimado por encima del tope.
- Latencia por encima del objetivo.

Un disparador de riesgo **no** se resuelve subiendo a T3. Se resuelve con T4 o con evidencia.

## 6. Detención, fallback y reversión

- **Detención:** la ruta termina cuando hay salida válida, cuando se alcanza T4, cuando se agota el presupuesto o cuando un control de seguridad bloquea.
- **Reintento:** acotado y registrado. No hay reintentos infinitos ni bucles entre modelos.
- **Fallback:** ante fallo de T1/T2/T3, se degrada a T0 si la regla alcanza o a T4 si no. Nunca a una aprobación.
- **Reversión:** solo con evidencia nueva o entrada corregida. No se baja de escalón para ahorrar si el riesgo sigue alto.
- **Autocertificación:** un modelo no declara que su salida es correcta ni que ya no necesita revisión.
- **Conflicto entre escalones:** se registra y se escala a T4; no gana el más caro ni el más reciente.
- **Cambio de documento o política:** invalida la ruta anterior y obliga a reevaluar.
- **Caché:** solo dentro del tenant, con la misma versión de entrada, esquema y política. Un cambio material invalida la caché.

## 7. Escalamiento humano

El escalamiento humano es distinto del escalamiento de cómputo:

- T4 es un actor con autoridad, no un modelo más.
- Recibe la pregunta concreta, la evidencia, lo que falta y las rutas intentadas.
- Decide dentro de su autoridad, según [identidad y aprobaciones](13-identidad-aprobaciones.md) y [autoridad e IA](07-autoridad-ia.md).
- Su decisión se registra con actor, motivo, fecha y evidencia.
- El silencio no es aprobación.
- Una respuesta humana no convierte una acción prohibida en permitida.
- Un humano puede pedir más evidencia, corregir un dato, aprobar, rechazar o escalar según su autoridad.
- T3 puede ayudar a resumir, pero no decide ni firma.

## 8. Costo, latencia y disponibilidad

- Cada ruta declara un presupuesto por caso y un tope por tenant o periodo, si existe.
- El costo se mide si el proveedor expone consumo; si no, se registra como no medido. No se inventan precios.
- Un tope agotado degrada a T0 o T4; no salta una validación.
- La latencia objetivo se declara por tarea; si se excede, se aplica fallback o se encola.
- Un proveedor caído no justifica aprobar; se usa T0 o T4.
- La caché y el batching son optimizaciones, no permisos.
- No se activan servicios de pago, créditos ni APIs facturables sin costo visible y autorización.
- Los free tiers no se asumen permanentes.

## 9. Calidad y confianza

- La confianza de un modelo no es comparable entre modelos ni entre tareas.
- Cada tarea calibra su umbral con datos sintéticos etiquetados.
- Un puntaje bruto no es una probabilidad calibrada hasta demostrarlo.
- Métricas mínimas: validez de esquema, exactitud de extracción, falsos negativos en anomalías, tasa de escalamiento, tasa de override humano, costo por caso resuelto y latencia.
- Se evalúa contra una línea base determinista y, si aplica, contra T1 y T3.
- Se monitorea deriva por versión de modelo, prompt, esquema y documentos.
- No se afirma precisión, ahorro ni superioridad sin medición.
- Un modelo no se auto-certifica ni se elige por una demo.

## 10. Seguridad, tenancy y datos

- Cada solicitud lleva tenant y se verifica antes de procesar.
- Se aplica minimización: solo los campos necesarios para la tarea.
- No se comparten documentos, contexto, cachés, embeddings, ejemplos ni resultados entre tenants.
- No se entrena ni ajusta con datos del producto sin autorización explícita.
- El contenido de correos, PDFs y adjuntos es dato no confiable; no es instrucción del sistema.
- Un modelo no recibe credenciales, secretos ni acceso a herramientas no autorizadas.
- Se registra el tratamiento por proveedor externo; la elección y la residencia siguen abiertas.
- Una señal de cruce entre tenants detiene la ruta y escala a seguridad.

## 11. Observabilidad

Cada ruta registra, como mínimo:

| Campo | Qué conserva |
| --- | --- |
| Tenant y operación | Contexto de la empresa y de la operación. |
| Tarea | Extracción, clasificación, anomalía, resumen u otra. |
| Entrada | Referencias a documentos, campos y versión; sin secretos. |
| Estado de evidencia | Suficiente, ausente, parcial, ambigua, vencida o conflictiva. |
| Severidad | La aplicada por la tarea 14, si existe. |
| Disparador | Qué motivó la subida o la detención. |
| Ruta | Escalón inicial, final y motivo. |
| Componente | Modelo o evaluador y versión; si no se eligió, se registra el criterio. |
| Esquema y plantilla | Versión usada. |
| Salida | Validada o rechazada; no se guarda como verdad. |
| Costo y latencia | Solo si se midieron. |
| Confianza | Si existe y está calibrada; no es autoridad. |
| Resultado | Decisión, derivación o bloqueo; actor y autoridad. |
| Fallback y errores | Qué falló, qué se intentó y a dónde se degradó. |
| Intervención humana | Actor, motivo, fecha y evidencia. |

El registro es append-only o equivalente y no mezcla tenants. Distingue ruta de cómputo, decisión, autorización y ejecución.

## 12. Modos de fallo

| Fallo | Respuesta | Prohibido |
| --- | --- | --- |
| Timeout | Reintento acotado; luego T0 o T4. | Aprobar por timeout. |
| Salida malformada | Rechazar; corregir una vez; luego T4. | Usar la salida parcial como completa. |
| Proveedor caído | Fallback T0 o T4. | Declarar éxito sin salida. |
| Rate limit | Encolar o degradar; registrar. | Saltar validación para evitar la cola. |
| Modelo no identificable | No usar. | Asumir una versión. |
| Costo excedido | T0 o T4. | Gastar sin autorización. |
| Prompt injection | Bloquear la instrucción; T4. | Ejecutar comandos del documento. |
| Cruce de tenants | Bloquear; seguridad. | Mostrar o mezclar datos. |
| Conflicto T1/T3 | T4. | Elegir la salida más conveniente. |
| Evidencia insuficiente | T4; pedir evidencia. | Subir a T3 para "completar". |
| Severidad alta | T4. | Aprobar automáticamente. |

## 13. Política del tenant

Propuesto:

- La plataforma define una ruta base.
- El tenant puede **endurecer**: prohibir T3, exigir T4 para categorías, bajar topes de costo, restringir datos o proveedores.
- El tenant puede **restringir** el uso de un escalón sin cambiar la autoridad.
- Aflojar una restricción exige decisión registrada; no se hace por configuración silenciosa.
- El tenant no puede permitir una acción prohibida por el modelo 07.
- El tenant no puede usar datos de otro tenant ni compartir caché.
- La política del tenant se versiona y se registra en cada ruta.
- La elección de proveedor y la residencia de datos siguen abiertas.

## 14. Ejemplos sintéticos

Marcados como sintéticos. No fijan umbrales ni precios.

### 14.1 Duplicado exacto

- Regla determinista disponible.
- Ruta: T0.
- No se envía a un modelo.
- Resultado: hallazgo determinista, no aprobación.

### 14.2 Factura limpia con esquema cerrado

- Extracción y clasificación.
- Ruta: T1.
- Comparaciones y reglas: T0.
- Si el esquema valida y la evidencia alcanza, no sube.

### 14.3 Identidad de proveedor ambigua

- Señales fuertes insuficientes.
- Ruta: T0 para señales; T1 para candidatos; T4 para confirmar identidad.
- No se resuelve con T3 ni con una coincidencia de nombre.

### 14.4 Sin contrato

- Evidencia ausente.
- Ruta: T4; pedir evidencia.
- No se sube a T3 para "inferir" el contrato.

### 14.5 Severidad alta

- Señal de posible fraude o cambio sensible.
- Ruta: T4.
- T3 puede resumir, pero no decide ni baja la severidad.

### 14.6 Prompt injection en un PDF

- El documento contiene instrucciones para el sistema.
- Ruta: bloquear la instrucción; T4.
- No se ejecuta nada del documento.

### 14.7 Costo agotado

- El presupuesto de la ruta se agotó.
- Ruta: T0 si la regla alcanza; T4 si no.
- No se aprueba para evitar el costo.

### 14.8 T3 contradice T1

- Dos salidas incompatibles.
- Ruta: T4; registrar ambas.
- No se elige la más cara ni la más reciente.

## 15. Decidido, propuesto, hipótesis y abierto

### Decidido antes de esta tarea

- Ningún modelo concede autoridad, aprueba, rechaza, ejecuta ni reduce severidad.
- El código determinista es la primera opción.
- Un modelo más capaz no compensa evidencia faltante.
- La severidad alta o crítica deriva a humano.
- La salida de un modelo se valida contra un esquema.
- Cada uso registra modelo, versión, entradas, salida, evidencias y resultado.
- JEV no está aprobado.
- El MVP no ejecuta L3.
- No se comparten datos entre tenants.

### Adoptado con este modelo

- Postura por defecto: costo primero con escalamiento explícito.
- Separar escalones de cómputo T0–T4 de niveles de autonomía L0–L3.
- Empezar en el escalón más bajo suficiente y subir solo con disparador.
- Tabla de ruta y disparadores de las secciones 4 y 5.
- Evidencia faltante, conflicto y severidad alta van a T4; no a T3.
- T2 es opcional y solo existe si está verificado.
- Fallback a T0 o T4; nunca a aprobación.
- Confianza calibrada por tarea, no comparable entre modelos.
- Topes de costo no saltan validaciones.
- El tenant puede endurecer; no puede permitir lo prohibido.
- Registro de ruta y de intervención humana.
- Modos de fallo de la sección 12.

### Hipótesis

- La mayoría de las facturas del MVP se resuelven con T0 o T1.
- T3 es excepción, no camino principal.
- Un proveedor de inferencia puede bastar para la demo; no se elige aquí.
- El costo se puede medir si el proveedor expone consumo.
- La revisión humana es más cara por caso, pero no se usa como atajo de calidad.

### Abierto

- Modelos, proveedores, versiones y precios.
- Umbrales de confianza por tarea y calibración.
- Topes de costo y latencia.
- Papel de T2 y evaluación de JEV.
- Restricciones de tenant y su grado de configurabilidad.
- Retención, residencia y tratamiento externo.
- Idiomas, formatos y tipos de documento.
- Estrategia de prompts, caché y evaluación.

## 16. Decisión adoptada sobre la postura

Adoptado el 2026-11-09: **costo primero con escalamiento explícito**.

- **Costo primero con escalamiento explícito:** empezar en T0 o T1, subir solo con disparador y derivar a T4 cuando falte evidencia o el riesgo sea alto. Menor costo y suficiente para el MVP.
- **Calidad primero:** se descartó como postura por defecto; usa T3 antes en casos ambiguos, con más costo y sin más autoridad ni más evidencia.
- **Humano primero:** se descartó como postura por defecto; deriva toda excepción a T4, con más lentitud y costo por caso.

La calidad se protege con reglas, evidencia y revisión humana, no con un modelo más caro por defecto.

## 17. Criterios de aceptación

1. Una regla determinista existente no se envía a un modelo.
2. Una factura sin contrato va a T4 o a solicitud de evidencia; no a T3.
3. Una severidad alta o crítica va a T4; T3 no decide.
4. Un modelo no aprueba, rechaza, ejecuta ni baja severidad.
5. Un fallo de modelo termina en T0 o T4, nunca en aprobación.
6. Un tope de costo no salta una validación obligatoria.
7. La confianza no se usa como autoridad.
8. Cada ruta registra disparador, escalón, componente, versión y resultado.
9. No se comparten datos entre tenants.
10. El modelo no elige proveedor ni inventa precios.
11. T2 no se asume disponible.
12. La política del tenant no puede permitir lo prohibido.
13. Los ejemplos son sintéticos y están marcados.

## 18. Relación con otras tareas

| Tarea | Relación |
| --- | --- |
| 04 Validación | Define las tareas que la ruta procesa. |
| 07 Autoridad e IA | Define autoridad, prohibiciones y registro; esta política no las cambia. |
| 11 Edge cases | Aporta prompt injection, abuso y fallos. |
| 13 Identidad | Aporta tenant, permisos y revisión humana. |
| 14 Riesgo y umbrales | Aporta severidad; esta política no la calibra. |
| 15 Contratos y presupuestos | Aporta estados de evidencia que disparan T4. |
| 09 Infraestructura y costo | Verifica costo real y disponibilidad; no se elige aquí. |

## 19. Fuera de alcance

- Elegir modelo, proveedor, JEV, OCR, base de datos o infraestructura.
- Fijar precios, cuotas, licencias o límites de un proveedor.
- Diseñar APIs, colas, persistencia o código.
- Conceder autonomía o autoridad a un modelo.
- Calibrar severidad o umbrales de riesgo.
- Implementar L3 o mover dinero.
- Declarar precisión o seguridad sin medición.
- Usar datos reales de clientes.
- Cerrar un punto de [asuntos abiertos](../decisiones/abiertas.md) sin decisión explícita.
