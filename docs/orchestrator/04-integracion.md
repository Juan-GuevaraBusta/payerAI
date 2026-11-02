# Fase 10 — Push y merge a la rama principal

El orquestador sube ramas y fusiona trabajo completado sin esperar a que terminen todos los agentes. La integración es incremental y serializada. Un solo proceso fusiona a la vez.

Comprueba el nombre real de la rama por defecto antes de operar. En este documento, "rama principal" es esa rama comprobada.

## 13.1 Push de branches

Cada cambio se pushea, aunque sea de una línea. El merge local no cierra la tarea.

Debes pushear la rama de trabajo y, tras el merge, la rama principal, cuando:

- El remote está configurado y autenticado.
- No se publican secretos, datos sensibles ni archivos locales.
- La rama y el commit corresponden a una tarea identificada.
- No se sobrescriben cambios remotos ajenos.

No hagas force-push. Si el push falla por divergencia o permisos, investiga. No fuerces.

## 13.2 Integración secuencial

Cuando una rama termine y pase los gates:

1. Actualiza la referencia de la rama principal de forma segura.
2. Integra la rama en un orden compatible con sus dependencias.
3. Resuelve conflictos con cuidado. No elijas automáticamente una versión si se pierde lógica.
4. Ejecuta los tests relevantes sobre el resultado integrado.
5. Haz push de la actualización de la rama principal, o merge mediante PR, según las reglas del repositorio.
6. Verifica el SHA remoto final.
7. Continúa con la siguiente rama.

Nunca permitas que dos procesos fusionen a la vez sobre la rama principal. Usa una cola de integración serializada.

## 13.3 Qué puede auto-mergearse

El orquestador puede completar el merge de cambios de riesgo `bajo` o `medio` cuando:

- La tarea estaba claramente delimitada.
- El diff fue revisado.
- Los checks requeridos pasaron.
- No hay conflictos, o se resolvieron de forma explícita.
- La política de la rama y del repositorio lo permite.
- Existe autorización del usuario para el modo de integración automática.

Para cambios de riesgo `alto` o `crítico`, prepara branch y PR y solicita revisión humana antes del merge.

Se consideran de riesgo alto o crítico, como mínimo:

- Autenticación, autorización, permisos o segregación de funciones.
- Aislamiento entre tenants o acceso a datos y documentos.
- Reglas que puedan aprobar o rechazar pagos.
- Instrucciones de pago, ejecución bancaria, conciliación o ledger.
- Manejo de cuentas o datos bancarios.
- Secretos, cifrado, llaves o controles de seguridad.
- Eliminación, migración o transformación irreversible de datos.
- Cambios de infraestructura que puedan generar cargos o exponer servicios.

No desactives branch protection, required reviews, CI ni reglas del repositorio para facilitar un merge. Si GitHub exige PR o aprobación, usa ese flujo. No lo evadas.

## 13.4 Nunca hacer

- `git push --force` o variantes.
- `git reset --hard` sobre trabajo no preservado.
- `git clean -fd` sin revisión y sin permiso.
- Merge de una rama sin revisar el diff y los checks.
- Merge de ramas que aún están siendo modificadas.
- Ocultar conflictos o tests fallidos.
- Desplegar automáticamente a producción como consecuencia de un merge, sin autorización explícita.

Los agentes hijos no ejecutan esta fase. Solo el orquestador, o el integrador designado, integra.
