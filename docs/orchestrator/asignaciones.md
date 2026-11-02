# Asignación de skills a orquestadores

Fecha: 2026-11-02. Leídos 353 `SKILL.md` y 287 nombres distintos. El extracto está en `.orchestrator/skills-digest.md`, que no se versiona. Cada orquestador tiene una sola skill. El cuerpo de esa skill manda cuando se invoca. La tarea y el documento maestro mandan si la skill pide implementar, desplegar o elegir un vendor.

No existe una skill de Cloudflare. No asigné skills de Vercel, Render, AWS, MongoDB ni Supabase a la infraestructura: cerrarían una decisión abierta. No asigné `emails`, `analytics` ni `auth`: hablan de marketing, GA4 o login de aplicación, no de facturas ni de proveedores.

| Tarea | Orquestador | Skill | Por qué esta y no otra |
| --- | --- | --- | --- |
| 01 Dominio y estados | `.cursor/agents/dominio-estados.md` | `architect` | Pide el esquema antes del código. La fase de implementar queda fuera de esta tarea. |
| 02 Ingesta | `.cursor/agents/ingesta-documentos.md` | `principle-make-operations-idempotent` | Reenvío, corte a mitad y doble recepción son el problema. |
| 03 Proveedores | `.cursor/agents/proveedores-identidad.md` | `principle-boundary-discipline` | El documento es frontera. No autoriza el pago. |
| 04 Validación | `.cursor/agents/validacion-facturas.md` | `principle-explain-the-number` | Un importe sin límite ni fuente no se informa. No es un benchmark. |
| 05 Workflows | `.cursor/agents/workflows-aprobacion.md` | `principle-separate-before-serializing-shared-state` | Dos aprobadores no escriben el mismo estado. `workflow` fijaría Vercel. |
| 06 Spend | `.cursor/agents/spend-intelligence.md` | `show-me-your-work` | Cada recomendación necesita evidencia, no un ahorro declarado. |
| 07 Autoridad e IA | `.cursor/agents/autoridad-ia.md` | `karpathy-guidelines` | Obliga a mostrar supuestos. No da autoridad al modelo. `build-agents` y `eve` harían lo contrario. |
| 08 Arquitectura | `.cursor/agents/arquitectura-separacion.md` | `how` | Pregunta dónde vive cada responsabilidad. No hay código que explorar. |
| 09 Infra y costo | `.cursor/agents/infraestructura-costo.md` | `figure-it-out` | No hay playbook del vendor correcto. El entregable es la comparación. |
| 10 Seguridad y tenants | `.cursor/agents/seguridad-tenancy.md` | `review-security` | Lanza `security-review` cuando hay diff. Sin diff, no simula el review. |
| 11 Edge cases | `.cursor/agents/edge-cases-pruebas.md` | `interrogate` | Ataca el diseño. No convierte un resumen en prueba. |

Estos orquestadores no están en el `Task` tool hasta que Cursor cargue `.cursor/agents/`. El archivo los define. No los ejecuté: ejecutarlos empezaría el diseño de producto y varias skills piden modelos de pago.
