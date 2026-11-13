import type { MiddlewareHandler } from "hono";
import type { Env } from "./env";

export interface AuthVariables {
  readonly tenantId: string;
  readonly actorId: string;
  readonly roles: readonly string[];
}

export const demoAuth: MiddlewareHandler<{ Bindings: Env; Variables: AuthVariables }> = async (c, next) => {
  if (c.env.DEMO_AUTH_ENABLED === "false") {
    return c.json({ error: "AUTH_NOT_CONFIGURED" }, 401);
  }

  const tenantId = c.req.header("x-tenant-id")?.trim() ?? "";
  const actorId = c.req.header("x-user-id")?.trim() ?? "";
  const roles = (c.req.header("x-roles") ?? "")
    .split(",")
    .map((role) => role.trim())
    .filter((role) => role.length > 0);

  if (tenantId.length === 0 || actorId.length === 0 || roles.length === 0) {
    return c.json({ error: "DEMO_IDENTITY_REQUIRED" }, 401);
  }

  c.set("tenantId", tenantId);
  c.set("actorId", actorId);
  c.set("roles", roles);
  await next();
};
