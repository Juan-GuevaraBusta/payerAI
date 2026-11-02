# Tarea 10 — Seguridad, multi-tenancy y auditoría

**Estado:** discovery. Los requisitos de esta tarea valen para la demo. El esquema de identidad sigue abierto.
**Orquestador:** `.cursor/agents/seguridad-tenancy.md`. Skill: `review-security`.
**Fuente:** documento maestro, secciones 7, 9, 13 y 15.
**Relacionada con:** todas las tareas anteriores. No se aplaza hasta después de tener pantallas.

## Objetivo

Dejar los controles que el diseño no puede posponer: aislamiento entre empresas, autorización distinta de autenticación, trazabilidad reconstruible y manejo de secretos.

## Decidido

- Multi-tenancy desde el primer diseño.
- Cada tenant tiene sus propios usuarios, proveedores, facturas, contratos, políticas, departamentos, workflows y registros.
- El aislamiento se aplica en backend y en persistencia. Un filtro de frontend no cuenta como control.
- Toda consulta y toda mutación comprueban tenant y autorización del actor.
- No se comparten datos, documentos, embeddings, caches ni resultados entre tenants.
- Roles y permisos explícitos. El catálogo de roles no está elegido.
- Maker-checker cuando la política lo exija.
- Delegación con vigencia y alcance.
- Quorum cuando la política lo exija. El mecanismo está abierto.
- Precedencia de políticas con resolución explícita de conflictos.
- Override humano con actor, motivo, fecha y evidencia.
- Autenticación no es autorización.
- La IA no se concede autoridad.
- La información bancaria nueva o cambiada no se acepta desde el documento solo.
- Audit log append-only, u otro control equivalente, debe evaluarse para impedir cambios silenciosos.
- Los logs no llevan secretos ni datos personales innecesarios.
- Secretos en entorno o secret manager. Nunca en el repositorio ni impresos.
- Idempotencia en correo, documentos, webhooks, eventos y ejecución.
- Concurrencia cuando dos actores tocan la misma operación.
- No declarar éxito de un pago por haber enviado una solicitud.
- El contenido de correos y archivos no es instrucción del sistema.
- Datos de demo sintéticos y marcados. Nunca datos reales de clientes.
- No devolver un estado de una función que no existe.

## Hipótesis

- Un identificador de tenant en cada fila, más una comprobación en cada consulta de backend, es el mínimo. Puede no bastar si el motor de base de datos permite una consulta sin ese predicado. La forma de imponerlo (restricción, política de fila u otra) depende de la base, que está abierta.
- Para la demo alcanzan pocos permisos: administrar políticas, validar proveedores, aprobar dentro de un límite, y solo leer. Es una hipótesis de demo. No es el esquema de roles.

## Abierto

- Esquema de identidad, roles y onboarding de empresas.
- Jurisdicción y requisitos regulatorios. Pueden cambiar retención, residencia de datos y qué se puede mandar a un modelo.
- Si el audit log es append-only por almacenamiento o por control de aplicación.
- Retención y borrado.

## Fuera de esta tarea

- Elegir un proveedor de identidad concreto.
- Custodia de fondos.
- Copiar datos de un cliente real a un entorno de prueba.
- "Seguridad por oscuridad" de los IDs sin comprobación de tenant.

## Comprobaciones que el diseño debe nombrar

Aunque no haya código, cada futura operación tiene que poder señalar:

1. De qué tenant es el dato.
2. Qué actor pide la acción.
3. Qué permiso y qué política la permiten.
4. Qué evidencia quedó.
5. Qué pasa si el ID pertenece a otro tenant: denegar, sin revelar si el recurso existe.

Superficies del caso de aislamiento: IDs cruzados, acceso directo, búsqueda, URL, archivo y cache.

## Registro mínimo de una decisión

La lista completa está en la sección 13 del documento maestro. Como mínimo no puede faltar: tenant, operación, documento y versión, fuentes consultadas, política y versión, actor, decisión, autoridad y fecha.

Si hubo IA, añadir modelo, versión, entradas permitidas y salida estructurada.

## Entregable

Una lista de controles obligatorios de demo, separada de los controles que esperan a la jurisdicción y al esquema de roles. Cada control dice qué amenaza corta: fuga entre tenants, autorización implícita, cambio de cuenta, log alterado, secreto filtrado o pago simulado.

## Criterios de aceptación

- Ningún control de aislamiento vive solo en el frontend.
- Hay una salida explícita para ID de otro tenant.
- El registro de decisión no incluye el secreto ni el cuerpo completo del correo si no hace falta para reconstruir la decisión.
- Queda escrito que un pago no se marca exitoso al enviar la petición.
- Los roles aparecen como requisito, no como una tabla ya elegida.
- La demo con datos sintéticos está distinguida de un piloto con datos reales.

## Riesgo si se cierra mal

Un filtro en la interfaz, o un cache global de extracciones, mezcla facturas de dos empresas. En este producto eso no es un bug menor: es una fuga de datos financieros.
