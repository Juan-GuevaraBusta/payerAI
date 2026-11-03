# Arquitectura y separación

**Estado:** discovery. Hay responsabilidades conceptuales. No hay arquitectura concreta, código de producto ni stack de frontend.
**Tarea:** 08.
**Depende de:** las tareas 01 a 07.
**Orquestador:** `.cursor/agents/arquitectura-separacion.md`.
**Skill:** `how`.
**Fuente:** documento maestro, secciones 10, 12 y 15.

## Fuentes y alcance

Este documento fija dónde vive cada responsabilidad y qué no le está permitido hacer a cada módulo. No elige microservicios, agentes autónomos, bus de eventos, colas, base vectorial, base de datos, frontend, proveedor de correo, OCR, modelo de IA ni JEV.

La forma concreta se elige cuando exista un requisito medible. Mientras no exista, gana la alternativa más simple que cumpla el requisito.

## Cómo leer este documento

La primera parte es el mapa de una página: responsabilidades, dependencias, fronteras y componentes no adoptados. Los apéndices desarrollan el flujo, las propiedades transversales, la trazabilidad, los requisitos y lo que sigue abierto.

Los nombres de los módulos son responsabilidades conceptuales. No son repositorios, workers, colas, servicios desplegables ni paquetes.

## Mapa de una página

### Las nueve responsabilidades

| Módulo conceptual | Qué posee | Qué no puede hacer |
| --- | --- | --- |
| **Ingestion** | Recibir mensaje, carga o evento; registrar tenant, origen, idempotencia, contenido y versión | Validar la obligación, clasificar como definitivo, aprobar ni decidir |
| **Document Intelligence** | Clasificar, extraer, normalizar y vincular; producir campos candidatos, señales y evidencia | Aplicar autoridad, inventar campos, rellenar ausencias, aprobar ni rechazar |
| **Deterministic Core / Rules** | Cálculos, comparaciones, reglas, límites, duplicado exacto y transiciones permitidas por política | Interpretar prosa ambigua que ninguna regla alcanza, conceder permisos ni ejecutar |
| **Decision** | Armar una decisión o propuesta estructurada con reglas, evidencia, motivo y evidencia faltante | Otorgarse permisos, autorizar, ejecutar ni sustituir la autorización |
| **Authorization** | Verificar actor o proceso, tenant, acción, operación, política, alcance, vigencia y segregación | Interpretar la factura, proponer la decisión, conceder autoridad propia ni ejecutar |
| **Workflow** | Coordinar etapas, esperas, escalamiento, delegación, solicitud de información y reanudación | Aprobar por sí solo, conceder permisos, interpretar la factura ni enviar pagos |
| **Execution** | Frontera futura para preparar o enviar una acción ya autorizada y verificar su resultado | Existir como pago real en el MVP, decidir, autorizar, simular un pago ni declarar éxito sin la fuente de verdad |
| **Spend Intelligence** | Producir recomendaciones con evidencia sobre recurrencia, superposición, licencias y renovaciones | Contratar, cancelar, modificar, aprobar ni ejecutar |
| **Audit & Compliance** | Conservar la reconstrucción de decisiones, actores, versiones, evidencias y resultados | Decidir, conceder autoridad, guardar secretos, retener datos de más ni editar en silencio |

### Dependencias

```text
Ingestion
  -> Document Intelligence
  -> Deterministic Core / Rules
  -> Decision
  -> Workflow
  -> Authorization
  -> Audit & Compliance

Spend Intelligence -> lee evidencia validada y datos de uso; no entra al flujo de aprobación
Execution (futuro)  -> solo consume una autorización registrada; no existe en el MVP
Todos los módulos   -> publican hechos en Audit & Compliance; Audit no depende de ellos
```

Reglas de dirección:

- La salida de un módulo es entrada del siguiente; no es un permiso.
- Ningún módulo escribe el estado autoritativo de otro.
- `Decision` propone; `Authorization` verifica; `Workflow` coordina; `Execution` no existe en el MVP.
- `Workflow` depende de `Authorization`; `Authorization` no llama a `Workflow`. La verificación devuelve un resultado, no un ciclo de propiedad.
- `Spend Intelligence` no tiene ruta hacia `Workflow` ni hacia `Execution`.
- `Audit & Compliance` recibe hechos; no participa en la decisión.
- No se modelan ciclos de dependencia entre módulos.

### Fronteras que no se pueden colapsar

| Frontera | Qué separa | Lo que no se permite |
| --- | --- | --- |
| Interpretación / decisión | Lo que dice el documento frente a lo que corresponde hacer | Un modelo que extrae un importe no decide si se paga |
| Decisión / autorización | La propuesta estructurada frente al permiso de actuar | Una decisión no concede autoridad |
| Autorización / ejecución | Verificar que se puede frente a hacerlo | Una autorización no es una instrucción enviada |
| Ejecución / confirmación | Enviar una instrucción frente a conocer el resultado | Un envío no prueba que el pago ocurrió |
| Workflow / autoridad | Coordinar etapas frente a conceder permisos | El workflow consulta autoridad; no la crea |
| Auditoría / decisión | Conservar la reconstrucción frente a decidir | El registro no altera la decisión |
| Spend Intelligence / aprobación | Recomendar con evidencia frente a autorizar | Una recomendación no aprueba ni ejecuta |

La IA interpreta y señala. No decide, no autoriza, no ejecuta, no delega, no forma parte de un quorum y no reduce severidad por sí sola.

### Componentes no adoptados todavía

No se adoptan sin un requisito medible:

- microservicios;
- bus de eventos;
- colas;
- workflow durable;
- base vectorial;
- múltiples agentes o un agente por módulo;
- repositorios separados;
- base de datos;
- stack de frontend;
- proveedor y protocolo de correo;
- OCR;
- modelo de IA y JEV;
- `Execution` como pago real.

Cada uno tiene un hueco posible, no una justificación actual. Si no se puede medir el requisito que cubriría, no se añade.

## Apéndice A. Flujo conceptual

1. **Ingestion** recibe un mensaje, una carga o un evento. Registra tenant, origen, idempotencia, contenido original y versión. No afirma que el contenido sea válido ni pagable.
2. **Document Intelligence** clasifica, extrae, normaliza y vincula. Devuelve campos candidatos, señales, evidencia y ausencias declaradas. Un modelo puede apoyar la interpretación; no la convierte en decisión.
3. **Deterministic Core / Rules** calcula, compara y aplica reglas, límites, duplicado exacto y transiciones permitidas. Registra la regla y su versión.
4. **Decision** arma una decisión o propuesta estructurada con reglas, evidencia, motivo, severidad y evidencia faltante. No concede permisos.
5. **Workflow** coordina la etapa humana o de proceso. Antes de cada transición consulta a **Authorization** y registra el resultado.
6. **Authorization** verifica actor o proceso, tenant, acción, operación, política, alcance, vigencia y segregación. Deniega por defecto si falta contexto, permiso, evidencia o política.
7. **Workflow** aplica la salida permitida: aprobar, rechazar, pedir información, escalar o bloquear temporalmente. La operación termina en aprobado, rechazado o pendiente; nunca en enviado.
8. **Audit & Compliance** conserva la reconstrucción de cada transición, incluida la evidencia ausente, la versión de política y el resultado de autorización.
9. **Spend Intelligence** lee evidencia validada y datos de uso para recomendar. No participa en la aprobación ni en la ejecución.
10. **Execution** no existe en el MVP. Si se contempla a futuro, solo consume una autorización registrada y verifica el resultado en la fuente de verdad.

## Apéndice B. Propiedades transversales

### Tenant

- Cada módulo recibe contexto de tenant.
- Toda consulta, mutación, caché, documento, recomendación, registro y autorización usa solo datos del tenant actual.
- Un filtro de frontend no cuenta como control de aislamiento.
- No se comparten documentos, resultados, embeddings ni comparaciones entre tenants.
- Los datos de demostración son sintéticos y están marcados. Nunca se usan datos reales de clientes.

### Idempotencia

- La ingesta registra una identidad estable de la entrada antes de interpretar.
- El nombre del archivo no es la identidad del documento.
- Un reenvío, un evento duplicado o una carga repetida no crean una segunda operación, una segunda aprobación ni un segundo efecto.
- Un evento tardío o fuera de orden no revive una operación cerrada.
- La forma concreta de la clave y su algoritmo están abiertos.

### Concurrencia

- Existe una sola decisión vigente por operación y versión de evidencia.
- Los intentos concurrentes se registran; el intento perdedor no se borra.
- Un cambio de factura, contrato, datos bancarios, presupuesto o política obliga a evaluar si la autorización anterior sigue vigente.
- La denegación por conflicto es explícita, no un error silencioso.
- Un lock es el último recurso, no el diseño por defecto. Primero se elimina el estado compartido innecesario; si una única decisión vigente es un invariante real, se serializa de forma estructural.

### Auditoría

- Cada transición deja evidencia reconstruible sin depender de la memoria de un actor.
- Se registran tenant, operación, documento y versión, evidencias consultadas y ausentes, reglas y versión de política, resultado de validación, actor o proceso, decisión, motivo, autoridad usada, situación anterior y resultante, fecha y correlation ID.
- Si intervino IA, se registran modelo, versión, entradas permitidas, salida estructurada y evidencias.
- No se guardan secretos ni datos personales innecesarios.
- Se evalúa un registro append-only o un control equivalente que impida cambios silenciosos. Es un requisito de diseño, no una tecnología elegida.

## Apéndice C. Trazabilidad por tarea

| Tarea | Responsabilidad que justifica |
| --- | --- |
| 01 Dominio | Distinciones entre documento, factura, obligación, aprobación, pago y workflow; separaciones que el modelo exige |
| 02 Ingesta | `Ingestion`; identidad de contenido, versiones, idempotencia y contenido hostil |
| 03 Proveedores | `Document Intelligence` y `Rules` para identidad; `Authorization` para habilitación y cuenta bancaria |
| 04 Validación | `Rules` y `Decision`; evidencia, ausencia de evidencia, duplicados exactos y hallazgos |
| 05 Workflows | `Workflow` y `Authorization`; transiciones, bloqueos, delegación, quorum y evidencia |
| 06 Spend Intelligence | `Spend Intelligence`; recomendaciones con evidencia, sin aprobación ni ejecución |
| 07 Autoridad e IA | L0-L3, prohibiciones del modelo, separación interpretación/decisión/autorización/ejecución y auditoría |
| 10 Seguridad y tenancy | Implementa aislamiento, autorización y auditoría; este documento fija fronteras, no controles concretos |
| 11 Edge cases | Cubre concurrencia, delegación, cambios de política y prompt injection en detalle; aquí solo se nombran |

## Apéndice D. Requisitos funcionales

| ID | Requisito | Evidencia de aceptación |
| --- | --- | --- |
| RF-08.1 | Cada una de las nueve responsabilidades tiene un dueño conceptual único. | No hay dos módulos que reclamen la misma responsabilidad. |
| RF-08.2 | Las dependencias entre módulos son explícitas y sin ciclos. | El mapa y las reglas de dirección no se contradicen. |
| RF-08.3 | Ningún módulo de IA tiene permiso de aprobar, autorizar, ejecutar, delegar ni formar quorum. | La IA aparece solo como interpretación o señal. |
| RF-08.4 | `Decision` no concede permisos. | `Authorization` es un control separado y verificable. |
| RF-08.5 | `Workflow` no envía dinero ni convierte una aprobación en pago. | Las salidas del MVP son aprobado, rechazado o pendiente; nunca enviado. |
| RF-08.6 | `Execution` se representa como frontera futura, no como módulo del MVP. | No hay pago real ni simulación de pago. |
| RF-08.7 | `Audit & Compliance` permite reconstruir cada decisión y transición. | La evidencia incluye actor, política, versión y resultado. |
| RF-08.8 | Toda responsabilidad recibe y propaga contexto de tenant. | Ningún módulo opera sin tenant. |
| RF-08.9 | Idempotencia y concurrencia se asignan a las fronteras correctas. | La ingesta y las acciones repetidas no crean duplicados ni decisiones dobles. |
| RF-08.10 | Cada componente nuevo exige un requisito medible o no se adopta. | La lista de no adoptados tiene su hueco, no una justificación actual. |
| RF-08.11 | Cada módulo se traza a las tareas 01-07 que lo justifican. | La tabla de trazabilidad no inventa responsabilidades. |
| RF-08.12 | `Spend Intelligence` no tiene ruta de aprobación ni de ejecución. | Sus salidas son recomendaciones con evidencia. |
| RF-08.13 | El frontend, la persistencia y el despliegue quedan sin stack elegido. | El documento no nombra framework, base ni proveedor como decisión. |

## Apéndice E. Requisitos no funcionales

| ID | Requisito |
| --- | --- |
| RNF-08.1 | Modular monolith o equivalente como opción inicial, salvo evidencia medida en contrario. |
| RNF-08.2 | Sin microservicios, bus, colas, workflow durable, base vectorial ni agentes autónomos sin requisito medido. |
| RNF-08.3 | Aislamiento multi-tenant en backend y persistencia, no solo en la interfaz. |
| RNF-08.4 | Auditabilidad y trazabilidad reconstruible. |
| RNF-08.5 | Determinismo en cálculos, reglas, políticas y verificación de autorización. |
| RNF-08.6 | Idempotencia en ingesta, eventos, transiciones y acciones futuras. |
| RNF-08.7 | Portabilidad y salida de proveedor. |
| RNF-08.8 | Preferencia por serverless y scale-to-zero, sin asumir que el costo será cero para siempre. |
| RNF-08.9 | Observabilidad con logs estructurados, métricas, correlation IDs y errores accionables. |
| RNF-08.10 | No simular integridad: si una función no existe, no se devuelve un estado que sugiera que ocurrió. |
| RNF-08.11 | Simplicidad: cada componente debe justificar su existencia. |
| RNF-08.12 | Sin números, umbrales, límites ni calibraciones inventadas. |
| RNF-08.13 | Secretos fuera del repositorio y fuera de los logs. |
| RNF-08.14 | Un fallo de un módulo no debe conceder autoridad ni convertir una ausencia de respuesta en éxito. |

## Apéndice F. Decidido, hipótesis y abierto

### Decidido

- Empezar modular. La opción inicial por defecto es un modular monolith o equivalente, salvo evidencia contraria.
- No introducir microservicios, varios agentes, bus de eventos, colas, workflow durable ni base vectorial sin un requisito concreto.
- No usar un agente autónomo para un trabajo que una regla puede hacer.
- Los nombres de los nueve módulos son responsabilidades, no repositorios, workers ni colas decididas.
- La IA interpreta o señala anomalías; no concede autoridad ni aprueba.
- El código determinista calcula, compara y aplica reglas y transiciones.
- `Authorization` comprueba permisos de forma independiente.
- `Workflow` coordina humanos y etapas; no ejecuta dinero.
- `Execution` no mueve dinero en el MVP y no se simula.
- Aislamiento multi-tenant en backend y persistencia.
- Auditoría reconstruible y append-only o equivalente, como requisito de diseño.
- El stack de frontend, la base de datos, el correo, el OCR, el modelo de IA y JEV siguen abiertos.

### Hipótesis

- Un solo deploy con módulos internos cubre la demo y el primer piloto. Es reversible si aparecen límites medidos de aislamiento, escala o tiempo de espera.
- No crear `Execution` hasta que L3 sea alcance real. Hasta entonces, el workflow termina en aprobado, rechazado o pendiente, nunca en enviado.
- Cloudflare-first es una preferencia de despliegue, no una decisión irrevocable de cada componente.
- D1 y PostgreSQL serverless siguen siendo alternativas a comparar; ninguna está elegida.
- La separación de responsabilidades se puede sostener sin separar despliegues.

### Abierto

- Arquitectura concreta.
- Stack de frontend.
- Dónde corre cada responsabilidad dentro de Cloudflare o fuera.
- Base de datos: D1 frente a PostgreSQL serverless.
- Si hace falta cola o workflow durable. Solo si hay una espera, un reintento o un trabajo que no cabe en la petición.
- Proveedor y protocolo de correo.
- OCR y extracción de documentos escaneados.
- Modelo de IA y política de escalamiento entre modelo ligero, modelo capaz y humano.
- Implementación, interfaz, licencia, costo y utilidad real de JEV.
- Esquema de identidad, roles y onboarding de empresas.
- Modelo exacto de aprobaciones, delegación y quorum.
- Catálogo cerrado de estados y transiciones.
- Reglas de riesgo, umbrales y calibración de severidad.
- Integraciones futuras con ERP, CRM, bancos, contabilidad, HRIS o sistemas de uso.
- Modos futuros de L3 y su verificación externa.

## Apéndice G. Fuera de alcance

- Código, árbol de archivos, paquetes, repositorios, APIs, eventos, tablas o enums.
- Diagramas de Kubernetes, mallas de servicios o un agente por módulo.
- Elegir framework de UI, base de datos, proveedor de correo, OCR, modelo de IA o JEV.
- Partir el código en repos.
- Añadir un vector store "por si hay RAG".
- Crear un módulo `Execution` que parezca ejecutar pagos.
- Diseñar el esquema de identidad, roles o permisos.
- Resolver en detalle concurrencia, delegación, cambios de política o prompt injection; pertenecen a las tareas 10 y 11.
- Implementar L3, mover dinero o simular un pago.
- Cerrar puntos de `docs/decisiones/abiertas.md`.

## Apéndice H. Criterios de aceptación

- Las nueve responsabilidades aparecen con dueño, entradas, salidas y prohibiciones.
- Ningún módulo de IA aparece con permiso de aprobar, autorizar, ejecutar, delegar ni formar quorum.
- `Execution` no figura como transferencia del MVP ni como simulación de pago.
- El mapa no propone microservicios desplegables, bus, colas ni base vectorial como componentes.
- Cada componente no adoptado tiene el hueco que vendría a cubrir.
- El frontend, la base de datos, el correo, el OCR, el modelo de IA y JEV quedan sin elegir.
- Las dependencias son explícitas y sin ciclos.
- `Decision`, `Authorization`, `Workflow`, `Execution` y `Audit & Compliance` no se colapsan.
- Multi-tenancy, idempotencia, concurrencia y auditoría aparecen como responsabilidades, no como tecnologías elegidas.
- Cada módulo se traza a las tareas 01-07.
- Los puntos abiertos quedan abiertos.
- `bash scripts/ci.sh` pasa.
- El documento no es un esquema, ni una API, ni un enum.
