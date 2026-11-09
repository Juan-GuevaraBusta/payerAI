# Autoridad, autonomía e IA

Especificación conceptual de la tarea 07. Define qué puede proponer un modelo, qué decide una regla determinista, de dónde sale la autoridad y qué le está prohibido a cualquier modelo. No es un esquema, ni una API, ni un enum, ni una elección de proveedor.

## Fuentes y alcance

- [Documento maestro](../documento-maestro.md), secciones 9, 11 y 13.
- [Decisiones adoptadas](../decisiones/adoptadas.md) y [asuntos abiertos](../decisiones/abiertas.md).
- [Glosario](../glosario.md).
- [Tarea 07](../tareas/07-autoridad-autonomia-e-ia.md).
- [Modelo de dominio](01-dominio.md), [proveedores](03-proveedores.md) y [validación](04-validacion.md).
- [Informe de validación de specs](../orchestrator/reports/06-validacion-specs.md).

**Depende de:** el modelo de dominio, la validación y la distinción entre reconocer un proveedor y autorizarlo a cobrar. No depende de la tarea 06 ni de su rama. La autoridad se define antes que el workflow de la tarea 05; ese workflow consumirá este documento.

**Alcance:** autoridad, autonomía, uso de IA, evaluación de JEV y trazabilidad en Accounts Payable. El MVP administra el ciclo y registra estados. No custodia fondos ni mueve dinero.

Contexto: [master prompt](../../MASTER_PROMPT_FINANCIAL_OPERATIONS.md). Este documento desarrolla un aspecto concreto, no improvisa producto y no cierra ningún punto de [asuntos abiertos](../decisiones/abiertas.md).

## Cómo leer este documento

Hay cuatro registros y no se mezclan:

- **Decidido.** Ya acordado en el documento maestro, las decisiones adoptadas, el glosario o la tarea 07. Es una restricción.
- **Hipótesis.** Supuesto reversible que aún requiere validación. No es requisito.
- **Recomendación.** Criterio de trabajo. No es una decisión de stack ni de alcance.
- **Abierto.** Falta una decisión. No se presenta como regla, no se implementa y no se usa para cerrar otra discusión.

Los ejemplos son sintéticos y están marcados. No se usan datos reales de clientes.

## 1. Autoridad

### 1.1 Qué es

**Autoridad** es la permisión de realizar una acción concreta, sobre una operación concreta, en un tenant concreto, bajo una política concreta y en un momento concreto. La ejerce un actor humano o un proceso autorizado.

La autoridad no es una propiedad general de una persona, de un sistema ni de un modelo. Se verifica por acción. Un actor puede tener autoridad para pedir información y no para aprobar. Un proceso puede tener autoridad para registrar una transición y no para ejecutar un pago.

### 1.2 De dónde sale

La autoridad sale de fuentes verificables y separadas:

- **Política de la empresa.** Reglas, límites y condiciones configuradas, con versión identificable.
- **Permisos verificados.** El actor o proceso tiene el permiso necesario para esa acción, en ese tenant, en ese momento. El esquema de roles está abierto; la necesidad de verificarlo no.
- **Segregación de funciones.** Maker-checker, quorum o múltiples aprobadores cuando la política lo exija.
- **Controles técnicos independientes.** Un componente de autorización comprueba la acción antes de que ocurra. No lo decide el componente que interpreta el documento ni el que propone una decisión.
- **Delegación con alcance y vigencia.** Una delegación vencida, revocada o fuera de alcance no concede autoridad.
- **Override humano.** Excepción con actor, motivo, fecha y evidencia. No es un atajo del modelo ni una autorización implícita.

### 1.3 Qué no es autoridad

- La autenticación. Responde quién es, no qué puede hacer.
- La coincidencia de nombre de un proveedor.
- El reconocimiento de un proveedor. Identificar no habilita para cobrar.
- La salida de un modelo, su puntaje, su confianza o su explicación.
- Una aprobación anterior reutilizada fuera de su alcance, de su vigencia o después de un cambio material.
- La ausencia de una objeción. El silencio no aprueba.
- La existencia de una integración técnica. Tener una conexión no concede permiso para usarla.

### 1.4 Cómo se verifica

La verificación es por acción y por tenant:

1. Se identifica al actor o proceso y su contexto de tenant.
2. Se identifica la acción solicitada y la operación afectada.
3. Se carga la versión de política aplicable.
4. Se comprueba el permiso, el alcance, la vigencia y la segregación requerida.
5. Se registra el resultado: permitido, denegado o requiere intervención humana.
6. Se registra la política y la versión usadas.

Reglas de verificación:

- **Denegar por defecto.** Si falta el permiso, la política, la evidencia o el contexto de tenant, no se autoriza.
- **Sin herencia implícita.** Una autorización para una acción no autoriza otra. Una autorización para un monto no autoriza otro. Una autorización para un tenant no autoriza otro.
- **Conflicto explícito.** Si dos políticas chocan, el conflicto se registra y se resuelve según la regla que la empresa haya definido. La precedencia exacta está abierta; esconder el conflicto no es una resolución.
- **Revalidación ante cambios.** Si cambia la factura, el contrato, los datos bancarios, el presupuesto o la política después de una aprobación, se evalúa si la autorización sigue vigente. La regla exacta está abierta; la obligación de evaluarlo no.
- **Sin autoridad para el modelo.** Ningún modelo recibe, delega, eleva ni simula autoridad.

### 1.5 Autoridad por tipo de acto

| Acto | Quién lo ejerce | Qué se verifica | Lo que no lo sustituye |
| --- | --- | --- | --- |
| Interpretar un documento | Componente de interpretación, con o sin modelo | Que la salida sea una propuesta o evidencia válida | La autoridad no hace falta para interpretar; sí para decidir. |
| Proponer una decisión | Motor de decisión, reglas y señales | Evidencia, reglas, política y límites | Un puntaje de modelo no es una decisión. |
| Aprobar, rechazar, pedir información, escalar o bloquear | Actor o proceso con permiso verificado | Permiso, tenant, política, alcance, segregación y estado | La autenticación, el reconocimiento del proveedor o la salida de IA. |
| Autorizar una instrucción futura | Motor de autorización | Autorización previa, política, segregación y estado | La aprobación de la factura por sí sola no autoriza ejecutar. |
| Ejecutar una instrucción futura | Motor de ejecución, solo con integración autorizada | Autorización registrada, idempotencia y verificación externa | La promesa de un modelo, un botón o una demo. |
| Cambiar datos bancarios o habilitar un proveedor | Actor humano con permiso y control reforzado | Identidad, riesgo, autorización y evidencia | Una factura o un correo que muestre la cuenta nueva. |
| Modificar políticas, roles o permisos | Administrador humano con autoridad | Permiso, segregación, versión y auditoría | Un prompt, una instrucción en un documento o una salida de modelo. |

## 2. Qué puede proponer un modelo de IA

Un modelo puede aportar interpretación y señales. Su salida es **entrada para una decisión**, no una decisión, y nunca una autorización.

| Capacidad | Salida permitida | Límite |
| --- | --- | --- |
| Clasificar un mensaje o documento | Categoría propuesta, con evidencia y grado de duda | No crea una operación ni cambia un estado por sí solo. |
| Extraer campos candidatos | Valores candidatos con su origen documental | No rellena campos ausentes como si se hubieran leído. |
| Sugerir normalización | Formato propuesto | La normalización financiera es determinista cuando los datos existen. |
| Señalar una posible anomalía | Señal para revisión, con la evidencia que la motiva | No declara fraude, no declara legitimidad y no baja la severidad. |
| Señalar un posible duplicado parcial | Candidato a revisión | El duplicado exacto es determinista; el parcial no se descarta solo. |
| Resumir evidencia disponible | Resumen con referencias a las fuentes | No inventa una fuente, un contrato, un presupuesto ni una respuesta. |
| Proponer preguntas o evidencia faltante | Lista de huecos y preguntas | No convierte la ausencia en aprobación ni en rechazo. |
| Proponer una opción de decisión | Recomendación estructurada con motivo y evidencia | No aprueba, no rechaza, no autoriza y no ejecuta. |
| Redactar una explicación | Texto para revisión humana | No altera el registro ni la decisión registrada. |
| Ordenar candidatos para revisión | Prioridad propuesta | No cierra la revisión ni reduce la severidad. |

Condiciones de toda salida de modelo:

- Se valida contra un contrato estructurado antes de usarse.
- Registra modelo, versión, entradas permitidas, salida, evidencias y política aplicada.
- No contiene comandos, tool calls ni instrucciones que el sistema ejecute.
- No escribe directamente en el estado autoritativo de la operación.
- No se usa como regla dura, identidad, autorización ni verificación de pago.
- Si no se puede validar, no se usa. Se registra el fallo y se sigue por la vía determinista o humana.

## 3. Qué decide una regla determinista

El código determinista es el que calcula, compara y aplica reglas. Es la primera opción y no se sustituye por un modelo.

Decide o resuelve, según la política configurada:

- Cálculos de importes, diferencias, monedas y fechas cuando los datos existen.
- Comparaciones contra historial, contrato, presupuesto y límites configurados.
- Detección de duplicado exacto con las señales definidas.
- Aplicación de reglas, políticas y límites de la empresa.
- Transiciones de estado permitidas por la política.
- Verificación de autorización: permiso, tenant, alcance, vigencia y segregación.
- Idempotencia y control de concurrencia.
- Disparadores de escalamiento definidos por política.
- Asignación o ajuste de severidad según reglas configuradas, cuando existan.

Lo que una regla determinista no hace:

- No interpreta prosa ambigua que ninguna regla alcanza.
- No inventa un contrato, un presupuesto ni una respuesta.
- No concede autoridad por sí sola; la verifica contra una fuente.
- No declara un pago confirmado sin la fuente de verdad externa.

La regla y su versión deben quedar registradas. Con la misma entrada, la misma política y la misma versión, el resultado determinista debe ser reproducible.

## 4. Separación de interpretación, decisión, autorización y ejecución

| Capa | Pregunta que responde | Quién la ejerce | Entrada | Salida | No puede |
| --- | --- | --- | --- | --- | --- |
| Interpretación | ¿Qué dice el documento o el mensaje? | Reglas de extracción, normalización y, si hace falta, un modelo | Documento, mensaje, contexto permitido | Campos, categoría, señales y evidencia | Decidir, autorizar, ejecutar ni rellenar huecos como si existieran |
| Decisión | ¿Qué corresponde según reglas, evidencia y política? | Motor determinista y motor de decisión | Interpretación validada, evidencia, reglas y política | Decisión estructurada o propuesta de decisión | Concederse permisos, ejecutar ni sustituir la autorización |
| Autorización | ¿Este actor o proceso puede hacer esta acción, aquí y ahora? | Motor de autorización independiente | Actor, tenant, acción, operación, política y estado | Permitido, denegado o requiere humano | Interpretar el documento, proponer la decisión ni ejecutar |
| Ejecución | ¿Qué acción externa ya autorizada se realiza y cómo se verifica? | Motor de ejecución, solo en la evolución con integración autorizada | Autorización previa registrada, instrucción, idempotencia | Instrucción preparada o enviada, y verificación posterior | Decidir, autorizar ni declarar éxito sin la fuente de verdad |

Separaciones que no se pueden colapsar:

- **Interpretación no es decisión.** Un modelo que extrae un importe no decide si se paga.
- **Decisión no es autorización.** Una decisión estructurada no concede permiso.
- **Autorización no es ejecución.** Verificar que se puede no es hacerlo.
- **Ejecución no es confirmación.** Enviar una instrucción no prueba que el pago ocurra.
- **Una capa no hereda autoridad de otra.** La salida de una es entrada de la siguiente, no un permiso.

El workflow coordina humanos y etapas. No ejecuta dinero y no concede autoridad propia. La auditoría conserva la reconstrucción; no decide.

## 5. Niveles L0–L3

Los niveles describen qué puede hacer el sistema y quién responde por cada acción. No son un permiso del modelo ni una escala que el modelo pueda subir.

| Nivel | Significado | Qué permite | Quién tiene la autoridad | En el MVP | Qué prohíbe |
| --- | --- | --- | --- | --- | --- |
| **L0 Observar** | Capturar, extraer, clasificar y registrar | Registrar un mensaje o documento, proponer campos, clasificar, señalar anomalías y conservar evidencia | Nadie decide aquí; la autoridad no se ejerce para actuar | Sí | Decidir, aprobar, rechazar, ejecutar o alterar el estado autoritativo |
| **L1 Decidir** | Evaluar reglas, evidencia, riesgo y política; proponer una decisión | Producir una decisión estructurada o una propuesta con motivo y evidencia | La propuesta no tiene autoridad; la decisión final la toma el actor o proceso autorizado | Sí | Aprobar por sí solo, autorizar, ejecutar o concederse permisos |
| **L2 Actuar** | Aprobar, rechazar, pedir información, escalar o bloquear temporalmente dentro de la autoridad configurada | Transiciones de workflow dentro de la política, con permiso verificado | El actor o proceso autorizado, tras la verificación del motor de autorización | Sí, dentro de la política y sin mover dinero | Ejecutar un pago real, saltarse la segregación o actuar fuera del tenant |
| **L3 Ejecutar** | Preparar o enviar instrucciones y verificar su resultado cuando exista integración autorizada | Dejar la operación lista para un banco o enviar una instrucción por una integración autorizada | Motor de ejecución, solo con autorización previa registrada | No | Existir como transferencia real, simular un pago o declarar una confirmación sin la fuente de verdad |

### 5.1 L2 no es ejecutar dinero

L2 es una decisión de workflow: aprobar, rechazar, pedir información, escalar o bloquear temporalmente. Esas acciones cambian el estado de la operación dentro de la autoridad configurada. No mueven dinero. Una factura aprobada no es un pago. Una instrucción preparada no es una instrucción enviada. Una instrucción enviada no es un pago confirmado.

### 5.2 L3 es evolución, no comportamiento del MVP

L3 contempla dos modos futuros y configurables:

1. **Dejar la operación lista para un sistema bancario.** El sistema registra la aprobación y prepara lo necesario, sin enviar una orden de pago.
2. **Enviar una instrucción de pago por una integración autorizada.** El sistema entrega una instrucción a un sistema externo y verifica su resultado en la fuente de verdad.

Ninguno de los dos se implementa en el MVP. No se simula que ocurrieron. El MVP no declara un pago exitoso porque se envió una solicitud, no inventa una confirmación y no usa un timeout como prueba de fallo. Antes de reintentar una acción externa, hay que verificar el estado en la fuente de verdad.

L3 no es un nivel al que un modelo pueda llegar. Es una capacidad del sistema, separada de la interpretación y sujeta a autorización previa y control independiente.

## 6. Matriz de autonomía por tipo de acción

La matriz es conceptual. No fija umbrales, importes, roles concretos ni nombres de estados. Cada celda indica el nivel máximo en el que la acción puede existir, no una autorización automática.

| Tipo de acción | L0 Observar | L1 Decidir | L2 Actuar | L3 Ejecutar | Límite del MVP |
| --- | --- | --- | --- | --- | --- |
| Capturar mensaje o documento | Sí, con tenant e idempotencia | No aplica | No aplica | No aplica | Solo registro; no crea obligación |
| Clasificar mensaje o documento | Propuesta de categoría | No aplica | No aplica | No aplica | La clasificación no autoriza nada |
| Extraer campos | Candidatos con origen | No aplica | No aplica | No aplica | No rellena ausencias |
| Normalizar campos | Determinista si hay datos | No aplica | No aplica | No aplica | Un modelo no inventa el dato |
| Detectar duplicado exacto | Evidencia determinista | Puede alimentar la decisión | No aplica | No aplica | No se descarta un duplicado exacto sin regla |
| Detectar duplicado probable o anomalía | Señal para revisión | Hallazgo | Escalar o bloquear solo con autoridad | No aplica | No es fraude ni legitimidad |
| Comparar contrato, importe o límite | Evidencia determinista | Resultado de la comparación | No aplica | No aplica | La ausencia de contrato no aprueba ni rechaza |
| Aplicar política o límite | No aplica | Regla determinista | Verificación de autoridad | No aplica | No se inventa un límite |
| Evaluar severidad | Señal o evidencia | Regla configurada o humano | Acción según severidad y autoridad | No aplica | Sin calibración; el modelo no baja la severidad |
| Proponer decisión | No aplica | Propuesta estructurada | No aplica | No aplica | La propuesta no tiene autoridad |
| Aprobar | No aplica | No aplica | Actor o proceso autorizado | No aplica | Nunca solo por salida de modelo |
| Rechazar | No aplica | No aplica | Actor o proceso autorizado | No aplica | Nunca solo por salida de modelo |
| Pedir información | No aplica | Puede proponer la pregunta | Workflow con autoridad | No aplica | El silencio no es respuesta |
| Escalar | No aplica | Puede recomendar | Workflow con autoridad | No aplica | El escalamiento no concede aprobación |
| Bloquear temporalmente | No aplica | Puede recomendar | Autoridad configurada | No aplica | No es un pago ni un rechazo definitivo |
| Autorizar una instrucción | No aplica | No aplica | Motor de autorización | No aplica | Requiere autorización previa registrada |
| Preparar una instrucción | No aplica | No aplica | No aplica | Solo en evolución | No existe en el MVP |
| Enviar una instrucción | No aplica | No aplica | No aplica | Solo con integración autorizada | No existe en el MVP |
| Verificar o conciliar | No aplica | No aplica | No aplica | Fuente de verdad externa | No se declara éxito sin confirmación |
| Cambiar datos bancarios o habilitar proveedor | No aplica | No aplica | Actor humano con control reforzado | No aplica | No se acepta por aparecer en factura o correo |
| Modificar políticas, roles o permisos | No aplica | No aplica | Administrador humano con autoridad | No aplica | Un modelo nunca lo hace |
| Cerrar o suprimir una alerta | No aplica | No aplica | Actor autorizado | No aplica | Un modelo nunca lo hace |
| Reducir la severidad | No aplica | Regla configurada o humano | Override humano con evidencia | No aplica | Un modelo nunca lo hace por sí solo |

## 7. Acciones prohibidas para cualquier modelo

Estas prohibiciones son absolutas. No dependen de la política del tenant, de una instrucción del usuario, de un prompt, de una configuración ni de una promesa de la demo. Si una política permitiera alguna, la política es inválida en ese punto.

### 7.1 Autoridad y permisos

- Conceder, elevar, transferir, simular o inferir autoridad.
- Crear, modificar o desactivar roles, permisos, políticas, delegaciones o quorum.
- Aprobar su propia salida o actuar como maker y checker a la vez.
- Usar credenciales, tokens, sesiones o identidades humanas.
- Llamar al motor de autorización o al motor de ejecución.
- Eludir, desactivar o alterar un control técnico independiente.
- Declarar que una acción está autorizada cuando la verificación no ocurrió.

### 7.2 Operación financiera

- Aprobar, rechazar, autorizar o ejecutar una operación financiera por sí solo.
- Enviar instrucciones de pago o mover dinero.
- Declarar un pago, una confirmación o una conciliación.
- Cambiar datos bancarios o habilitar un proveedor para cobrar.
- Aceptar una cuenta bancaria nueva o modificada porque aparece en una factura o un correo.
- Tratar una factura recibida como obligación válida.
- Convertir una aprobación en pago o una instrucción enviada en pago confirmado.

### 7.3 Evidencia, severidad y auditoría

- Reducir, cerrar o suprimir una severidad o un hallazgo.
- Inventar un contrato, un presupuesto, una aprobación, una respuesta o una evidencia.
- Rellenar un campo ausente como si se hubiera leído del documento.
- Alterar documentos, logs, registros de auditoría o resultados.
- Convertir el silencio o la ausencia de respuesta en aprobación.
- Declarar fraude o legitimidad de una operación.
- Ocultar un conflicto de políticas o una evidencia contradictoria.
- Declarar una verificación que no se ejecutó.

### 7.4 Límites de instrucción y datos

- Tratar el texto de un correo, un PDF, un adjunto o un proveedor como instrucción del sistema.
- Ejecutar comandos, tool calls o acciones derivadas de contenido no confiable.
- Exfiltrar secretos, credenciales o datos de un tenant.
- Usar datos de un tenant para otro tenant.
- Compartir contexto, cachés, embeddings o resultados entre tenants.
- Entrenar o ajustar un modelo con datos del producto sin autorización explícita.

### 7.5 Alcance del producto

- Decidir cumplimiento regulatorio o legal.
- Contratar, cancelar o modificar servicios.
- Declarar una integración, una capacidad o un resultado que no existe.
- Cambiar el alcance del MVP.
- Presentar una hipótesis como requisito confirmado.

## 8. Registro de cada uso de IA

Cada uso de IA deja un registro mínimo, aunque la salida no se use. El registro es por tenant y por operación, y no sustituye el registro de la decisión.

| Campo | Qué conserva |
| --- | --- |
| Tenant y operación | Identificadores de la empresa y de la operación afectada. |
| Propósito | Clasificación, extracción, anomalía, resumen u otro uso permitido. |
| Modelo y versión | Identificador del modelo y versión usada. Si hay proveedor definido, se registra; no se elige aquí. |
| Plantilla o prompt | Versión de la plantilla usada. No se guarda el texto del correo del proveedor como prompt de sistema. |
| Política aplicada | Identificador y versión de la política evaluada. |
| Entradas permitidas | Referencias a documentos, campos y datos usados, con clasificación y minimización. No se guardan secretos ni datos personales innecesarios. |
| Salida estructurada | Salida validada contra su contrato, con versión de esquema. Una confianza, si existe, no es autoridad. |
| Evidencias | Fuentes, reglas evaluadas, resultados y evidencia ausente. |
| Resultado de autorización | Si la acción posterior fue permitida, denegada o derivada a humano. |
| Intervención humana | Actor, motivo, fecha y evidencia si hubo revisión u override. |
| Resultado | Qué se decidió, quién lo decidió y si la IA influyó. |
| Fechas y errores | Momento, latencia si se mide, fallos, reintentos y degradación a reglas o humano. |
| Costo | Solo si se midió. No se inventan precios ni tarifas. |

Condiciones del registro:

- Es append-only o equivalente; no se edita en silencio.
- Permite reconstruir la decisión y distinguir interpretación, decisión, autorización y ejecución.
- Conserva la versión de política, modelo, plantilla y esquema.
- No mezcla tenants.
- No guarda secretos ni datos personales innecesarios.
- Registra también el uso que falló o cuya salida se descartó.

## 9. JEV: evaluación, no adopción

JEV es una opción a evaluar, no una dependencia aprobada. No se afirma qué es, qué interfaz tiene, qué métodos expone, qué licencia usa, qué límites tiene ni cuánto cuesta. Esos datos no están verificados.

Antes de asignarle cualquier papel, se comprueba:

1. **Qué es JEV en este contexto.** Confirmar implementación, repositorio, documentación y versión reales. Si hay ambigüedad de nombre, se escribe.
2. **Interfaz disponible.** Solo se acepta una API o interfaz documentada en una fuente primaria. Si no hay fuente, se registra como no verificable.
3. **Licencia y términos.** Verificar licencia, obligaciones y restricciones de uso.
4. **Costo y límites.** Verificar modelo de costo, cuotas y límites reales. No se asume que sea gratuito.
5. **Datos y tenancy.** Verificar dónde se procesan los datos, retención, entrenamiento, aislamiento y tratamiento de datos sensibles.
6. **Determinismo y reproducibilidad.** Verificar si la salida es estable, versionada y evaluable.
7. **Calidad.** Comparar contra una línea base determinista y, si aplica, contra un modelo ligero, con casos sintéticos y marcados.
8. **Latencia y operación.** Medir latencia, errores y comportamiento ante fallos, si se puede.
9. **Seguridad.** Revisar resistencia a prompt injection, manejo de secretos y aislamiento entre tenants.
10. **Portabilidad y salida.** Verificar esfuerzo de integración, dependencia y posibilidad de reemplazo.

Criterio de uso: JEV solo se usa si aporta una ventaja medida en una tarea concreta, cumple los requisitos de seguridad, tenancy y costo, y no sustituye reglas duras, identidad, autoridad ni verificación de pago. Si no se puede verificar, no se usa. Su papel en la matriz queda vacío hasta que pase la evaluación.

JEV no puede conceder autoridad, reducir severidad, aprobar una operación ni declarar un pago. Tampoco es obligatorio: la ausencia de JEV no bloquea el MVP.

## 10. Severidad conceptual y acciones permitidas

La severidad es una escala conceptual: informativa, baja, media, alta y crítica. No está calibrada. No se asignan importes, umbrales numéricos ni plazos en este documento.

La severidad es una entrada para la decisión, no una decisión. Puede ser asignada o elevada por una regla determinista o por un humano. Un modelo puede señalar una posible anomalía, pero no reduce la severidad por sí solo ni la convierte en una decisión.

| Severidad | Envolvente de acciones permitidas | Quién puede actuar | Prohibido |
| --- | --- | --- | --- |
| Informativa | Registrar y, si la política lo permite, corregir un dato no crítico | Regla determinista o actor autorizado | Aprobar o ejecutar por IA |
| Baja | Pedir una aclaración o documentación faltante | Workflow con autoridad | Bloquear sin política o inventar la respuesta |
| Media | Pedir confirmación interna o escalar | Workflow y actor autorizado | Declarar fraude, legitimidad o aprobación automática |
| Alta | Bloquear temporalmente y derivar a revisión humana | Autoridad configurada y humano | Aprobar automáticamente o cerrar la alerta |
| Crítica | Suspender y derivar a revisión especializada | Humano con autoridad y control reforzado | Cualquier aprobación o ejecución automática |

Reglas de relación:

- Una severidad mayor no reduce la autoridad requerida; la aumenta o la mantiene.
- Una severidad crítica nunca se aprueba automáticamente.
- La severidad no concede autoridad por sí sola.
- Un modelo no puede bajar ni cerrar una severidad.
- Un override humano lleva actor, motivo, fecha y evidencia.
- La calibración exacta y los umbrales quedan abiertos.

## 11. Escalamiento humano, override y segregación

Se escala a un humano, como mínimo, cuando:

- la severidad es alta o crítica según la política;
- falta evidencia, contrato, presupuesto o respuesta;
- hay un conflicto de políticas o una política ausente;
- el actor no tiene autoridad, su delegación venció o fue revocada;
- la segregación de funciones exige otro aprobador;
- hay datos bancarios nuevos o modificados;
- la identidad del proveedor es ambigua;
- la salida del modelo es contradictoria o no se puede validar;
- el modelo propone una acción prohibida;
- hay una señal de cruce entre tenants;
- se solicita L3 en el MVP.

El escalamiento no es una aprobación. La respuesta humana debe registrar actor, motivo, fecha y evidencia. El silencio no es aprobación. Una delegación vencida o revocada no sirve. El override humano no es un atajo del modelo.

La segregación de funciones se aplica cuando la política lo exige: quien prepara no es quien aprueba, y quien aprueba no es quien ejecuta. El quorum, la delegación y los plazos exactos están abiertos.

## 12. Auditoría y trazabilidad

Cada decisión debe poder reconstruirse. Según aplique, se registra:

- tenant y operación;
- documento y versión;
- evidencias y fuentes consultadas, incluidas las ausentes;
- reglas y versión de política evaluadas;
- resultado de las validaciones;
- modelo o componente y versión, cuando se use IA;
- entradas permitidas, salida estructurada y evidencias del uso de IA;
- actor humano o proceso que ejecutó la acción;
- decisión, motivo, autoridad y resultado;
- fechas, cambios de estado, errores y reintentos;
- si hubo override humano y su evidencia.

La auditoría debe distinguir:

- interpretación de decisión;
- decisión de autorización;
- autorización de ejecución;
- ejecución de confirmación;
- confirmación de conciliación.

Se evalúa un registro append-only o un control equivalente que impida modificaciones silenciosas. No se guardan secretos ni datos personales innecesarios. Un timeout no es un pago fallido y una instrucción enviada no es un pago confirmado.

## 13. Multi-tenant y datos

Todo uso de IA pertenece a un tenant.

- Cada solicitud lleva contexto de tenant y se verifica antes de procesar.
- No se comparten documentos, contexto, cachés, embeddings, ejemplos ni resultados entre tenants.
- No se usan datos de un tenant para mejorar o entrenar un modelo sin autorización explícita.
- Se aplica minimización de datos: solo lo necesario para la tarea.
- Si hay una señal de cruce entre tenants, se detiene y se escala.
- La denegación no revela si el recurso de otro tenant existe.
- El tratamiento de datos por un proveedor de inferencia externo está abierto. No se elige proveedor aquí.

## 14. Relación con otras tareas

| Tarea | Relación |
| --- | --- |
| 05 Workflows | Consume este documento para las transiciones de L2. Quorum, delegación y plazos siguen abiertos. |
| 06 Spend Intelligence | No es dependencia de este documento. No se mezcla. |
| 08 Arquitectura | Usa la separación de responsabilidades. Ningún módulo de IA aparece con permiso de aprobar. Ejecución sigue fuera del MVP. |
| 09 Infraestructura y costo | Define la infraestructura y el costo real. Este documento no elige proveedor ni precio. |
| 10 Seguridad, tenancy y auditoría | Implementa aislamiento, autorización y audit log. Este documento fija el requisito conceptual. |
| 11 Edge cases y pruebas | Es la dueña del detalle de prompt injection y de los casos de abuso. Este documento solo fija el límite. |

Nota de dependencia: la cabecera de la tarea 07 conserva una referencia a workflows que el orden acordado y el informe de validación declaran obsoleta. Este documento no depende de la tarea 05; la autoridad se define antes.

## 15. Decisiones, hipótesis y abiertos

### Decidido

- Ningún modelo de IA concede autoridad, eleva sus permisos ni autoriza por sí solo una operación financiera.
- La autoridad sale de políticas, permisos verificables, segregación de funciones y controles técnicos independientes.
- Un puntaje de modelo no sustituye reglas duras, identidad, autoridad ni verificación de pago.
- Un modelo no reduce por sí solo la severidad de una alerta.
- L3 no mueve dinero en el MVP.
- Los dos modos futuros de L3 son dejar la operación lista para un banco o enviar una instrucción por una integración autorizada. Ninguno se implementa aquí.
- La interpretación, la decisión, la autorización y la ejecución están separadas.
- Cada uso de IA registra modelo, versión, entradas permitidas, salida estructurada, evidencias y política aplicada.
- JEV no está aprobado.
- Prompt injection se remite a la tarea 11.

### Hipótesis

- “Autonomía avanzada” significa autonomía organizacional configurable, no discreción del modelo.
- En L2, la decisión la ejecuta el workflow con autorización verificable; la IA puede proponer y explicar, pero no autorizar.
- La cabecera de la tarea 07 que menciona workflows está obsoleta; el orden 07 → 05 se mantiene.
- Los ejemplos del documento son sintéticos y marcados.
- JEV seguirá como opción a evaluar, sin rol asignado en la matriz hasta que se verifique.
- El documento usa “actor con permiso verificado” y no define el esquema de roles.

### Abierto

- Qué modelo, si alguno, y la política de escalamiento entre modelo ligero, modelo capaz y humano.
- Qué es JEV, qué interfaz tiene, qué licencia, qué costo y si aporta.
- Umbrales de riesgo y calibración de severidad.
- Qué combinación de atributos sube o baja el nivel de autonomía.
- Esquema de identidad, roles, onboarding, delegación y quorum.
- Precedencia exacta entre políticas en conflicto.
- Plazos de escalamiento y caducidad de solicitudes.
- Retención, borrado y jurisdicción.
- Si los dos modos de L3 se implementan y con qué integración.
- Catálogo cerrado de estados y transiciones.
- Grado de asistencia de un modelo en clasificación y extracción.

### No se puede cerrar en esta tarea

- Ningún punto de [asuntos abiertos](../decisiones/abiertas.md) sin una decisión explícita.
- La elección de modelo, proveedor de inferencia, JEV, base de datos, frontend o cualquier otro vendor.
- Precios, licencias, APIs, métodos o capacidades de JEV.
- Umbrales, importes o plazos de severidad y riesgo.
- El esquema de roles y permisos.
- El detalle de workflow, quorum y delegación.
- La implementación de multi-tenancy y auditoría.
- La arquitectura concreta.
- El detalle de prompt injection.
- La ejecución real de L3.

## 16. Criterios de aceptación

- Ninguna acción de aprobar tiene como único fundamento la salida de un modelo.
- L3 aparece como evolución, no como comportamiento del MVP.
- La matriz no elige modelo, proveedor, JEV ni afirma precios.
- Prompt injection queda remitido a la tarea 11.
- Existe un registro mínimo obligatorio para cada uso de IA.
- La matriz cubre L0–L3 y los tipos de acción relevantes.
- La lista de acciones prohibidas es absoluta y no admite excepción por política.
- Se distingue interpretación, decisión, autorización y ejecución.
- JEV queda como evaluación con checklist verificable, sin API ni licencia inventadas.
- La severidad se relaciona con acciones sin importes, umbrales ni calibración.
- Las preguntas abiertas quedan explícitas y no se cierran por conveniencia.
- Los ejemplos son sintéticos y están marcados.
