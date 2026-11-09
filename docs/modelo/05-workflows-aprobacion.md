# Workflows de aprobación

Especificación conceptual de la tarea 05. Define el ciclo configurable de aprobar, rechazar, pedir información, escalar y bloquear temporalmente, con autoridad verificable, concurrencia controlada y trazabilidad. No es un esquema, ni una API, ni un enum, ni una elección de motor de workflows.

## Fuentes y alcance

- [Documento maestro](../documento-maestro.md), secciones 5.2, 9 y 13.
- [Decisiones adoptadas](../decisiones/adoptadas.md) y [asuntos abiertos](../decisiones/abiertas.md).
- [Glosario](../glosario.md).
- [Tarea 05](../tareas/05-workflows-de-aprobacion.md).
- [Modelo de dominio](01-dominio.md), [validación](04-validacion.md) y [autoridad, autonomía e IA](07-autoridad-ia.md).

**Depende de:** la validación, que aporta evidencia, y la autoridad, que define qué puede hacer cada actor. La autoridad se definió antes que este workflow.

**Alcance:** el ciclo de coordinación de decisiones del módulo A. El workflow no interpreta documentos, no concede autoridad, no ejecuta dinero y no confirma pagos.

Contexto: [master prompt](../../MASTER_PROMPT_FINANCIAL_OPERATIONS.md). Este documento desarrolla un aspecto concreto, no improvisa producto y no cierra ningún punto de [asuntos abiertos](../decisiones/abiertas.md).

## Cómo leer este documento

- **Decidido.** Ya acordado en el documento maestro, las decisiones adoptadas, el glosario o la tarea 05. Es una restricción.
- **Hipótesis.** Supuesto reversible que aún requiere validación. No es requisito.
- **Recomendación.** Criterio de trabajo. No es una decisión de stack ni de alcance.
- **Abierto.** Falta una decisión. No se presenta como regla, no se implementa y no se usa para cerrar otra discusión.

Los ejemplos son sintéticos y están marcados. No se usan datos reales de clientes.

## 1. Principios

- El workflow coordina humanos y etapas. No decide por sí solo, no interpreta la factura y no ejecuta pagos.
- La autoridad sale de políticas, permisos verificables, segregación de funciones y controles técnicos independientes. El workflow la consulta; no la concede.
- Aprobar no es pagar. Una aprobación no produce un estado de pago confirmado.
- Una instrucción enviada no es un pago hecho. Un timeout no es un pago fallido.
- El silencio no es aprobación. Una solicitud de información sin respuesta no se convierte en conformidad.
- Cada transición deja evidencia reconstruible.
- El workflow es configurable por empresa. No se fija un organigrama único ni un flujo de cuatro ojos para todos los tenants.
- Un modelo de IA puede proponer, redactar o señalar. No aprueba, no rechaza, no autoriza, no delega y no forma parte de un quorum.
- No se elige motor de workflows, proveedor, base de datos ni frontend. La forma concreta se decide cuando haya requisitos medibles.
- Antes de serializar un estado compartido, se comprueba si el estado compartido hace falta. Un lock no sustituye un diseño de propiedad.

## 2. Actores y autoridad

### 2.1 Actor

Un actor es un humano o un proceso con identidad y contexto de tenant. La autenticación responde quién es; la autorización responde si puede realizar esa acción, en ese tenant, bajo esa política y en ese momento.

Un actor puede tener autoridad para pedir información y no para aprobar. Puede tener autoridad para aprobar hasta cierto alcance y no para ejecutar. La autoridad se verifica por acción, no se hereda de una sesión ni de una aprobación anterior.

### 2.2 Fuentes de autoridad

- Política de la empresa, con versión identificable.
- Permisos verificados del actor o proceso.
- Segregación de funciones, maker-checker y quorum cuando la política lo exija.
- Delegación con alcance y vigencia.
- Override humano con actor, motivo, fecha y evidencia.
- Controles técnicos independientes que comprueban la acción antes de que ocurra.

### 2.3 Lo que el workflow no hace

- No concede permisos.
- No crea roles.
- No interpreta la factura ni sustituye la validación.
- No elige al aprobador por conveniencia.
- No usa un modelo como aprobador, delegado ni miembro de quorum.
- No convierte la ausencia de respuesta en aprobación.
- No envía dinero ni declara un pago.

### 2.4 Verificación por transición

Cada transición que cambie la situación de la operación comprueba, como mínimo:

1. Tenant y operación.
2. Actor o proceso que actúa.
3. Acción solicitada.
4. Permiso y política aplicables.
5. Alcance, vigencia y segregación requerida.
6. Situación actual de la operación y versión de los datos que se decidieron.
7. Resultado: permitido, denegado o requiere intervención humana.

La comprobación se registra. Una transición sin evidencia de autorización no se considera realizada.

## 3. Situaciones y salidas

Las situaciones describen lo que debe poder distinguirse. No son un enum cerrado, no fijan nombres definitivos y no forman por sí solas una secuencia autorizada.

### 3.1 Situaciones del workflow

- **En curso.** Hay una etapa activa y un actor o proceso responsable.
- **En espera.** Se pidió información, evidencia o una decisión y todavía no llegó.
- **Delegado.** La responsabilidad está asignada temporalmente a otro actor, con alcance y vigencia.
- **Bloqueado.** La operación no avanza por una condición explícita: falta de autoridad, conflicto de políticas, evidencia insuficiente, cambio sensible o concurrencia.
- **Cerrado.** La operación salió del workflow por una decisión registrada. Cerrado no significa pagado.

### 3.2 Salidas

| Salida | Qué significa | Qué no significa |
| --- | --- | --- |
| Aprobar | La operación queda aprobada para el siguiente paso dentro de la política, con actor, autoridad y evidencia registrados. | No es un pago ejecutado ni una confirmación externa. |
| Rechazar | La operación no continúa por una decisión registrada. | No es un timeout ni un fallo de integración. |
| Pedir información | Se solicita evidencia o aclaración concreta y la operación queda en espera. | El silencio o la ausencia de respuesta no es aprobación. |
| Escalar | La decisión pasa a un humano o a una revisión especializada con motivo y evidencia. | No es una aprobación implícita. |
| Bloquear temporalmente | La operación se detiene por una condición explícita, dentro de la autoridad configurada. | No es un rechazo definitivo ni una aprobación pendiente. |

La liberación de un bloqueo exige que la condición que lo motivó desaparezca o que un humano con autoridad decida. No se libera por tiempo transcurrido sin dejar constancia.

## 4. Ciclo de vida conceptual

El siguiente relato describe situaciones que deben poder distinguirse. No es una secuencia autorizada ni un catálogo cerrado de transiciones.

1. La operación llega al workflow después de la validación, con evidencia y hallazgos.
2. Se identifica la política aplicable y su versión.
3. Se determina qué autoridad exige la acción y quién puede ejercerla.
4. Se evalúan condiciones de bloqueo: evidencia faltante, proveedor no habilitado, datos bancarios nuevos, conflicto de políticas, severidad alta o crítica, cambio material o concurrencia.
5. Si no hay bloqueo, se solicita la decisión al actor o proceso autorizado.
6. Se registra la decisión, el motivo, la autoridad usada y la evidencia.
7. Si se pidió información, la operación queda en espera y se reanuda solo cuando llega evidencia o cuando una autoridad decide cerrar la espera.
8. Si se escaló, un humano o una revisión especializada decide con la evidencia disponible.
9. Si se aprobó, la operación queda aprobada para el siguiente paso. No se marca como pagada.
10. Si se rechazó, la operación no continúa. El rechazo se distingue de un timeout.
11. Si se bloqueó temporalmente, se registra la condición y la condición de liberación.
12. Toda transición deja evidencia y trazabilidad reconstruible.

La versión de política que se congela al iniciar el workflow está abierta. La obligación de registrar la versión evaluada no.

## 5. Puntos de bloqueo

| Condición | Qué bloquea | Qué puede desbloquear |
| --- | --- | --- |
| Evidencia insuficiente | La decisión no tiene base suficiente. | Llega la evidencia, o un humano con autoridad decide con la evidencia disponible y lo registra. |
| Proveedor no habilitado | No se puede tratar la operación como pagable. | Validación de identidad, riesgo y autorización del proveedor. |
| Datos bancarios nuevos o modificados | No se acepta la cuenta desde el documento. | Control reforzado y autorización explícita. |
| Conflicto de políticas | No hay una regla única aplicable. | Resolución explícita según la política de la empresa; la precedencia exacta está abierta. |
| Política ausente | No se puede evaluar el límite. | Se configura la política o un humano con autoridad decide y lo registra. |
| Actor sin permiso | La transición no es válida. | Otro actor con autoridad o una delegación válida. |
| Delegación vencida o revocada | La delegación no sirve. | Nueva delegación válida o el actor original. |
| Segregación incumplida | Quien prepara no puede aprobar si la política lo prohíbe. | Otro aprobador autorizado. |
| Quorum no alcanzado | La decisión no se completa. | Se alcanza el quorum definido por la política; el número está abierto. |
| Severidad alta o crítica | Requiere revisión humana o especializada. | Revisión humana con autoridad y evidencia. |
| Presupuesto agotado o actualizado | La decisión anterior puede dejar de ser válida. | Reevaluación con la versión vigente. |
| Factura modificada después de aprobar | La aprobación anterior no cubre el documento nuevo. | Reevaluar si se invalida o se requiere nueva aprobación. |
| Acción concurrente | Dos actores intentan cambiar la misma operación. | Control de concurrencia y una sola decisión vigente, con rastro de ambos intentos. |
| Salida de IA inválida o contradictoria | No se puede usar como evidencia válida. | Reglas deterministas, nueva interpretación o revisión humana. |
| Señal de cruce entre tenants | No se procesa. | Detener y escalar; no revelar si el recurso ajeno existe. |
| Solicitud de L3 en el MVP | La ejecución real no existe. | Se registra como no disponible; no se simula. |

Un bloqueo no es una decisión final. Un desbloqueo no es una aprobación automática.

## 6. Concurrencia

### 6.1 Problema

Dos actores o procesos pueden intentar cambiar la misma operación a la vez. También pueden cambiar la política, el presupuesto, la factura, los datos bancarios o la delegación mientras el workflow está abierto. Ninguna de esas situaciones se resuelve con “gana el último que escribe” sin dejar constancia.

### 6.2 Principio de diseño

Primero se identifica el estado mutable compartido. Si dos actores solo publican hechos independientes, se elimina el write compartido y se conservan hechos separados. Si una única decisión vigente por operación es un invariante real, se serializa de forma estructural: propiedad exclusiva por operación, fases secuenciales, compare-and-swap o un escritor único. Un lock es el último recurso, no el diseño por defecto.

No se elige aquí la tecnología de persistencia ni el mecanismo concreto de bloqueo. La base de datos está abierta.

### 6.3 Invariantes

- Existe una sola decisión vigente por operación y versión de evidencia.
- Los intentos concurrentes se registran; no se borra el intento perdedor.
- Una decisión tomada con una versión anterior de política, presupuesto o documento no cubre en silencio la versión nueva.
- Los eventos duplicados no crean una segunda aprobación ni una segunda operación.
- Una operación cerrada no revive por un evento tardío o fuera de orden.
- Un cambio material después de aprobar obliga a evaluar invalidación o nueva aprobación.
- La denegación por conflicto de concurrencia es explícita, no un error silencioso.

### 6.4 Escenarios

| Escenario | Comportamiento esperado | Prohibido |
| --- | --- | --- |
| Dos aprobadores actúan a la vez | Una decisión queda vigente; ambos intentos quedan registrados. | Last-write-wins silencioso. |
| La política cambia con el workflow abierto | Se reevalúa con la versión vigente y se registra el cambio. | Aprobar con una política que ya no aplica sin dejar constancia. |
| El presupuesto se agota o se actualiza | Se reevalúa; la decisión anterior puede invalidarse. | Aprobar contra un presupuesto que ya no está vigente. |
| La factura se modifica después de aprobar | Se evalúa invalidación o nueva aprobación. | Conservar la aprobación sobre otra versión. |
| La delegación vence o se revoca | La transición no se completa con esa delegación. | Aceptar una delegación vencida o revocada. |
| El aprobador está ausente | Se aplica la salida que defina la política; no hay sustituto implícito. | Escalar al administrador “para que la demo fluya”. |
| Llega un evento duplicado o tardío | Se trata de forma idempotente y no revive una operación cerrada. | Procesar el duplicado como una decisión nueva. |

## 7. Quorum, delegación y override

### 7.1 Quorum

Puede hacer falta más de un aprobador cuando la política lo exija. El algoritmo concreto, el número de aprobadores, la mayoría requerida y el tratamiento de abstenciones están abiertos. No se inventan números en este documento.

El quorum no se simula. Si no se alcanza, la operación no se considera aprobada. Un modelo de IA no cuenta como aprobador ni como miembro del quorum.

### 7.2 Delegación

Una delegación tiene alcance y vigencia. Puede limitarse a un tenant, una operación, un tipo de acción o un periodo. Una delegación vencida, revocada o fuera de alcance no concede autoridad.

La delegación no transfiere la propiedad de la operación ni permite que el delegado delegue a su vez sin una regla explícita. Esa regla está abierta.

### 7.3 Override humano

Un override es una excepción humana con actor, motivo, fecha y evidencia. No es un atajo del modelo de IA. No elimina la obligación de registrar la decisión ni la evidencia que la motiva.

El override no puede usarse para saltarse una prohibición absoluta de la tarea 07: ningún modelo concede autoridad, aprueba por sí solo, reduce severidad o ejecuta un pago.

### 7.4 Segregación de funciones

Cuando la política lo exija, quien prepara no aprueba y quien aprueba no ejecuta. Maker-checker se aplica según la política de la empresa, no como un organigrama universal.

La segregación se verifica en el momento de la transición. Una aprobación anterior no exime de la segregación de una etapa posterior.

## 8. Evidencia por transición

Cada transición que cambie la situación de la operación registra, según aplique:

- tenant y operación;
- documento y versión que se decidió;
- evidencias y fuentes consultadas, incluidas las ausentes;
- reglas y versión de política evaluadas;
- resultado de las validaciones;
- actor o proceso, decisión, motivo y autoridad usada;
- situación anterior y situación resultante;
- fecha y correlation ID;
- si intervino IA: modelo, versión, entradas permitidas, salida estructurada y evidencias;
- si hubo delegación: alcance y vigencia;
- si hubo override: actor, motivo, fecha y evidencia;
- si hubo conflicto de concurrencia: intentos y resultado.

La evidencia debe permitir reconstruir la decisión sin depender de la memoria de un actor. No se guardan secretos ni datos personales innecesarios. El cuerpo completo del correo no se guarda si no hace falta para reconstruir la decisión.

Se evalúa un registro append-only o un control equivalente que impida modificaciones silenciosas. Es un requisito de diseño, no una tecnología elegida.

## 9. Relación con otras tareas

| Tarea | Relación |
| --- | --- |
| 04 Validación | Aporta evidencia y hallazgos. No decide aprobar ni rechazar. |
| 07 Autoridad e IA | Define L2, la autoridad y las prohibiciones del modelo. Este workflow las consume. |
| 08 Arquitectura | Ubica el módulo Workflow y su frontera con Decision, Authorization y Execution. No elige vendor. |
| 10 Seguridad y tenancy | Implementa aislamiento, autorización y auditoría. Este documento fija el comportamiento. |
| 11 Edge cases | Cubre concurrencia, delegación, cambios de política y prompt injection. Este documento no los resuelve en detalle. |
| 06 Spend Intelligence | No es dependencia de este workflow. |

## 10. Requisitos funcionales

| ID | Requisito | Evidencia de aceptación |
| --- | --- | --- |
| RF-05.1 | Ciclo configurable con aprobar, rechazar, pedir información, escalar y bloquear temporalmente. | Las cinco salidas están definidas y ninguna se confunde con pago. |
| RF-05.2 | Cada transición verifica tenant, actor, permiso, política y situación actual. | Una transición sin autorización registrada no se considera realizada. |
| RF-05.3 | Aplicar segregación de funciones cuando la política lo exija. | Quien prepara no aprueba si la política lo prohíbe. |
| RF-05.4 | Delegación con alcance y vigencia. | Una delegación vencida o revocada no completa la transición. |
| RF-05.5 | Quorum configurable cuando la política lo exija. | El quorum no alcanzado no se presenta como aprobación; no se inventan números. |
| RF-05.6 | Registrar la versión de política evaluada y hacer explícito el conflicto. | Un conflicto no se resuelve en silencio. |
| RF-05.7 | Controlar concurrencia sin last-write-wins. | Una sola decisión vigente y rastro de ambos intentos. |
| RF-05.8 | Reevaluar si cambian factura, contrato, datos bancarios, presupuesto o política. | Un cambio material no queda cubierto por la aprobación anterior en silencio. |
| RF-05.9 | Registrar evidencia por transición y permitir reconstrucción. | Cada transición tiene actor, autoridad, motivo, evidencia, política y fecha. |
| RF-05.10 | Escalar a humano cuando falte evidencia, autoridad o haya riesgo alto o crítico. | El escalamiento no es aprobación y queda registrado. |
| RF-05.11 | Permitir que la IA proponga o redacte, sin aprobar, rechazar, delegar ni formar quorum. | Ningún modelo aparece como aprobador. |
| RF-05.12 | No ejecutar dinero ni declarar pago confirmado. | Aprobar no produce un estado de pago confirmado. |
| RF-05.13 | Tratar la espera de información como espera, no como conformidad. | El silencio no completa la transición. |
| RF-05.14 | Bloquear temporalmente con condición de liberación explícita. | Un bloqueo no se libera por tiempo sin constancia. |

## 11. Requisitos no funcionales

| ID | Requisito | Evidencia de aceptación |
| --- | --- | --- |
| RNF-05.1 | Aislamiento multi-tenant. | Toda transición comprueba tenant; no se comparten estados ni resultados entre tenants. |
| RNF-05.2 | Autorización independiente. | El workflow no concede permisos; consulta un control separado. |
| RNF-05.3 | Concurrencia e idempotencia. | Eventos duplicados y actores concurrentes no crean decisiones dobles ni silenciosas. |
| RNF-05.4 | Auditabilidad. | Registro reconstruible, append-only o equivalente, sin secretos ni datos personales innecesarios. |
| RNF-05.5 | Determinismo en la evaluación de políticas. | La misma entrada, política y versión producen el mismo resultado. |
| RNF-05.6 | Portabilidad. | No se elige motor de workflows ni vendor; el diseño no depende de una API propietaria. |
| RNF-05.7 | Privacidad. | No se guarda el cuerpo completo del correo si no hace falta; no se usan datos reales. |
| RNF-05.8 | Observabilidad. | Correlation ID, logs estructurados y errores accionables sin datos sensibles. |
| RNF-05.9 | No simulación. | Ningún estado sugiere un pago, una confirmación o una ejecución que no ocurrió. |
| RNF-05.10 | Costo controlado. | No se asume un proceso durable gratuito; si se adopta, se mide y se documenta el costo. |

## 12. Ejemplos sintéticos

### 12.1 Diferencia que requiere confirmación

Una factura sintética presenta una diferencia no explicada contra la evidencia disponible. La validación abre un hallazgo. El workflow pide confirmación al departamento responsable y queda en espera.

- Si no llega respuesta, no se aprueba. El silencio no es conformidad.
- Si llega evidencia suficiente, se reevalúa y se solicita la decisión a un actor con autoridad.
- Aprobar la operación no la marca como pagada.
- La severidad no se reduce por una salida de modelo.

### 12.2 Dos aprobadores concurrentes

Dos actores con permiso intentan aprobar la misma operación al mismo tiempo. El sistema conserva una sola decisión vigente y registra ambos intentos, incluido el que no prevaleció. No se borra el intento perdedor y no se aplica last-write-wins silencioso.

### 12.3 Factura modificada después de aprobar

La factura cambia después de una aprobación. La aprobación anterior no cubre la versión nueva. El workflow evalúa si invalida la decisión o exige una nueva aprobación. La regla exacta está abierta; la obligación de evaluarlo no.

## 13. Decidido, hipótesis y abierto

### Decidido

- El workflow es configurable; las políticas varían por empresa.
- Las salidas del MVP son aprobar, rechazar, solicitar información, escalar y bloquear temporalmente dentro de la autoridad configurada.
- Aprobar no produce un pago confirmado.
- Un actor sin permiso no completa la transición, aunque esté autenticado.
- Una delegación vencida o revocada no sirve.
- Puede hacer falta quorum cuando la política lo exija; el algoritmo está abierto.
- Un override humano lleva actor, motivo, fecha y evidencia.
- La segregación de funciones se aplica cuando la política lo exige.
- Si cambian factura, contrato, datos bancarios o política después de aprobar, se evalúa invalidar o reaprobar.
- Dos actores o procesos no pueden cerrar la misma operación a la vez sin control de concurrencia.
- El workflow no envía dinero.
- La IA no aprueba, no autoriza, no delega y no forma quorum.
- Cada transición deja evidencia reconstruible.

### Hipótesis

- Un flujo lineal con escalamiento por monto cubre la demo. Es reversible; el hecho conocido es que las jerarquías varían y hay pagos en serie.
- La espera de una aprobación humana encaja mejor en un proceso durable que en una petición HTTP larga. Es una hipótesis de mecanismo, no una elección de Cloudflare Workflows.
- Una sola decisión vigente por operación es el invariante principal de concurrencia. La forma de imponerlo está abierta.

### Abierto

- Modelo exacto de aprobaciones, delegación y quorum.
- Precedencia cuando dos políticas chocan.
- Umbrales inclusivos o exclusivos.
- Qué pasa con un aprobador ausente: delegado, revocado o sin permiso.
- Tiempos de espera y caducidad de una solicitud de información.
- Catálogo cerrado de situaciones y transiciones.
- Si se congela la versión de política al iniciar el workflow.
- Si el presupuesto se reserva al iniciar el workflow.
- Qué cambios son materiales después de una aprobación.
- Mecanismo concreto de concurrencia e idempotencia.
- Si hace falta cola o workflow durable.
- Esquema de identidad, roles y permisos.

### No se puede cerrar en esta tarea

- Ningún punto de [asuntos abiertos](../decisiones/abiertas.md) sin una decisión explícita.
- La elección de motor de workflows, base de datos, frontend o cualquier otro vendor.
- Números de quorum, plazos, umbrales o importes.
- El esquema de roles.
- La ejecución bancaria o L3.
- El detalle de prompt injection; pertenece a la tarea 11.
- La implementación de multi-tenancy; pertenece a la tarea 10.

## 14. Fuera de esta tarea

- Un diseñador visual genérico de BPM con decenas de tipos de nodo.
- Aprobación automática por un modelo de IA.
- Ejecución bancaria al aprobar.
- Un flujo fijo de cuatro ojos para todos los tenants.
- Un enum cerrado de estados o un esquema de base de datos.
- Elegir motor de workflows, proveedor, base de datos o frontend.
- Definir números de quorum, plazos o umbrales.
- Implementar L3 o simular un pago.
- Resolver en detalle prompt injection o aislamiento multi-tenant; pertenecen a las tareas 11 y 10.

## 15. Criterios de aceptación

- Aprobar no produce un estado de pago confirmado.
- Un actor sin permiso no completa la transición, aunque esté autenticado.
- Una delegación vencida o revocada no sirve.
- El conflicto entre políticas queda explícito y sin resolver numéricamente.
- Cada transición citada puede reconstruirse con tenant, operación, documento, evidencia, política, actor, autoridad, decisión y fecha.
- Dos actores concurrentes no se pisan en silencio; ambos intentos quedan registrados.
- Una factura modificada después de aprobar no queda cubierta por la aprobación anterior sin evaluación.
- El silencio no se convierte en aprobación.
- Ningún modelo aparece como aprobador, delegado ni miembro de quorum.
- No se inventan números de quorum, plazos ni umbrales.
- No se elige motor de workflows, vendor, base de datos ni frontend.
- L3 no aparece como ejecución de dinero.
- Los ejemplos son sintéticos y están marcados.
