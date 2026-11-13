import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { SCHEMA_VERSION, requireTenant } from "./index";

const migration = readFileSync(
  fileURLToPath(new URL("../migrations/0001_init.sql", import.meta.url)),
  "utf8"
);

describe("initial schema", () => {
  it("versions the schema", () => {
    expect(SCHEMA_VERSION).toBe(1);
  });

  it("keeps audit events append-only", () => {
    expect(migration).toContain("audit_events_no_update");
    expect(migration).toContain("audit_events_no_delete");
    expect(migration).toContain("audit_events is append-only");
  });

  it("requires a tenant on every business table", () => {
    for (const table of [
      "suppliers",
      "documents",
      "invoices",
      "contracts",
      "budgets",
      "policies",
      "workflows",
      "approvals",
      "findings",
      "audit_events",
      "spend_recommendations"
    ]) {
      const start = migration.indexOf(`CREATE TABLE ${table} (`);
      const end = migration.indexOf("\n);", start);
      const block = migration.slice(start, end);
      expect(block).toContain("tenant_id TEXT NOT NULL");
    }
  });
});

describe("tenant guard", () => {
  it("rejects an empty tenant", () => {
    expect(() => requireTenant(" ")).toThrow("TENANT_REQUIRED");
  });
});
