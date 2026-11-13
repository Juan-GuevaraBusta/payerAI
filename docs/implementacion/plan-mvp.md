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

| Lane | Resultado | Estado |
| --- | --- | --- |
| 0 Fundación | workspace, API mínima, web mínima, CI y decisiones de demo | Hecho |
| 1 Dominio y D1 | estados, invariantes, migraciones, repositorios y auditoría | Hecho |
| 2 Ingesta | carga manual, evento sintético, hash, versiones e idempotencia | Hecho |
| 3 Validación | extracción por fixtures, duplicado, contrato, presupuesto y hallazgos | Pendiente |
| 4 Workflow | decisión, autorización, quorum y auditoría | Pendiente |
| 5 Frontend | inbox, detalle, aprobación, auditoría y spend | Pendiente |
| 6 Spend | recurrencia y ahorro potencial con evidencia | Pendiente |
| 7 Hardening | aislamiento, concurrencia, timeout, seed y smoke E2E | Pendiente |

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

D1 local y seed de demo:

```bash
pnpm --filter @payerai/api exec wrangler d1 migrations apply payerai-demo --local
pnpm --filter @payerai/api dev
curl -X POST http://localhost:8787/api/dev/seed \
  -H 'x-tenant-id: tenant-demo' \
  -H 'x-user-id: user-tenant-demo-admin' \
  -H 'x-roles: admin,approver'
```

Ingesta sintética:

```bash
curl -X POST http://localhost:8787/api/invoices/ingest \
  -H 'content-type: application/json' \
  -H 'x-tenant-id: tenant-demo' \
  -H 'x-user-id: user-tenant-demo-admin' \
  -H 'x-roles: admin,approver' \
  -d '{
    "externalId": "mail-demo-002",
    "sender": "billing@acme.example",
    "subject": "Factura INV-002",
    "receivedAt": "2026-01-15T10:00:00.000Z",
    "document": {
      "filename": "factura-002.pdf",
      "mimeType": "application/pdf",
      "sizeBytes": 2048,
      "storageKey": "demo/tenant-demo/factura-002.pdf",
      "content": "Factura sintética INV-002"
    },
    "invoice": {
      "number": "INV-002",
      "issuedOn": "2026-01-10",
      "dueOn": "2026-02-10",
      "amountMinor": 125000,
      "currency": "USD",
      "supplier": {
        "legalName": "Acme Servicios S.A.",
        "taxId": "TAX-ACME-001"
      },
      "lines": [
        { "description": "Servicios", "amountMinor": 125000, "currency": "USD" }
      ]
    }
  }'
```

La ingesta es idempotente por `externalId`; repetir el mismo payload devuelve la misma factura y un payload distinto con la misma clave devuelve `409 IDEMPOTENCY_CONFLICT`.
