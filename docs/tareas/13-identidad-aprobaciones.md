# Tarea 13 — Identidad, roles y aprobaciones

**Estado:** discovery. Modelo adoptado el 2026-11-09; no implementar.
**Orquestador:** `.cursor/agents/seguridad-tenancy.md`. Skill: `review-security` (leer por ruta si no está registrada).
**Fuente:** documento maestro, secciones 7, 9, 13 y 15; tareas 05, 07, 10 y 12.
**Depende de:** el modelo de dominio, la autoridad, el catálogo de estados y los controles de seguridad. No depende de un proveedor de identidad ni de una base de datos.

## Objetivo

Definir el modelo conceptual de identidad, membresía por tenant, roles, permisos, onboarding, delegación, quorum y precedencia de políticas. El resultado es un contrato de autorización verificable. No es un esquema de base de datos, ni una elección de proveedor de identidad, ni un catálogo cerrado de roles.

## Decidido

- Multi-tenancy desde el diseño; cada tenant tiene sus usuarios, roles, políticas, proveedores, facturas, workflows y registros.
- El aislamiento se impone en backend y persistencia, no en el frontend.
- Autenticación no es autorización.
- Denegar por defecto: si falta tenant, actor, permiso, política o evidencia, no se autoriza.
- Roles y permisos explícitos, con mínimo privilegio.
- Maker-checker cuando la política lo exija.
- Delegación con alcance y vigencia; una delegación vencida o revocada no sirve.
- Quorum configurable cuando la política lo exija; el quórum no alcanzado no es aprobación.
- Precedencia de políticas con resolución explícita de conflictos.
- Override humano con actor, motivo, fecha y evidencia.
- La IA no concede autoridad, no aprueba, no autoriza, no delega y no forma parte de un quorum.
- Ningún cambio material queda cubierto en silencio por una autorización anterior.
- Una misma identidad humana puede pertenecer a varios tenants con roles distintos. La identidad es global; la membresía y los roles son por tenant. Adoptado el 2026-11-09.
- Onboarding del MVP por invitación con administrador inicial verificado; el autoservicio queda abierto. Adoptado el 2026-11-09.

## Hipótesis

- Un conjunto pequeño de arquetipos de rol cubre la demo; el catálogo definitivo y los roles personalizados están abiertos.
- La aprobación automática L2 no es necesaria para la demo.

## Abierto

- Proveedor, protocolo, MFA, recuperación de cuenta y SSO/SCIM.
- Autoservicio frente a invitación; verificación de dominio.
- Catálogo definitivo de roles y si el MVP permite roles personalizados.
- Números de quorum, abstenciones, empates, pesos y suplencias.
- Si una delegación puede delegarse de nuevo y con qué límites.
- Regla exacta de precedencia y prioridad de políticas.
- Si un proceso de servicio puede aprobar operaciones financieras o solo ejecutar transiciones del sistema.
- Si el MVP permite aprobación automática L2 dentro de límites.
- Acceso de soporte a datos de un tenant.
- Jurisdicción, retención y borrado de identidades y auditoría.

## Fuera de esta tarea

- Elegir proveedor de identidad, protocolo, base de datos o framework.
- Diseñar tablas, APIs, eventos o un enum de implementación.
- Definir números de quorum, importes o umbrales.
- Implementar autenticación, MFA, SSO o recuperación de cuenta.
- Definir el momento de la obligación o el ciclo de pago.
- Ejecutar dinero o L3.

## Entregable

`docs/modelo/13-identidad-aprobaciones.md` con:

- conceptos de identidad y membresía por tenant;
- modelo de permisos por acción y alcance;
- arquetipos de rol de referencia, sin catálogo cerrado;
- flujos de onboarding y baja;
- reglas de delegación, segregación y quorum;
- algoritmo conceptual de precedencia de políticas y evaluación de autorización;
- límites de autonomía L0–L3;
- aislamiento multi-tenant y auditoría;
- preguntas abiertas y la decisión de identidad adoptada.

## Criterios de aceptación

- Un actor autenticado sin permiso no completa una acción.
- Un permiso para una acción, monto o tenant no autoriza otra acción, otro monto ni otro tenant.
- Una delegación vencida, revocada o fuera de alcance no autoriza.
- Dos aprobadores distintos no pueden ser el mismo actor contado dos veces.
- Un quorum no alcanzado no se presenta como aprobación.
- Un conflicto de políticas queda explícito; no gana la última evaluada.
- Un cambio de política o evidencia después de aprobar obliga a reevaluar.
- La IA no aparece como principal con permiso de aprobar, delegar ni formar quorum.
- Un ID de otro tenant se deniega sin revelar si existe.
- Toda decisión de autorización deja registro reconstruible.
- El modelo no elige proveedor de identidad, base de datos ni esquema.

## Riesgo si se cierra mal

Un rol implícito, una delegación sin vigencia o un quorum contado dos veces permiten que un actor autenticado apruebe fuera de su autoridad. En este producto eso no es un bug de permisos: es una aprobación financiera sin control.
