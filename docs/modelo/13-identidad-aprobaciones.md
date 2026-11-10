# Identidad, roles y aprobaciones

**Estado:** adoptado el 2026-11-09. Discovery; no implementar.
**Tarea:** 13.
**Orquestador:** `.cursor/agents/seguridad-tenancy.md`.
**Skill:** `review-security` (leer por ruta si no está registrada).

Modelo conceptual de identidad, membresía por tenant, permisos, onboarding, delegación, segregación, quorum y precedencia de políticas. No es un esquema de base de datos, ni una elección de proveedor de identidad, ni un catálogo cerrado de roles.

Este documento registra el modelo adoptado. Lo que sigue marcado como hipótesis o abierto no está decidido.

## Fuentes y alcance

- [Documento maestro](../documento-maestro.md), secciones 7, 9, 13 y 15.
- [Master prompt](../../MASTER_PROMPT_FINANCIAL_OPERATIONS.md).
- [Glosario](../glosario.md).
- [Decisiones adoptadas](../decisiones/adoptadas.md) y [asuntos abiertos](../decisiones/abiertas.md).
- [Tarea 13](../tareas/13-identidad-aprobaciones.md).
- [Modelo de dominio](01-dominio.md), [workflows](05-workflows-aprobacion.md), [autoridad e IA](07-autoridad-ia.md), [seguridad y tenancy](10-seguridad-tenancy.md) y [catálogo de estados](12-estados-transiciones.md).

**Alcance:** identidad de usuarios y procesos, membresía por empresa, autorización de acciones de cuentas por pagar y coordinación de aprobaciones. No incluye autenticación implementada, proveedor de identidad, SSO, SCIM, MFA ni recuperación de cuenta.

## Cómo leer este documento

- **Decidido.** Ya acordado en el documento maestro, las decisiones adoptadas, el glosario o las tareas 05, 07, 10 y 12.
- **Propuesto.** Parte de esta propuesta que requiere adopción. No es una regla vigente hasta que se decida.
- **Hipótesis.** Supuesto reversible. No es requisito.
- **Abierto.** Falta una decisión. No se implementa ni se usa para cerrar otra discusión.

## 1. Principios

1. **La identidad responde quién es; la autorización responde qué puede hacer.** Una sesión válida no concede permisos.
2. **Denegar por defecto.** Si falta tenant, membresía, permiso, política, alcance, evidencia o versión, se deniega.
3. **La autoridad es por acción, tenant, recurso y momento.** No se hereda de una sesión, de una aprobación anterior ni de otro tenant.
4. **Mínimo privilegio.** Un actor tiene solo los permisos que su rol y su alcance le conceden.
5. **Sin roles implícitos.** Un rol es un paquete explícito de permisos. No existe "administrador por defecto" ni "usuario autenticado puede todo".
6. **La IA no es un principal de autorización.** No tiene membresía, rol, permiso, delegación ni voto. Sus salidas pertenecen al proceso que las usa y ese proceso solo puede interpretar o proponer.
7. **El tenant no se deduce del cliente.** El backend resuelve la membresía y comprueba el tenant del recurso.
8. **La autorización es determinista y registrable.** La misma entrada, política y versión producen el mismo resultado y dejan evidencia.
9. **La ausencia no autoriza.** Falta de política, de permiso o de respuesta no equivale a aprobación.
10. **Un cambio material reabre la autorización.** No se reutiliza una autorización sobre datos, política o evidencia que ya cambiaron.

## 2. Conceptos

| Concepto | Qué conserva | Qué no implica |
| --- | --- | --- |
| Identidad | Un sujeto autenticable, con un identificador estable. | Pertenencia a una empresa ni permiso alguno. |
| Usuario | Una identidad humana. | Autoridad financiera ni rol por defecto. |
| Proceso de servicio | Una identidad no humana con credenciales propias y alcance limitado. | Autoridad para aprobar dinero ni para actuar como humano. |
| Tenant | La empresa dueña de los datos y de las políticas. | Que cualquier usuario autenticado pertenezca a ella. |
| Membresía | El vínculo entre una identidad y un tenant, con estado y roles. | Permiso concreto ni vigencia ilimitada. |
| Actor | La identidad y la membresía con las que se ejecuta una acción en un tenant. | Autoridad por estar autenticado. |
| Rol | Un paquete nombrado y versionado de permisos, propio de un tenant. | Un organigrama ni un permiso fuera de su alcance. |
| Permiso | La capacidad explícita de ejecutar una acción sobre un tipo de recurso. | Acceso a todos los recursos de ese tipo. |
| Alcance | El límite de un permiso: tenant, departamento, proveedor, tipo de operación, monto, moneda o vigencia. | Un permiso nuevo. |
| Asignación | La concesión de un rol a una membresía, con alcance y vigencia. | Delegación ni transferencia de propiedad. |
| Delegación | La concesión temporal de un subconjunto de permisos del delegante al delegado. | Más autoridad que la del delegante ni re-delegación implícita. |
| Política | Reglas y límites versionados que condicionan una decisión. | Permiso por sí sola ni autoridad de la IA. |
| Aprobación | El registro de un actor autorizado que decide dentro de una política y una versión de evidencia. | Pago ni confirmación externa. |
| Quorum | El número y tipo de aprobaciones válidas que exige una política. | Aprobación por mayoría simple ni voto de la IA. |
| Override | Una excepción humana con actor, motivo, fecha y evidencia. | Atajo del modelo ni permiso ilimitado. |

### Identidad global y membresía por tenant

El modelo adoptado separa la identidad de la pertenencia:

- Una **identidad** puede existir una vez y autenticarse con un proveedor externo.
- Una **membresía** la vincula a un tenant con estado, roles y alcance.
- La misma identidad puede tener membresías distintas en tenants distintos, con permisos distintos.
- Ninguna consulta mezcla membresías de tenants distintos.

La identidad global con membresía por tenant está adoptada. Una cuenta por tenant queda descartada para el MVP; cambiarla exige reabrir la decisión de la sección 15.

## 3. Modelo conceptual

Entidades conceptuales, no tablas:

| Entidad | Qué representa |
| --- | --- |
| `Identity` | Sujeto autenticable: usuario o proceso de servicio. |
| `Tenant` | Empresa cliente. |
| `Membership` | Vínculo identidad–tenant con estado, roles y alcance. |
| `Role` | Paquete de permisos versionado y propio del tenant. |
| `Permission` | Acción permitida sobre un tipo de recurso. |
| `RolePermission` | Qué permisos incluye un rol. |
| `Assignment` | Asignación de rol a membresía, con alcance y vigencia. |
| `Delegation` | Delegación de permisos entre membresías, con alcance, vigencia y motivo. |
| `Policy` | Regla versionada del tenant con alcance y prioridad. |
| `PolicyRule` | Condición y efecto de una política. |
| `ApprovalRequest` | Requisito de aprobación para una operación y versión de evidencia. |
| `Approval` | Aprobación individual de un actor autorizado. |
| `SeparationRule` | Regla maker-checker o de incompatibilidad. |
| `AuthorizationDecision` | Resultado registrado de una verificación de autorización. |
| `AuditEvent` | Hecho de identidad, permiso, política o decisión. |

Estados de membresía:

| Estado | Qué conserva | Transiciones permitidas |
| --- | --- | --- |
| `INVITADA` | Hay una invitación válida y no aceptada. | A `ACTIVA` al aceptar; a `REVOCADA` al cancelar. |
| `ACTIVA` | Puede autenticarse y ejercer los permisos de sus roles. | A `SUSPENDIDA` o `REVOCADA`. |
| `SUSPENDIDA` | Conserva el vínculo, pero no puede actuar. | A `ACTIVA` o `REVOCADA`. |
| `REVOCADA` | El vínculo terminó; se conserva para auditoría. | Estado terminal. |

Estados de delegación:

| Estado | Qué conserva | Transiciones permitidas |
| --- | --- | --- |
| `ACTIVA` | La delegación está vigente y dentro de alcance. | A `VENCIDA` o `REVOCADA`. |
| `VENCIDA` | Pasó la fecha de vigencia. | Estado terminal. |
| `REVOCADA` | El delegante o un administrador la revocó. | Estado terminal. |

Una delegación vencida o revocada no concede autoridad aunque la membresía siga activa.

## 4. Permisos

El permiso se nombra por acción, no por pantalla. No existe un permiso genérico de "escribir" ni de "administrar todo".

Catálogo adoptado, mínimo y ampliable:

| Grupo | Permisos adoptados |
| --- | --- |
| Identidad y acceso | `iam.member.invite`, `iam.member.remove`, `iam.role.manage`, `iam.delegation.manage`, `iam.policy.manage` |
| Tenant | `tenant.settings.read`, `tenant.settings.update` |
| Proveedores | `supplier.read`, `supplier.validate`, `supplier.enable`, `supplier.bank_account.change` |
| Facturas | `invoice.read`, `invoice.create`, `invoice.validate`, `invoice.request_info`, `invoice.escalate`, `invoice.block` |
| Decisión | `invoice.approve`, `invoice.reject` |
| Workflow | `workflow.read`, `workflow.assign` |
| Pago | `payment.read`, `payment.authorize`; `payment.prepare` y `payment.execute` quedan reservados |
| Gasto | `spend.read`, `spend.recommend` |
| Auditoría | `audit.read`, `audit.export` |

Reglas:

- Aprobar y rechazar son permisos distintos; no se agrupan en "decidir".
- `supplier.bank_account.change` exige control reforzado y no se concede por defecto a quien valida facturas.
- `payment.authorize` no se deriva de `invoice.approve`; son actos separados.
- `payment.prepare` y `payment.execute` no existen en el MVP como acciones reales.
- Un permiso sin alcance definido se interpreta como el alcance mínimo del rol, no como todos los recursos.
- La IA no recibe ninguno de estos permisos. Su salida no se convierte en una acción.

Cada asignación lleva alcance:

- `department_ids`: departamentos donde aplica.
- `provider_ids` o categoría de proveedor.
- `operation_types`: factura, nota crédito, recurrente, etc.
- `amount_limit` y `currency`: el límite es un dato de política, no un número inventado aquí.
- `valid_from` y `valid_to`.
- `tenant_id`: obligatorio.

## 5. Arquetipos de rol

Los arquetipos son la referencia adoptada. El catálogo definitivo, los nombres finales y los roles personalizados siguen abiertos.

| Arquetipo | Permisos principales | Límite |
| --- | --- | --- |
| `OWNER` | `iam.*`, `tenant.settings.*`, `audit.read` | No puede saltarse la segregación que la política exija. |
| `IAM_ADMIN` | `iam.member.*`, `iam.role.manage`, `iam.delegation.manage` | No aprueba facturas por defecto. |
| `PREPARER` | `invoice.create`, `invoice.read`, `workflow.read` | No aprueba. |
| `VALIDATOR` | `invoice.read`, `invoice.validate`, `supplier.read` | No aprueba por defecto; valida y señala. |
| `APPROVER` | `invoice.read`, `invoice.approve`, `invoice.reject`, `invoice.request_info`, `invoice.escalate` | Dentro de su alcance y política; no autoriza pago. |
| `AUDITOR` | `audit.read`, `audit.export`, `invoice.read` | Solo lectura; no decide. |
| `VIEWER` | `invoice.read`, `spend.read` | Solo lectura. |
| `PROCESS` | Permisos de sistema acotados a registrar, extraer, clasificar y proponer | No aprueba, no autoriza pago, no forma quorum. |

Reglas:

- Un usuario puede tener varios roles; los permisos se suman sin romper la segregación.
- Un rol no concede permisos de otro rol por conveniencia.
- El último `OWNER` activo no puede revocarse sin nombrar otro.
- `IAM_ADMIN` y `APPROVER` pueden coexistir, pero la política puede exigir que no sean el mismo actor para una operación.

## 6. Onboarding y baja

### 6.1 Alta del tenant

Adoptado para el MVP:

1. Un operador autorizado crea el tenant con datos sintéticos o del piloto.
2. Se registra el tenant, su estado y la política inicial mínima.
3. Se designa un administrador inicial verificado fuera de banda.
4. El administrador inicial recibe `OWNER` con vigencia y queda auditado.

El autoservicio, la verificación de dominio y el alta sin operador quedan abiertos.

### 6.2 Invitación y activación

1. Un actor con `iam.member.invite` invita a una identidad, con rol y alcance.
2. La invitación tiene token de un solo uso, vigencia y tenant.
3. La aceptación exige autenticación; no crea permisos distintos de los invitados.
4. La membresía pasa de `INVITADA` a `ACTIVA`.
5. Un intento con token vencido, usado o de otro tenant se deniega sin revelar datos.

### 6.3 Cambio de roles y alcance

- Requiere `iam.role.manage`.
- Se registra actor, rol anterior, rol nuevo, alcance, motivo y fecha.
- No se puede conceder un permiso que el administrador no tenga, salvo que una política de plataforma lo permita y lo registre.
- Un cambio de rol no reescribe aprobaciones pasadas; las futuras se evalúan con la nueva asignación.
- Un cambio material de alcance durante un workflow obliga a reevaluar las aprobaciones pendientes.

### 6.4 Baja y suspensión

- Suspender impide autenticarse y actuar, pero conserva el rastro.
- Revocar termina la membresía y revoca asignaciones y delegaciones asociadas.
- Las sesiones y tokens de la membresía se invalidan.
- Las aprobaciones pendientes del actor se reevalúan; no se cuentan como emitidas por un actor activo.
- Las operaciones asignadas se reasignan o se bloquean; no se cierran por la baja.
- No se borra la evidencia de auditoría.

### 6.5 Procesos de servicio

- Se crean por un administrador, con permisos acotados y credenciales propias.
- No tienen membresía humana ni pueden iniciar sesión como usuario.
- Rotación y revocación de credenciales están abiertas.
- Por defecto no pueden aprobar operaciones financieras ni formar quorum.
- Su uso queda registrado como actor de proceso.

## 7. Delegación

Reglas adoptadas:

- El delegante debe tener el permiso que delega y estar `ACTIVA`.
- El delegado debe pertenecer al mismo tenant y estar `ACTIVA`.
- La delegación concede un subconjunto del permiso, con alcance y vigencia.
- No puede exceder el alcance del delegante.
- Tiene motivo, fecha de inicio, fecha de fin y estado.
- Es revocable por el delegante o por `iam.delegation.manage`.
- Por defecto no se re-delega; permitirlo exige una regla explícita y está abierto para el MVP.
- No transfiere la propiedad de la operación ni crea un rol.
- La segregación de funciones sigue aplicando: el delegado no puede ser maker y checker a la vez.
- Una delegación vencida o revocada no concede autoridad y la transición se deniega.
- No se delega a la IA ni a un proceso de servicio sin una regla explícita.

## 8. Segregación y quorum

### 8.1 Segregación de funciones

- Maker-checker: quien prepara no aprueba la misma operación cuando la política lo exige.
- Quien aprueba no ejecuta el pago; la ejecución es otro acto y otro permiso.
- `IAM_ADMIN` y `APPROVER` pueden ser incompatibles para la misma operación si la política lo exige.
- Ningún actor puede aprobar su propia preparación.
- El mismo actor no se cuenta dos veces en un quorum.
- La segregación se verifica en la transición, no solo al asignar el rol.

### 8.2 Quorum

La política define:

- número mínimo de aprobaciones válidas;
- roles o permisos elegibles;
- si se exigen aprobadores de departamentos distintos;
- tratamiento de abstenciones, empates y suplencias;
- vigencia de cada aprobación.

Reglas adoptadas:

- Solo cuentan aprobaciones de actores `ACTIVOS`, con permiso vigente y sin conflicto de segregación.
- La IA y los procesos de servicio no cuentan por defecto.
- El quorum se calcula sobre la versión de evidencia y política vigente.
- Si cambia la evidencia o la política, las aprobaciones anteriores se reevalúan; no se reutilizan en silencio.
- Si no se alcanza el quorum, la operación no se considera aprobada; puede quedar en espera, bloqueada o escalada.
- Cada aprobación se registra con actor, autoridad, alcance, fecha y versión.
- El número exacto, los pesos y las abstenciones están abiertos.

## 9. Precedencia de políticas

Evaluación determinista adoptada:

1. Se reúnen las políticas aplicables al tenant, la operación, el actor, el departamento, el proveedor y el tipo de operación.
2. Se descartan las políticas vencidas o de otro tenant.
3. Una denegación explícita prevalece sobre una autorización.
4. Una política de tenant prevalece sobre un valor por defecto de plataforma.
5. Entre políticas del mismo nivel, se aplica la prioridad explícita definida por el tenant.
6. Si dos políticas aplicables tienen la misma prioridad y efectos contradictorios, se declara `CONFLICTO`. No se elige la más permisiva ni la última evaluada.
7. Un `CONFLICTO` bloquea la decisión y se escala a un humano con autoridad para resolverlo; la resolución se registra con las políticas y versiones.
8. Si no hay política aplicable, se deniega o se escala; no se autoriza por defecto.
9. La versión de cada política evaluada se registra. Un cambio de política durante el workflow obliga a reevaluar.

La regla exacta de prioridad y la interfaz de configuración están abiertas. La prohibición de resolver un conflicto en silencio no.

## 10. Evaluación de autorización

Entradas:

- identidad y tipo de principal;
- tenant y membresía;
- acción solicitada y recurso;
- estado actual y versión de evidencia;
- roles, asignaciones y delegaciones vigentes;
- políticas aplicables y sus versiones;
- requisitos de segregación y quorum;
- momento de la evaluación.

Pasos:

1. Resolver el tenant del recurso y comprobar que la membresía pertenece a ese tenant. Si no, denegar sin revelar existencia.
2. Comprobar que la membresía está `ACTIVA` y que la identidad está autenticada.
3. Calcular permisos efectivos: roles asignados más delegaciones vigentes, nunca por herencia implícita.
4. Comprobar que el permiso cubre la acción, el recurso y el alcance.
5. Evaluar políticas y detectar conflictos.
6. Comprobar segregación de funciones.
7. Comprobar el quorum requerido, si aplica.
8. Comprobar que la versión de evidencia y de política es la vigente.
9. Producir `PERMITIDO`, `DENEGADO` o `REQUIERE_HUMANO`, con motivo, política y versión.
10. Registrar la decisión de autorización.

Reglas:

- La ausencia de un paso o de un dato produce denegación, no autorización.
- La evaluación no escribe el estado de la operación; solo autoriza o deniega la transición.
- Una autorización no se reutiliza para otra acción, otro recurso, otro tenant ni otra versión.
- Un proceso de servicio se evalúa con las mismas reglas y con sus propios permisos.
- La IA nunca aparece como principal ni como fuente de una autorización.

## 11. Autonomía L0–L3

La empresa configura el nivel máximo por tipo de operación, monto, moneda, proveedor, departamento, presupuesto, riesgo y permisos.

- **L0 Observar:** registrar, extraer, clasificar y proponer. No decide ni actúa.
- **L1 Decidir:** evaluar y proponer una decisión. No autoriza.
- **L2 Actuar:** aprobar, rechazar, pedir información, escalar o bloquear dentro de la autoridad configurada. No mueve dinero.
- **L3 Ejecutar:** no existe en el MVP.

Reglas:

- La configuración de autonomía no sustituye el permiso ni la política.
- Un nivel alto no permite saltarse la segregación, el quorum ni la evidencia.
- La IA no sube de nivel ni recibe autoridad por configuración.
- La aprobación automática L2, si se adopta, exige política explícita, límites, evidencia y registro; hoy está abierta.
- Una severidad alta o crítica exige humano aunque el nivel configurado sea L2.

## 12. Aislamiento multi-tenant

- Toda entidad de negocio y toda membresía llevan `tenant_id`.
- Un usuario global puede tener membresías en varios tenants; cada solicitud usa una sola.
- Una identidad sin membresía en el tenant no puede leer, buscar, exportar ni inferir la existencia del recurso.
- Un ID de otro tenant se trata como inexistente: mismo resultado, sin nombre ni estado.
- Roles, políticas, delegaciones y quorum son propios de cada tenant; no se comparten.
- La caché, los resultados, las extracciones y los embeddings se separan por tenant.
- El acceso de soporte, si existe, es un permiso especial, acotado, auditado y fuera del flujo normal.

## 13. Auditoría de identidad y autorización

Se registra, como mínimo:

- alta, invitación, aceptación, suspensión y revocación de membresía;
- creación, cambio y revocación de roles y asignaciones;
- creación, uso, vencimiento y revocación de delegaciones;
- creación y cambio de políticas y su versión;
- cada decisión de autorización: actor, tenant, acción, recurso, estado, política, versión y resultado;
- cada override: actor, motivo, fecha, evidencia y autoridad;
- cada aprobación y cada intento fallido;
- cambios de quorum y conflictos de política;
- accesos de soporte.

El registro es append-only o equivalente, no guarda secretos ni datos personales innecesarios y no se mezcla entre tenants.

## 14. Decidido, hipótesis y abierto

### Decidido

#### Ya decidido antes de esta tarea

- Autenticación no es autorización.
- Denegar por defecto y mínimo privilegio.
- Roles y permisos explícitos; no hay roles implícitos.
- Maker-checker, delegación con vigencia, quorum configurable y precedencia explícita.
- Override humano con actor, motivo, fecha y evidencia.
- La IA no concede autoridad, no aprueba, no delega y no forma quorum.
- El aislamiento multi-tenant se impone en backend y persistencia.
- Un cambio material obliga a reevaluar la autorización.
- Cada decisión de autorización deja evidencia.

#### Adoptado el 2026-11-09

- Identidad global con membresía por tenant: una misma identidad humana puede pertenecer a varios tenants con roles distintos.
- Permisos nombrados por acción y alcance; aprobar y rechazar separados.
- Arquetipos de rol de referencia, no catálogo cerrado.
- Onboarding por invitación con administrador inicial verificado.
- Delegación como subconjunto del delegante, sin re-delegación por defecto.
- Denegación explícita prevalece y conflicto de igual prioridad se escala.
- Procesos de servicio sin aprobación financiera por defecto.
- `AuthorizationDecision` como registro separado de la transición.
- Las reglas de las secciones 7, 8, 9 y 10.

### Hipótesis

- Un conjunto pequeño de arquetipos cubre la demo.
- El MVP no necesita roles personalizados; el catálogo abierto puede esperar.
- La aprobación automática L2 no es necesaria para la demo.

### Abierto

- Proveedor de identidad, protocolo, MFA, recuperación, SSO y SCIM.
- Autoservicio frente a invitación y verificación de dominio.
- Catálogo definitivo de roles, nombres finales y roles personalizados.
- Números de quorum, abstenciones, empates, pesos y suplencias.
- Re-delegación y límites de duración.
- Regla exacta de prioridad de políticas e interfaz de configuración.
- Aprobación automática L2.
- Procesos de servicio aprobando operaciones financieras.
- Acceso de soporte.
- Jurisdicción, retención y borrado.

## 15. Decisión de identidad adoptada

Adoptado el 2026-11-09: **el MVP permite que una misma identidad humana pertenezca a varios tenants**. La identidad es global; la pertenencia y los roles son por tenant.

- Un usuario puede tener roles distintos en empresas distintas.
- Ninguna solicitud mezcla membresías de tenants distintos.
- Una identidad sin membresía en el tenant no accede al recurso.
- Una cuenta por tenant queda descartada para el MVP. Reabrirla exige una decisión explícita.

## 16. Casos de aceptación

1. Un usuario autenticado sin `invoice.approve` no aprueba; recibe denegación explícita.
2. Un permiso con alcance de USD 5.000 no aprueba una factura de USD 6.000.
3. Un permiso en el tenant A no sirve en el tenant B.
4. Una delegación vencida no completa una aprobación.
5. Una delegación fuera de alcance no completa una aprobación.
6. `IAM_ADMIN` y `APPROVER` en el mismo actor se bloquean cuando la política exige segregación.
7. Dos aprobaciones del mismo actor cuentan como una, no como quorum.
8. Un quorum de dos no se alcanza con un aprobador y una aprobación de la IA.
9. Dos políticas contradictorias de igual prioridad producen `CONFLICTO` y escalamiento.
10. Una denegación explícita prevalece sobre una autorización.
11. Un cambio de política durante el workflow obliga a reevaluar.
12. Un ID de otro tenant se deniega sin revelar si existe.
13. Un proceso de servicio sin permiso de aprobación no aprueba.
14. La IA no aparece como actor en ninguna aprobación ni en ningún quorum.
15. Toda decisión de autorización deja actor, tenant, acción, política y versión.

## 17. Relación con otras tareas

| Tarea | Relación |
| --- | --- |
| 01 Dominio | Aporta actor, tenant y departamento. |
| 05 Workflows | Consume permisos, delegación, quorum y segregación. |
| 07 Autoridad e IA | Define la autoridad y las prohibiciones que este modelo hace operativas. |
| 10 Seguridad y tenancy | Fija los controles de aislamiento y auditoría que este modelo detalla. |
| 12 Estados | Cada transición consume una decisión de autorización de este modelo. |
| 14 Riesgo y umbrales | La severidad limita la autonomía; la precedencia de políticas se reutiliza. |

## 18. Fuera de alcance

- Elegir proveedor de identidad, protocolo, base de datos o framework.
- Diseñar tablas, APIs, eventos o un enum de implementación.
- Definir números de quorum, importes, plazos o umbrales.
- Implementar MFA, SSO, SCIM, recuperación de cuenta o sesiones.
- Definir el momento de la obligación o la ejecución de pagos.
- Cerrar cualquier punto de [asuntos abiertos](../decisiones/abiertas.md) sin una decisión explícita.
