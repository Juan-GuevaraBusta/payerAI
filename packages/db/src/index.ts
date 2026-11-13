import type { TenantId } from "@payerai/domain";

export const SCHEMA_VERSION = 1;

export interface D1Result<T> {
  readonly results: readonly T[];
  readonly success: boolean;
  readonly meta: Readonly<Record<string, unknown>>;
}

export interface D1PreparedStatement {
  bind(...values: readonly unknown[]): D1PreparedStatement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<D1Result<T>>;
  run(): Promise<D1Result<unknown>>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T>(statements: readonly D1PreparedStatement[]): Promise<readonly D1Result<T>[]>;
  exec(query: string): Promise<unknown>;
}

export const nowIso = (): string => new Date().toISOString();

export const newId = (): string => crypto.randomUUID();

export const tenantKey = (tenantId: TenantId): string => tenantId;

export const json = (value: unknown): string => JSON.stringify(value);

export const parseJson = <T>(value: string): T => JSON.parse(value) as T;

export interface RepositoryContext {
  readonly db: D1Database;
  readonly tenantId: TenantId;
  readonly now: () => string;
  readonly id: () => string;
}

export const createRepositoryContext = (
  db: D1Database,
  tenantId: TenantId,
  options: { now?: () => string; id?: () => string } = {}
): RepositoryContext => ({
  db,
  tenantId,
  now: options.now ?? nowIso,
  id: options.id ?? newId
});

export const requireTenant = (tenantId: string): TenantId => {
  if (tenantId.trim().length === 0) {
    throw new Error("TENANT_REQUIRED");
  }
  return tenantId as TenantId;
};

export * from "./store";
