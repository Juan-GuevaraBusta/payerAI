import { useEffect, useState } from "react";

interface Health {
  readonly ok: boolean;
  readonly service: string;
  readonly schemaVersion: number;
  readonly environment: string;
}

interface Identity {
  readonly tenantId: string;
  readonly actorId: string;
  readonly roles: readonly string[];
}

const demoHeaders = {
  "x-tenant-id": "tenant-demo",
  "x-user-id": "user-demo",
  "x-roles": "admin,approver"
};

export const App = () => {
  const [health, setHealth] = useState<Health | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const healthResponse = await fetch("/api/health");
        if (!healthResponse.ok) {
          throw new Error("HEALTH_FAILED");
        }
        const healthBody = (await healthResponse.json()) as Health;
        const identityResponse = await fetch("/api/me", { headers: demoHeaders });
        if (!identityResponse.ok) {
          throw new Error("IDENTITY_FAILED");
        }
        const identityBody = (await identityResponse.json()) as Identity;
        if (!cancelled) {
          setHealth(healthBody);
          setIdentity(identityBody);
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "UNKNOWN_ERROR");
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="shell">
      <header className="masthead">
        <p className="eyebrow">Financial Operations Intelligence</p>
        <h1>PayerAI</h1>
        <p className="lede">Demo local de cuentas por pagar con datos sintéticos.</p>
      </header>

      {error !== null ? (
        <section className="panel panel-error" role="alert">
          <h2>No se pudo cargar la demo</h2>
          <p>{error}</p>
        </section>
      ) : null}

      <section className="grid">
        <article className="panel">
          <h2>API</h2>
          {health === null ? (
            <p>Cargando…</p>
          ) : (
            <dl>
              <dt>Estado</dt>
              <dd>{health.ok ? "Operativa" : "Con error"}</dd>
              <dt>Servicio</dt>
              <dd>{health.service}</dd>
              <dt>Esquema</dt>
              <dd>v{health.schemaVersion}</dd>
              <dt>Entorno</dt>
              <dd>{health.environment}</dd>
            </dl>
          )}
        </article>

        <article className="panel">
          <h2>Identidad demo</h2>
          {identity === null ? (
            <p>Sin identidad.</p>
          ) : (
            <dl>
              <dt>Tenant</dt>
              <dd>{identity.tenantId}</dd>
              <dt>Actor</dt>
              <dd>{identity.actorId}</dd>
              <dt>Roles</dt>
              <dd>{identity.roles.join(", ")}</dd>
            </dl>
          )}
        </article>
      </section>

      <section className="panel">
        <h2>Alcance de esta entrega</h2>
        <p>
          Fundación del monorepo, API mínima, identidad demo y verificación de esquema. Las
          siguientes lanes añaden ingesta, validación, workflow, auditoría y spend intelligence.
        </p>
      </section>
    </main>
  );
};
