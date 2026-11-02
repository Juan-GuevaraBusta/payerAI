# Tarea 03 — Proveedores: identidad y autorización

**Estado:** discovery. El modelo híbrido ya está decidido. El flujo concreto no.
**Orquestador:** `.cursor/agents/proveedores-identidad.md`. Skill: `principle-boundary-discipline`.
**Fuente:** documento maestro, secciones 5.2, 7 y 13.
**Depende de:** [modelo de dominio](01-modelo-de-dominio-y-estados.md).

## Objetivo

Separar reconocimiento, alta, riesgo y autorización de pago. Un proveedor visto en una factura no queda habilitado para cobrar.

## Decidido

- Modelo híbrido.
- Proveedor existente: reconocimiento automático solo si la coincidencia con identificadores y atributos verificados es suficiente.
- Proveedor nuevo: se puede detectar y extraer; identidad, riesgo y autorización son previas a habilitarlo.
- Casos ambiguos escalan. No se resuelven por parecido de nombre.
- Ambigüedad nombrada: nombre comercial distinto de la razón social, homónimos, identificadores inconsistentes, datos bancarios modificados.
- Identificar no autoriza el pago.
- Cuenta bancaria nueva o modificada: control reforzado. Una factura o un correo no bastan para aceptarla.

## Hipótesis

- Los identificadores fiscales o de registro serán la señal principal de coincidencia, y el nombre será solo apoyo. Es razonable y reversible. No está medido con documentos reales.
- El departamento de procurement o finanzas será quien habilite proveedores nuevos. El rol exacto está abierto.

## Abierto

- Qué identificadores cuentan como verificados, por jurisdicción. Depende del mercado, también abierto.
- Umbral numérico de coincidencia. No inventar un score.
- Quién puede habilitar, y si hace falta más de una persona.
- Cómo se revoca una autorización ya dada.
- Integración con listas de riesgo o bancos. Fuera del MVP si implica servicios de pago o datos no disponibles.

## Fuera de esta tarea

- Verificar cuentas contra un banco real.
- Dar de alta al proveedor en un ERP.
- Autorizar el pago de su factura en el mismo paso que el alta.
- Fusionar dos proveedores por nombre parecido sin escalar.

## Estados que no se pueden mezclar

Usar el glosario. El diseño necesita una respuesta distinta para cada fila:

| Situación | Resultado esperado |
| --- | --- |
| Identificadores verificados coinciden con un proveedor habilitado | Reconocer. Seguir validación de la factura. |
| Solo coincide el nombre comercial | No reconocer como identidad. Escalar. |
| No hay proveedor previo | Extraer datos. Dejar no habilitado. Pedir validación de identidad, riesgo y autorización. |
| Mismo nombre, identificadores distintos | Escalar. No fusionar. |
| Misma identidad, cuenta bancaria distinta a la registrada | No actualizar la cuenta. Control reforzado. |
| Proveedor reconocido, factura por encima de política | El reconocimiento no aprueba el pago. |

## Entregable

Una matriz de decisión de proveedores, con las cinco situaciones de identidad separadas y el escalamiento de los casos ambiguos. Sin umbrales numéricos inventados.

## Criterios de aceptación

- Ningún camino va de "nombre parecido" a "puede cobrar".
- Un cambio de cuenta no se aplica por extracción automática.
- El proveedor nuevo tiene un estado visible de no habilitado hasta la autorización.
- La matriz no usa un puntaje de modelo como única condición de identidad.

## Riesgo si se cierra mal

El fraude de desvío de pago entra por un cambio de cuenta en un PDF. Tratar la extracción como alta autorizada rompe el control que esta tarea existe para proteger.
