import { Hono } from "hono";
import { SCHEMA_VERSION } from "@payerai/db";
import { demoAuth, type AuthVariables } from "./auth";
import type { Env } from "./env";

export const createApp = () => {
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

  app.notFound((c) => c.json({ error: "NOT_FOUND" }, 404));

  app.onError((error, c) => {
    console.error(error);
    return c.json({ error: "INTERNAL_ERROR" }, 500);
  });

  return app;
};

export const app = createApp();
