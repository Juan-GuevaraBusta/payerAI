# Plan de implementación del MVP

Objetivo: una demo local con datos sintéticos que registre el ciclo de cuentas por pagar sin mover dinero. No implementa `Execution`.

## Stack

- TypeScript estricto y `pnpm` workspaces.
- Cloudflare Workers, D1 y R2.
- Hono para la API y Zod para validar entradas.
- React y Vite para la interfaz.
- Vitest para pruebas; Playwright para el smoke E2E.

## Estructura

```text
apps/api          Worker HTTP
apps/web          interfaz React
packages/domain   tipos, estados y reglas puras
packages/db       migraciones D1 y repositorios
```

## Lanes

| Lane | Resultado |
| --- | --- |
| 0 Fundación | workspace, API mínima, web mínima, CI y decisiones de demo |
| 1 Dominio y D1 | estados, invariantes, migraciones, repositorios y auditoría |
| 2 Ingesta | carga manual, evento sintético, hash, versiones e idempotencia |
| 3 Validación | extracción por fixtures, duplicado, contrato, presupuesto y hallazgos |
| 4 Workflow | decisión, autorización, quorum y auditoría |
| 5 Frontend | inbox, detalle, aprobación, auditoría y spend |
| 6 Spend | recurrencia y ahorro potencial con evidencia |
| 7 Hardening | aislamiento, concurrencia, timeout, seed y smoke E2E |

## Reglas de implementación

- Toda tabla de negocio lleva `tenant_id`.
- Ninguna consulta se ejecuta sin contexto de tenant.
- La política y el presupuesto se congelan al iniciar el workflow.
- Un evento duplicado no crea una segunda operación.
- Un timeout no se presenta como pago fallido ni exitoso.
- La IA no concede autoridad.
- El workflow termina en aprobado, rechazado o pendiente; nunca en enviado.
- Los datos de demo son sintéticos.

## Comandos

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
bash scripts/ci.sh
```
