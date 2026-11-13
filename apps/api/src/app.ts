import { Hono, type Context } from "hono";
import { createD1Store, SCHEMA_VERSION } from "@payerai/db";
import {
  InvoiceState,
  asActorId,
  asInvoiceId,
  asSupplierId,
  asTenantId,
  type Store,
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
