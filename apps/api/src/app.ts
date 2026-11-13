import { Hono, type Context } from "hono";
import { z } from "zod";
import { createD1Store, SCHEMA_VERSION } from "@payerai/db";
import {
  InvoiceState,
  asActorId,
  asInvoiceId,
  asSupplierId,
  asTenantId,
  type Store,
  type SyntheticIngestionCommand,
  type TenantContext
} from "@payerai/domain";
import { demoAuth, type AuthVariables } from "./auth";
import type { Env } from "./env";

export interface AppDependencies {
  readonly createStore: (db: Env["DB"]) => Store;
}

const defaultDependencies: AppDependencies = {
  createStore: (db) => createD1Store(db)
};

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const ingestionSchema = z
  .object({
    externalId: z.string().min(1),
    sender: z.string().min(1),
    subject: z.string().min(1),
    receivedAt: z.string().datetime(),
    document: z
      .object({
        filename: z.string().min(1),
        mimeType: z.string().min(1),
        sizeBytes: z.number().int().nonnegative(),
        storageKey: z.string().min(1),
        content: z.string().min(1)
      })
      .strict(),
    invoice: z
      .object({
        number: z.string().min(1),
        issuedOn: dateOnly,
        dueOn: dateOnly,
        amountMinor: z.number().int().positive(),
        currency: z.string().length(3),
        supplier: z
          .object({
            legalName: z.string().min(1),
            displayName: z.string().min(1).optional(),
            taxId: z.string().min(1).optional()
          })
          .strict(),
        lines: z
          .array(
            z
              .object({
                description: z.string().min(1),
                amountMinor: z.number().int().positive(),
                currency: z.string().length(3),
                reference: z.string().min(1).optional()
              })
              .strict()
          )
          .default([])
      })
      .strict()
  })
  .strict();

const toSyntheticCommand = (
  data: z.infer<typeof ingestionSchema>
): SyntheticIngestionCommand => ({
  externalId: data.externalId,
  sender: data.sender,
  subject: data.subject,
  receivedAt: data.receivedAt,
  document: data.document,
  invoice: {
    number: data.invoice.number,
    issuedOn: data.invoice.issuedOn,
    dueOn: data.invoice.dueOn,
    amountMinor: data.invoice.amountMinor,
    currency: data.invoice.currency,
    supplier: {
      legalName: data.invoice.supplier.legalName,
      ...(data.invoice.supplier.displayName === undefined
        ? {}
        : { displayName: data.invoice.supplier.displayName }),
      ...(data.invoice.supplier.taxId === undefined
        ? {}
        : { taxId: data.invoice.supplier.taxId })
    },
    lines: data.invoice.lines.map((line) => ({
      description: line.description,
      amountMinor: line.amountMinor,
      currency: line.currency,
      ...(line.reference === undefined ? {} : { reference: line.reference })
    }))
  }
});

const tenantContext = (c: Context<{ Bindings: Env; Variables: AuthVariables }>): TenantContext => ({
  tenantId: asTenantId(c.get("tenantId")),
  actorId: asActorId(c.get("actorId")),
  roles: c.get("roles")
});

export const createApp = (dependencies: AppDependencies = defaultDependencies) => {
  const app = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

  app.get("/api/health", (c) =>
    c.json({
      ok: true,
      service: "payerai-api",
      schemaVersion: SCHEMA_VERSION,
      environment: c.env.ENVIRONMENT ?? "unknown"
    })
  );

  app.use("/api/*", demoAuth);

  app.get("/api/me", (c) =>
    c.json({
      tenantId: c.get("tenantId"),
      actorId: c.get("actorId"),
      roles: c.get("roles")
    })
  );

  app.get("/api/invoices", async (c) => {
    const state = c.req.query("state");
    if (state !== undefined && !Object.values(InvoiceState).includes(state as InvoiceState)) {
      return c.json({ error: "INVALID_STATE" }, 400);
    }
    const supplierId = c.req.query("supplierId");
    const store = dependencies.createStore(c.env.DB);
    const invoices = await store.listInvoices(tenantContext(c), {
      ...(state === undefined ? {} : { state: state as InvoiceState }),
      ...(supplierId === undefined ? {} : { supplierId: asSupplierId(supplierId) })
    });
    return c.json({ invoices });
  });

  app.post("/api/invoices/ingest", async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = ingestionSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "INVALID_INGESTION", issues: parsed.error.issues }, 400);
    }

    const store = dependencies.createStore(c.env.DB);
    const result = await store.ingestSyntheticInvoice(
      tenantContext(c),
      toSyntheticCommand(parsed.data)
    );
    if (!result.ok) {
      return c.json({ error: result.reason }, 409);
    }
    return c.json({ invoice: result.invoice, created: result.created }, result.created ? 201 : 200);
  });

  app.get("/api/invoices/:id", async (c) => {
    const store = dependencies.createStore(c.env.DB);
    const invoice = await store.getInvoice(tenantContext(c), asInvoiceId(c.req.param("id")));
    if (invoice === null) {
      return c.json({ error: "INVOICE_NOT_FOUND" }, 404);
    }
    return c.json({ invoice });
  });

  app.get("/api/audit", async (c) => {
    const store = dependencies.createStore(c.env.DB);
    const events = await store.listAudit(tenantContext(c), c.req.query("entityId"));
    return c.json({ events });
  });

  app.post("/api/dev/seed", async (c) => {
    if (c.env.ENVIRONMENT === "production") {
      return c.json({ error: "NOT_AVAILABLE" }, 404);
    }
    const store = dependencies.createStore(c.env.DB);
    await store.seedDemo(tenantContext(c));
    return c.json({ ok: true });
  });

  app.notFound((c) => c.json({ error: "NOT_FOUND" }, 404));

  app.onError((error, c) => {
    if (error.message === "SEED_FORBIDDEN") {
      return c.json({ error: "SEED_FORBIDDEN" }, 403);
    }
    console.error(error);
    return c.json({ error: "INTERNAL_ERROR" }, 500);
  });

  return app;
};

export const app = createApp();
