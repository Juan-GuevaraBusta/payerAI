import { readFileSync } from "node:fs";
import { Miniflare } from "miniflare";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  asActorId,
  asInvoiceId,
  asTenantId,
  type SyntheticIngestionCommand,
  type TenantContext
} from "@payerai/domain";
import { createD1Store } from "./store";

const schema = readFileSync(new URL("../migrations/0001_init.sql", import.meta.url), "utf8");

const splitSql = (sql: string): readonly string[] => {
  const statements: string[] = [];
  let current = "";
  let inTrigger = false;
  let beginDepth = 0;

  for (const token of sql.split(/(\s+)/)) {
    current += token;
    const keyword = token.replace(/[^A-Za-z_]/g, "").toUpperCase();
    if (keyword === "TRIGGER") {
      inTrigger = true;
    }
    if (inTrigger && keyword === "BEGIN") {
      beginDepth += 1;
    }
    if (inTrigger && keyword === "END") {
      beginDepth -= 1;
    }
    if (token.includes(";") && (!inTrigger || beginDepth === 0)) {
      const statement = current.trim();
      if (statement.length > 0) {
        statements.push(statement);
      }
      current = "";
      inTrigger = false;
    }
  }

  const trailing = current.trim();
  if (trailing.length > 0) {
    statements.push(trailing);
  }
  return statements;
};

let mf: Miniflare;
let store: ReturnType<typeof createD1Store>;

const context = (tenantId: string, roles: readonly string[] = ["admin"]): TenantContext => ({
  tenantId: asTenantId(tenantId),
  actorId: asActorId(`user-${tenantId}-admin`),
  roles
});

const ingestion = (
  externalId: string,
  overrides: Partial<SyntheticIngestionCommand> = {}
): SyntheticIngestionCommand => ({
  externalId,
  sender: "billing@acme.example",
  subject: "Factura sintética",
  receivedAt: "2026-01-15T10:00:00.000Z",
  document: {
    filename: "factura.pdf",
    mimeType: "application/pdf",
    sizeBytes: 1024,
    storageKey: `demo/${externalId}/factura.pdf`,
    content: `Factura ${externalId}`
  },
  invoice: {
    number: `INV-${externalId}`,
    issuedOn: "2026-01-10",
    dueOn: "2026-02-10",
    amountMinor: 125000,
    currency: "USD",
    supplier: { legalName: "Nuevo Proveedor S.A.", taxId: `TAX-${externalId}` },
    lines: [{ description: "Servicio", amountMinor: 125000, currency: "USD" }]
  },
  ...overrides
});

const ensureTenant = async (tenantId: string): Promise<void> => {
  const db = await mf.getD1Database("DB");
  await db
    .prepare("INSERT OR IGNORE INTO tenants (id, name, created_at) VALUES (?, ?, ?)")
    .bind(tenantId, tenantId, "2026-01-15T10:00:00.000Z")
    .run();
};

beforeAll(async () => {
  mf = new Miniflare({
    modules: true,
    script: "export default { fetch() { return new Response('ok') } }",
    d1Databases: ["DB"]
  });
  const db = await mf.getD1Database("DB");
  for (const statement of splitSql(schema)) {
    await db.prepare(statement).run();
  }
  store = createD1Store(db);
});

afterAll(async () => {
  await mf.dispose();
});

describe("d1 store", () => {
  it("seeds the demo tenant idempotently", async () => {
    await store.seedDemo(context("tenant-demo"));
    await store.seedDemo(context("tenant-demo"));

    const invoices = await store.listInvoices(context("tenant-demo"));
    expect(invoices).toHaveLength(1);
    expect(invoices[0]).toMatchObject({
      id: "invoice-tenant-demo-001",
      number: "INV-tenant-demo-001",
      state: "READY_FOR_DECISION",
      amount: { amountMinor: 4850000, currency: "USD" }
    });
  });

  it("returns invoice detail with findings and frozen workflow", async () => {
    const invoice = await store.getInvoice(
      context("tenant-demo"),
      asInvoiceId("invoice-tenant-demo-001")
    );

    expect(invoice).not.toBeNull();
    expect(invoice?.supplier.displayName).toBe("Acme");
    expect(invoice?.findings.map((finding) => finding.severity)).toEqual(["HIGH", "MEDIUM"]);
    expect(invoice?.workflow?.policy.rules).toMatchObject({ requireContract: true });
    expect(invoice?.workflow?.budget).toMatchObject({ amountMinor: 5000000 });
  });

  it("keeps tenants isolated", async () => {
    await store.seedDemo(context("tenant-other"));

    const demoInvoices = await store.listInvoices(context("tenant-demo"));
    const otherInvoices = await store.listInvoices(context("tenant-other"));
    expect(demoInvoices.map((invoice) => invoice.id)).toEqual(["invoice-tenant-demo-001"]);
    expect(otherInvoices.map((invoice) => invoice.id)).toEqual(["invoice-tenant-other-001"]);

    const crossTenant = await store.getInvoice(
      context("tenant-demo"),
      asInvoiceId("invoice-tenant-other-001")
    );
    expect(crossTenant).toBeNull();
  });

  it("lists audit events for one tenant", async () => {
    const events = await store.listAudit(context("tenant-demo"));
    expect(events.map((event) => event.eventType)).toEqual([
      "FINDINGS_OPENED",
      "INVOICE_REGISTERED"
    ]);
    expect(events.every((event) => event.tenantId === "tenant-demo")).toBe(true);
  });

  it("ingests a synthetic invoice with a detected supplier", async () => {
    await ensureTenant("tenant-ingest");

    const result = await store.ingestSyntheticInvoice(context("tenant-ingest"), ingestion("ext-1"));
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.created).toBe(true);
    expect(result.invoice).toMatchObject({
      number: "INV-ext-1",
      state: "REGISTERED",
      amount: { amountMinor: 125000, currency: "USD" }
    });

    const detail = await store.getInvoice(context("tenant-ingest"), result.invoice.id);
    expect(detail?.supplier.status).toBe("DETECTED");
    expect(detail?.document.contentHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("returns the existing invoice for a repeated ingestion", async () => {
    const command = ingestion("ext-2");
    const first = await store.ingestSyntheticInvoice(context("tenant-ingest"), command);
    const second = await store.ingestSyntheticInvoice(context("tenant-ingest"), command);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (!first.ok || !second.ok) {
      return;
    }
    expect(second.created).toBe(false);
    expect(second.invoice.id).toBe(first.invoice.id);
  });

  it("rejects the same idempotency key with a different payload", async () => {
    const command = ingestion("ext-3");
    await store.ingestSyntheticInvoice(context("tenant-ingest"), command);

    const conflict = await store.ingestSyntheticInvoice(
      context("tenant-ingest"),
      ingestion("ext-3", { subject: "Otro asunto" })
    );
    expect(conflict).toEqual({ ok: false, reason: "IDEMPOTENCY_CONFLICT" });
  });

  it("keeps ingested invoices isolated by tenant", async () => {
    await ensureTenant("tenant-ingest-other");
    const first = await store.ingestSyntheticInvoice(context("tenant-ingest"), ingestion("ext-4"));
    const second = await store.ingestSyntheticInvoice(
      context("tenant-ingest-other"),
      ingestion("ext-4")
    );

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (!first.ok || !second.ok) {
      return;
    }
    expect(second.created).toBe(true);
    expect(second.invoice.id).not.toBe(first.invoice.id);
    expect(second.invoice.tenantId).toBe("tenant-ingest-other");
  });

  it("rejects seed without an admin or service role", async () => {
    await expect(store.seedDemo(context("tenant-viewer", ["viewer"]))).rejects.toThrow(
      "SEED_FORBIDDEN"
    );
  });

  it("keeps audit events append-only", async () => {
    const db = await mf.getD1Database("DB");
    await expect(
      db.prepare("UPDATE audit_events SET event_type = 'TAMPERED' WHERE id = ?")
        .bind("audit-tenant-demo-registered")
        .run()
    ).rejects.toThrow(/append-only/);
  });
});
