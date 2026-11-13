import { describe, expect, it } from "vitest";
import { app } from "./app";
import type { Env } from "./env";

const env = {
  ENVIRONMENT: "test",
  DEMO_AUTH_ENABLED: "true"
} as Env;

describe("api", () => {
  it("reports health without identity", async () => {
    const response = await app.request("/api/health", {}, env);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      service: "payerai-api",
      schemaVersion: 1
    });
  });

  it("rejects a request without demo identity", async () => {
    const response = await app.request("/api/me", {}, env);
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "DEMO_IDENTITY_REQUIRED" });
  });

  it("returns the demo identity", async () => {
    const response = await app.request(
      "/api/me",
      {
        headers: {
          "x-tenant-id": "tenant-demo",
          "x-user-id": "user-demo",
          "x-roles": "admin,approver"
        }
      },
      env
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      tenantId: "tenant-demo",
      actorId: "user-demo",
      roles: ["admin", "approver"]
    });
  });
});
