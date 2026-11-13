import type { D1Database, R2Bucket } from "@cloudflare/workers-types";

export interface Env {
  readonly DB: D1Database;
  readonly DOCUMENTS: R2Bucket;
  readonly ENVIRONMENT?: string;
  readonly DEMO_AUTH_ENABLED?: string;
}
