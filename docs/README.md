# Documentación del producto

Estado del repositorio: definición de producto y arquitectura en discovery. No hay código de producto. Estos archivos no son una especificación de implementación ni un backlog de tickets de código.

## Leyenda

| Marca | Significado |
| --- | --- |
| Hecho | Algo ocurrido o una restricción ya registrada. No es validación de mercado. |
| Decisión | Acuerdo adoptado en el documento maestro. No reabrirla sin evidencia nueva. |
| Hipótesis | Supuesto a validar. No es requisito confirmado. |
| Recomendación | Criterio de trabajo. No es una decisión de stack ni de alcance. |
| Abierto | Falta una decisión. No presentarlo como cerrado. |

No inventar estadísticas, entrevistas, clientes, integraciones ni endorsements. La conversación con el CTO de Blinka describe dificultades de clientes de Blinka, no de Blinka como organización ni un respaldo al producto.

## Orden de lectura

1. [Master prompt](../MASTER_PROMPT_FINANCIAL_OPERATIONS.md)
2. [Documento maestro](documento-maestro.md)
3. [Decisiones adoptadas](decisiones/adoptadas.md)
4. [Asuntos abiertos](decisiones/abiertas.md)
5. [Glosario](glosario.md)
6. Tareas de discovery, en el orden de abajo

## Tareas

Cada tarea dice qué debe quedar definido, qué ya está decidido y qué no hay que construir. El entregable de esta fase es criterio escrito, no software.

| # | Tarea | Toca del MVP |
| --- | --- | --- |
| 01 | [Modelo de dominio y estados](tareas/01-modelo-de-dominio-y-estados.md) | Obligación, factura, pago, evidencia |
| 02 | [Ingesta de correo y documentos](tareas/02-ingesta-correo-y-documentos.md) | Entrada del módulo A |
| 03 | [Proveedores: identidad y autorización](tareas/03-proveedores-identidad-y-autorizacion.md) | Alta y reconocimiento |
| 04 | [Validación de facturas](tareas/04-validacion-de-facturas.md) | Módulo A, pasos 2–8 |
| 05 | [Workflows de aprobación](tareas/05-workflows-de-aprobacion.md) | Módulo A, pasos 9–11 |
| 06 | [Spend intelligence](tareas/06-spend-intelligence.md) | Módulo B |
| 07 | [Autoridad, autonomía e IA](tareas/07-autoridad-autonomia-e-ia.md) | L0–L3 y límite de los modelos |
| 08 | [Arquitectura y separación](tareas/08-arquitectura-y-separacion.md) | Módulos conceptuales |
| 09 | [Infraestructura, costo y despliegue](tareas/09-infraestructura-costo-y-despliegue.md) | Preferencia Cloudflare, sin cierre |
| 10 | [Seguridad, multi-tenancy y auditoría](tareas/10-seguridad-multitenancy-y-auditoria.md) | Controles, también en demo |
| 11 | [Edge cases y pruebas](tareas/11-edge-cases-y-pruebas.md) | Casos que el diseño debe cubrir |
| 12 | [Catálogo de estados y transiciones](tareas/12-estados-transiciones.md) | Modelo adoptado; contrato de comportamiento |
| 13 | [Identidad, roles y aprobaciones](tareas/13-identidad-aprobaciones.md) | Modelo adoptado; membresía, permisos, delegación y quorum |
| 14 | [Riesgo, severidad y umbrales](tareas/14-riesgo-severidad-umbrales.md) | Modelo adoptado; señales, severidad y límites de autonomía |
| 15 | [Contratos y presupuestos como evidencia](tareas/15-contratos-presupuestos-evidencia.md) | Modelo adoptado; fuentes, vigencia, vínculo y comparación |
| 16 | [Política de escalamiento de IA](tareas/16-escalamiento-ia.md) | Propuesta; ruta T0–T4, costo, fallback y revisión humana |

## Orquestador

Infraestructura de trabajo en paralelo, separada del producto:

- [Instrucciones para agentes](../AGENTS.md)
- [Contrato de orquestación](../ORCHESTRATOR.md)
- [Asignación de skills](orchestrator/asignaciones.md)
- [Uso](orchestrator/uso.md)
- [Arquitectura](orchestrator/arquitectura.md)
- [Inventario de esta sesión](orchestrator/inventario-sesion.md)
- [Binarios y skills](orchestrator/inventario-entorno.md)

`python3 -m orchestrator product-guard` exige `MASTER_PROMPT_FINANCIAL_OPERATIONS.md` en la raíz y falla si falta o está vacío. El master consolida el contexto de producto para agentes; no sustituye el detalle de `documento-maestro.md` ni el registro de decisiones.

## Forma de trabajo

Antes de una tarea nueva:

1. Leer el documento maestro y la tarea correspondiente.
2. Identificar qué parte de la visión y del MVP toca.
3. Separar requisito confirmado de supuesto.
4. Inspeccionar el repositorio real antes de recomendar cambios. Hoy no hay código de producto.
5. Mirar aislamiento entre empresas, autoridad, costo y trazabilidad cuando apliquen.
6. Proponer el cambio mínimo y sus criterios de aceptación.
7. No programar para producir actividad. Confirmar alcance antes de implementar.

Principio rector: plataforma financiera confiable, explicable y extensible, con la menor complejidad y costo posibles, sin sacrificar autoridad, integridad ni trazabilidad.

## Qué no hacer con estos archivos

- No tratar una hipótesis como requisito.
- No elegir proveedor de correo, base de datos, OCR, modelo de IA ni JEV desde estas tareas. Esos puntos siguen abiertos.
- No añadir Accounts Receivable, nómina, custodia de fondos, transferencias reales ni cancelación automática de suscripciones al MVP.
- No devolver en una demo un estado que sugiera una acción que el sistema no realizó.
- No usar datos reales de clientes. Los datos de demostración, cuando existan, deben ser sintéticos y estar marcados.
