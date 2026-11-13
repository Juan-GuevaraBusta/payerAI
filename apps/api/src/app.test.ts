import { describe, expect, it } from "vitest";
import {
  InvoiceState,
  Severity,
  WorkflowState,
  asActorId,
  asAuditEventId,
  asBudgetId,
  asDocumentId,
  asInvoiceId,
  asPolicyId,
  asSupplierId,
  asTenantId,
  asWorkflowId,
  type Invoice,
  type InvoiceDetail,
  type Store,
  type TenantContext
} from "@payerai/domain";
import { createApp } from "./app";
import type { Env } from "./env";

const env = {
  ENVIRONMENT: "test",
  DEMO_AUTH_ENABLED: "true"
} as Env;

const invoice = (tenantId: string): Invoice => ({
  id: asInvoiceId(`invoice-${tenantId}-001`),
  tenantId: asTenantId(tenantId),
  documentId: asDocumentId(`document-${tenantId}-001`),
  supplierId: asSupplierId(`supplier-${tenantId}-acme`),
  number: `INV-${tenantId}-001`,
  issuedOn: "2026-01-10",
  dueOn: "2026-02-10",
  amount: { amountMinor: 4850000, currency: "USD" },
  state: InvoiceState.READY_FOR_DECISION,
  version: 1,
  createdAt: "2026-01-15T10:00:00.000Z",
  updatedAt: "2026-01-15T10:05:00.000Z"
});

const detail = (tenantId: string): InvoiceDetail => ({
  ...invoice(tenantId),
  supplier: {
    id: asSupplierId(`supplier-${tenantId}-acme`),
    tenantId: asTenantId(tenantId),
    legalName: "Acme Servicios S.A.",
    displayName: "Acme",
    taxId: "TAX-ACME-001",
    status: "ACTIVE",
    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: "2026-01-15T10:05:00.000Z"
  },
  document: {
    id: asDocumentId(`document-${tenantId}-001`),
    tenantId: asTenantId(tenantId),
    messageId: `message-${tenantId}-001`,
    contentHash: `hash-document-${tenantId}-001`,
    filename: "factura-001.pdf",
    mimeType: "application/pdf",
    sizeBytes: 2048,
    storageKey: `demo/${tenantId}/factura-001.pdf`,
    state: "PARSED",
    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: "2026-01-15T10:05:00.000Z"
  },
  findings: [
    {
      id: `finding-${tenantId}-duplicate`,
      tenantId: asTenantId(tenantId),
      invoiceId: asInvoiceId(`invoice-${tenantId}-001`),
      type: "DUPLICATE_SUSPECTED",
      severity: Severity.HIGH,
      status: "OPEN",
      evidence: { match: "INV-ACME-0009" },
      createdAt: "2026-01-15T10:00:00.000Z"
    }
  ],
  workflow: {
    id: asWorkflowId(`workflow-${tenantId}-001`),
    tenantId: asTenantId(tenantId),
    invoiceId: asInvoiceId(`invoice-${tenantId}-001`),
    state: WorkflowState.IN_PROGRESS,
    policy: {
      policyId: asPolicyId(`policy-${tenantId}-standard`),
      version: 1,
      rules: { requireContract: true }
    },
    budget: {
      budgetId: asBudgetId(`budget-${tenantId}-ops-2026`),
      version: 1,
      amountMinor: 5000000,
      currency: "USD",
      consumedMinor: 1200000
    },
    startedAt: "2026-01-15T10:00:00.000Z",
    closedAt: null
  }
});

const createFakeStore = (options: { seedError?: Error } = {}): Store & {
  readonly calls: TenantContext[];
} => {
  const calls: TenantContext[] = [];
  return {
    calls,
    listInvoices: async (context) => {
      calls.push(context);
      return context.tenantId === "tenant-demo" ? [invoice("tenant-demo")] : [];
    },
    getInvoice: async (context, id) => {
      calls.push(context);
      return context.tenantId === "tenant-demo" && id === "invoice-tenant-demo-001"
        ? detail("tenant-demo")
        : null;
    },
    listAudit: async (context) => {
      calls.push(context);
      return [
        {
          id: asAuditEventId(`audit-${context.tenantId}-registered`),
          tenantId: context.tenantId,
          entityType: "invoice",
          entityId: `invoice-${context.tenantId}-001`,
          eventType: "INVOICE_REGISTERED",
          actorId: asActorId("user-demo-admin"),
          payload: { source: "synthetic-email" },
          createdAt: "2026-01-15T10:00:00.000Z"
        }
      ];
    },
    seedDemo: async (context) => {
      calls.push(context);
      if (options.seedError !== undefined) {
        throw options.seedError;
      }
    },
    ingestSyntheticInvoice: async (context, command) => {
      calls.push(context);
      if (command.externalId === "conflict") {
        return { ok: false, reason: "IDEMPOTENCY_CONFLICT" };
      }
      return { ok: true, invoice: invoice(context.tenantId), created: true };
    }
  };
};

const headers = (tenantId = "tenant-demo", roles = "admin,approver") => ({
  "x-tenant-id": tenantId,
  "x-user-id": `user-${tenantId}-admin`,
  "x-roles": roles
});

describe("api", () => {
  it("reports health without identity", async () => {
    const app = createApp({ createStore: () => createFakeStore() });
    const response = await app.request("/api/health", {}, env);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      service: "payerai-api",
      schemaVersion: 1
    });
  });

  it("rejects a request without demo identity", async () => {
    const app = createApp({ createStore: () => createFakeStore() });
    const response = await app.request("/api/me", {}, env);
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "DEMO_IDENTITY_REQUIRED" });
  });

  it("returns the demo identity", async () => {
    const app = createApp({ createStore: () => createFakeStore() });
    const response = await app.request("/api/me", { headers: headers() }, env);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      tenantId: "tenant-demo",
      actorId: "user-tenant-demo-admin",
      roles: ["admin", "approver"]
    });
  });

  it("lists only invoices from the request tenant", async () => {
    const store = createFakeStore();
    const app = createApp({ createStore: () => store });

    const demoResponse = await app.request("/api/invoices", { headers: headers() }, env);
    expect(demoResponse.status).toBe(200);
    await expect(demoResponse.json()).resolves.toMatchObject({
      invoices: [{ id: "invoice-tenant-demo-001" }]
    });

    const otherResponse = await app.request(
      "/api/invoices",
      { headers: headers("tenant-other", "admin") },
      env
    );
    expect(otherResponse.status).toBe(200);
    await expect(otherResponse.json()).resolves.toEqual({ invoices: [] });
    expect(store.calls.map((context) => context.tenantId)).toEqual([
      "tenant-demo",
      "tenant-other"
    ]);
  });

  it("returns invoice detail or not found", async () => {
    const app = createApp({ createStore: () => createFakeStore() });
    const found = await app.request(
      "/api/invoices/invoice-tenant-demo-001",
      { headers: headers() },
      env
    );
    expect(found.status).toBe(200);
    await expect(found.json()).resolves.toMatchObject({
      invoice: { id: "invoice-tenant-demo-001", findings: [{ severity: "HIGH" }] }
    });

    const missing = await app.request(
      "/api/invoices/invoice-tenant-demo-999",
      { headers: headers() },
      env
    );
    expect(missing.status).toBe(404);
    await expect(missing.json()).resolves.toEqual({ error: "INVOICE_NOT_FOUND" });
  });

  it("ingests a synthetic invoice in the request tenant", async () => {
    const store = createFakeStore();
    const app = createApp({ createStore: () => store });
    const response = await app.request(
      "/api/invoices/ingest",
      {
        method: "POST",
        headers: { ...headers(), "content-type": "application/json" },
        body: JSON.stringify({
          externalId: "ext-001",
          sender: "billing@acme.example",
          subject: "Factura INV-001",
          receivedAt: "2026-01-15T10:00:00.000Z",
          document: {
            filename: "factura-001.pdf",
            mimeType: "application/pdf",
            sizeBytes: 2048,
            storageKey: "demo/tenant-demo/factura-001.pdf",
            content: "Factura sintética"
          },
          invoice: {
            number: "INV-001",
            issuedOn: "2026-01-10",
            dueOn: "2026-02-10",
            amountMinor: 100000,
            currency: "USD",
            supplier: { legalName: "Acme Servicios S.A.", taxId: "TAX-ACME-001" },
            lines: [
              { description: "Servicios", amountMinor: 100000, currency: "USD" }
            ]
          }
        })
      },
      env
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      created: true,
      invoice: { id: "invoice-tenant-demo-001" }
    });
    expect(store.calls.at(-1)?.tenantId).toBe("tenant-demo");
  });

  it("rejects an invalid ingestion payload", async () => {
    const app = createApp({ createStore: () => createFakeStore() });
    const response = await app.request(
      "/api/invoices/ingest",
      {
        method: "POST",
        headers: { ...headers(), "content-type": "application/json" },
        body: JSON.stringify({ externalId: "ext-001" })
      },
      env
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: "INVALID_INGESTION" });
  });

  it("returns a conflict when the idempotency key changes payload", async () => {
    const app = createApp({ createStore: () => createFakeStore() });
    const response = await app.request(
      "/api/invoices/ingest",
      {
        method: "POST",
        headers: { ...headers(), "content-type": "application/json" },
        body: JSON.stringify({
          externalId: "conflict",
          sender: "billing@acme.example",
          subject: "Factura",
          receivedAt: "2026-01-15T10:00:00.000Z",
          document: {
            filename: "factura.pdf",
            mimeType: "application/pdf",
            sizeBytes: 1,
            storageKey: "demo/factura.pdf",
            content: "x"
          },
          invoice: {
            number: "INV-001",
            issuedOn: "2026-01-10",
            dueOn: "2026-02-10",
            amountMinor: 1,
            currency: "USD",
            supplier: { legalName: "Acme" }
          }
        })
      },
      env
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ error: "IDEMPOTENCY_CONFLICT" });
  });

  it("seeds only when the demo is not production", async () => {
    const app = createApp({ createStore: () => createFakeStore() });
    const response = await app.request("/api/dev/seed", { method: "POST", headers: headers() }, env);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });

    const production = await app.request(
      "/api/dev/seed",
      { method: "POST", headers: headers() },
      { ...env, ENVIRONMENT: "production" } as Env
    );
    expect(production.status).toBe(404);
  });

  it("rejects seed for a non-admin actor", async () => {
    const app = createApp({
      createStore: () => createFakeStore({ seedError: new Error("SEED_FORBIDDEN") })
    });
    const response = await app.request(
      "/api/dev/seed",
      { method: "POST", headers: headers("tenant-demo", "viewer") },
      env
    );
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "SEED_FORBIDDEN" });
  });
});
