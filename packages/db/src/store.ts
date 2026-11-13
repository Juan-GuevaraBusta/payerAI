import {
  InvoiceState,
  Severity,
  WorkflowState,
  asActorId,
  asAuditEventId,
  asBudgetId,
  asDocumentId,
  asInvoiceId,
  asPolicyId,
  asSupplierId,
  asTenantId,
  asWorkflowId,
  type AuditEvent,
  type BudgetSnapshot,
  type Document,
  type Finding,
  type Invoice,
  type InvoiceDetail,
  type InvoiceFilters,
  type InvoiceId,
  type PolicySnapshot,
  type Store,
  type Supplier,
  type TenantContext,
  type Workflow
} from "@payerai/domain";
import type { D1Database } from "./index";

interface InvoiceRow {
  readonly id: string;
  readonly tenant_id: string;
  readonly document_id: string;
  readonly supplier_id: string;
  readonly number: string;
  readonly issued_on: string;
  readonly due_on: string;
  readonly amount_minor: number;
  readonly currency: string;
  readonly state: InvoiceState;
  readonly version: number;
  readonly created_at: string;
  readonly updated_at: string;
}

interface SupplierRow {
  readonly id: string;
  readonly tenant_id: string;
  readonly legal_name: string;
  readonly display_name: string;
  readonly tax_id: string | null;
  readonly status: string;
  readonly created_at: string;
  readonly updated_at: string;
}

interface DocumentRow {
  readonly id: string;
  readonly tenant_id: string;
  readonly message_id: string | null;
  readonly content_hash: string;
  readonly filename: string;
  readonly mime_type: string;
  readonly size_bytes: number;
  readonly storage_key: string;
  readonly state: string;
  readonly created_at: string;
  readonly updated_at: string;
}

interface FindingRow {
  readonly id: string;
  readonly tenant_id: string;
  readonly invoice_id: string;
  readonly type: string;
  readonly severity: Severity;
  readonly status: Finding["status"];
  readonly evidence_json: string;
  readonly created_at: string;
}

interface WorkflowRow {
  readonly id: string;
  readonly tenant_id: string;
  readonly invoice_id: string;
  readonly state: WorkflowState;
  readonly policy_id: string;
  readonly policy_version: number;
  readonly policy_snapshot_json: string;
  readonly budget_id: string | null;
  readonly budget_version: number | null;
  readonly budget_snapshot_json: string | null;
  readonly started_at: string;
  readonly closed_at: string | null;
}

interface AuditRow {
  readonly id: string;
  readonly tenant_id: string;
  readonly entity_type: string;
  readonly entity_id: string;
  readonly event_type: string;
  readonly actor_id: string | null;
  readonly payload_json: string;
  readonly created_at: string;
}

const mapInvoice = (row: InvoiceRow): Invoice => ({
  id: asInvoiceId(row.id),
  tenantId: asTenantId(row.tenant_id),
  documentId: asDocumentId(row.document_id),
  supplierId: asSupplierId(row.supplier_id),
  number: row.number,
  issuedOn: row.issued_on,
  dueOn: row.due_on,
  amount: { amountMinor: row.amount_minor, currency: row.currency },
  state: row.state,
  version: row.version,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapSupplier = (row: SupplierRow): Supplier => ({
  id: asSupplierId(row.id),
  tenantId: asTenantId(row.tenant_id),
  legalName: row.legal_name,
  displayName: row.display_name,
  taxId: row.tax_id,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapDocument = (row: DocumentRow): Document => ({
  id: asDocumentId(row.id),
  tenantId: asTenantId(row.tenant_id),
  messageId: row.message_id,
  contentHash: row.content_hash,
  filename: row.filename,
  mimeType: row.mime_type,
  sizeBytes: row.size_bytes,
  storageKey: row.storage_key,
  state: row.state,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapFinding = (row: FindingRow): Finding => ({
  id: row.id,
  tenantId: asTenantId(row.tenant_id),
  invoiceId: asInvoiceId(row.invoice_id),
  type: row.type,
  severity: row.severity,
  status: row.status,
  evidence: JSON.parse(row.evidence_json) as Readonly<Record<string, unknown>>,
  createdAt: row.created_at
});

const mapWorkflow = (row: WorkflowRow): Workflow => {
  const policy: PolicySnapshot = {
    policyId: asPolicyId(row.policy_id),
    version: row.policy_version,
    rules: JSON.parse(row.policy_snapshot_json) as Readonly<Record<string, unknown>>
  };
  const budget: BudgetSnapshot | null =
    row.budget_id === null || row.budget_version === null || row.budget_snapshot_json === null
      ? null
      : {
          budgetId: asBudgetId(row.budget_id),
          version: row.budget_version,
          ...(JSON.parse(row.budget_snapshot_json) as {
            readonly amountMinor: number;
            readonly currency: string;
            readonly consumedMinor: number;
          })
        };

  return {
    id: asWorkflowId(row.id),
    tenantId: asTenantId(row.tenant_id),
    invoiceId: asInvoiceId(row.invoice_id),
    state: row.state,
    policy,
    budget,
    startedAt: row.started_at,
    closedAt: row.closed_at
  };
};

const mapAudit = (row: AuditRow): AuditEvent => ({
  id: asAuditEventId(row.id),
  tenantId: asTenantId(row.tenant_id),
  entityType: row.entity_type,
  entityId: row.entity_id,
  eventType: row.event_type,
  actorId: row.actor_id === null ? null : asActorId(row.actor_id),
  payload: JSON.parse(row.payload_json) as Readonly<Record<string, unknown>>,
  createdAt: row.created_at
});

const first = async <T>(
  db: D1Database,
  query: string,
  ...values: readonly unknown[]
): Promise<T | null> => db.prepare(query).bind(...values).first<T>();

const all = async <T>(
  db: D1Database,
  query: string,
  ...values: readonly unknown[]
): Promise<readonly T[]> => (await db.prepare(query).bind(...values).all<T>()).results;

const run = async (
  db: D1Database,
  query: string,
  ...values: readonly unknown[]
): Promise<void> => {
  await db.prepare(query).bind(...values).run();
};

const listInvoices = async (
  db: D1Database,
  context: TenantContext,
  filters: InvoiceFilters = {}
): Promise<readonly Invoice[]> => {
  const conditions = ["tenant_id = ?"];
  const values: unknown[] = [context.tenantId];

  if (filters.state !== undefined) {
    conditions.push("state = ?");
    values.push(filters.state);
  }
  if (filters.supplierId !== undefined) {
    conditions.push("supplier_id = ?");
    values.push(filters.supplierId);
  }

  const rows = await all<InvoiceRow>(
    db,
    `SELECT id, tenant_id, document_id, supplier_id, number, issued_on, due_on,
            amount_minor, currency, state, version, created_at, updated_at
       FROM invoices
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at DESC, id DESC`,
    ...values
  );
  return rows.map(mapInvoice);
};

const getInvoice = async (
  db: D1Database,
  context: TenantContext,
  id: InvoiceId
): Promise<InvoiceDetail | null> => {
  const invoiceRow = await first<InvoiceRow>(
    db,
    `SELECT id, tenant_id, document_id, supplier_id, number, issued_on, due_on,
            amount_minor, currency, state, version, created_at, updated_at
       FROM invoices
      WHERE tenant_id = ? AND id = ?`,
    context.tenantId,
    id
  );
  if (invoiceRow === null) {
    return null;
  }

  const [supplierRow, documentRow, findingRows, workflowRow] = await Promise.all([
    first<SupplierRow>(
      db,
      `SELECT id, tenant_id, legal_name, display_name, tax_id, status, created_at, updated_at
         FROM suppliers WHERE tenant_id = ? AND id = ?`,
      context.tenantId,
      invoiceRow.supplier_id
    ),
    first<DocumentRow>(
      db,
      `SELECT id, tenant_id, message_id, content_hash, filename, mime_type, size_bytes,
              storage_key, state, created_at, updated_at
         FROM documents WHERE tenant_id = ? AND id = ?`,
      context.tenantId,
      invoiceRow.document_id
    ),
    all<FindingRow>(
      db,
      `SELECT id, tenant_id, invoice_id, type, severity, status, evidence_json, created_at
         FROM findings WHERE tenant_id = ? AND invoice_id = ? ORDER BY created_at ASC, id ASC`,
      context.tenantId,
      invoiceRow.id
    ),
    first<WorkflowRow>(
      db,
      `SELECT id, tenant_id, invoice_id, state, policy_id, policy_version, policy_snapshot_json,
              budget_id, budget_version, budget_snapshot_json, started_at, closed_at
         FROM workflows WHERE tenant_id = ? AND invoice_id = ? ORDER BY started_at DESC LIMIT 1`,
      context.tenantId,
      invoiceRow.id
    )
  ]);

  if (supplierRow === null || documentRow === null) {
    return null;
  }

  return {
    ...mapInvoice(invoiceRow),
    supplier: mapSupplier(supplierRow),
    document: mapDocument(documentRow),
    findings: findingRows.map(mapFinding),
    workflow: workflowRow === null ? null : mapWorkflow(workflowRow)
  };
};

const listAudit = async (
  db: D1Database,
  context: TenantContext,
  entityId?: string
): Promise<readonly AuditEvent[]> => {
  const conditions = ["tenant_id = ?"];
  const values: unknown[] = [context.tenantId];
  if (entityId !== undefined) {
    conditions.push("entity_id = ?");
    values.push(entityId);
  }

  const rows = await all<AuditRow>(
    db,
    `SELECT id, tenant_id, entity_type, entity_id, event_type, actor_id, payload_json, created_at
       FROM audit_events
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at DESC, id DESC`,
    ...values
  );
  return rows.map(mapAudit);
};

const seedDemo = async (db: D1Database, context: TenantContext): Promise<void> => {
  if (!context.roles.includes("admin") && !context.roles.includes("service")) {
    throw new Error("SEED_FORBIDDEN");
  }

  const tenantId = context.tenantId;
  const tenantName = tenantId === "tenant-demo" ? "Demo Co" : `Tenant ${tenantId}`;
  const userId = (role: string): string => `user-${tenantId}-${role}`;
  const email = (role: string): string => `${role}@${tenantId}.demo`;
  const supplierId = `supplier-${tenantId}-acme`;
  const documentId = `document-${tenantId}-invoice-001`;
  const invoiceId = `invoice-${tenantId}-001`;
  const policyId = `policy-${tenantId}-standard`;
  const budgetId = `budget-${tenantId}-ops-2026`;
  const workflowId = `workflow-${tenantId}-invoice-001`;
  const createdAt = "2026-01-15T10:00:00.000Z";
  const updatedAt = "2026-01-15T10:05:00.000Z";
  const policySnapshot = {
    requireContract: true,
    requireBudget: true,
    duplicateWindowDays: 90,
    secondApproverFromSeverity: Severity.HIGH
  };
  const budgetSnapshot = { amountMinor: 5000000, currency: "USD", consumedMinor: 1200000 };

  const statements: ReadonlyArray<readonly [string, readonly unknown[]]> = [
    [
      `INSERT OR IGNORE INTO tenants (id, name, created_at) VALUES (?, ?, ?)`,
      [tenantId, tenantName, createdAt]
    ],
    [
      `INSERT OR IGNORE INTO users (id, email, display_name, created_at) VALUES (?, ?, ?, ?)`,
      [userId("admin"), email("admin"), "Demo Admin", createdAt]
    ],
    [
      `INSERT OR IGNORE INTO users (id, email, display_name, created_at) VALUES (?, ?, ?, ?)`,
      [userId("approver"), email("approver"), "Demo Approver", createdAt]
    ],
    [
      `INSERT OR IGNORE INTO users (id, email, display_name, created_at) VALUES (?, ?, ?, ?)`,
      [userId("viewer"), email("viewer"), "Demo Viewer", createdAt]
    ],
    [
      `INSERT OR IGNORE INTO memberships (tenant_id, user_id, role, status, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [tenantId, userId("admin"), "admin", "ACTIVE", createdAt]
    ],
    [
      `INSERT OR IGNORE INTO memberships (tenant_id, user_id, role, status, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [tenantId, userId("approver"), "approver", "ACTIVE", createdAt]
    ],
    [
      `INSERT OR IGNORE INTO memberships (tenant_id, user_id, role, status, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [tenantId, userId("viewer"), "viewer", "ACTIVE", createdAt]
    ],
    [
      `INSERT OR IGNORE INTO suppliers
         (id, tenant_id, legal_name, display_name, tax_id, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [supplierId, tenantId, "Acme Servicios S.A.", "Acme", "TAX-ACME-001", "ACTIVE", createdAt, updatedAt]
    ],
    [
      `INSERT OR IGNORE INTO contracts
         (id, tenant_id, supplier_id, reference, starts_on, ends_on, amount_minor, currency, version, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `contract-${tenantId}-acme`,
        tenantId,
        supplierId,
        "CTR-ACME-2026",
        "2026-01-01",
        "2026-12-31",
        4800000,
        "USD",
        1,
        createdAt,
        updatedAt
      ]
    ],
    [
      `INSERT OR IGNORE INTO budgets
         (id, tenant_id, department, period, amount_minor, consumed_minor, currency, version, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [budgetId, tenantId, "Operations", "2026-01", 5000000, 1200000, "USD", 1, createdAt, updatedAt]
    ],
    [
      `INSERT OR IGNORE INTO policies
         (id, tenant_id, name, version, definition_json, active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [policyId, tenantId, "Standard AP", 1, JSON.stringify(policySnapshot), 1, createdAt]
    ],
    [
      `INSERT OR IGNORE INTO messages
         (id, tenant_id, external_id, sender, subject, body, received_at, content_hash, raw_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `message-${tenantId}-001`,
        tenantId,
        `ext-${tenantId}-001`,
        "billing@acme.example",
        "Factura INV-001",
        "Adjunto factura sintética.",
        createdAt,
        `hash-message-${tenantId}-001`,
        "{}",
        createdAt
      ]
    ],
    [
      `INSERT OR IGNORE INTO documents
         (id, tenant_id, message_id, content_hash, filename, mime_type, size_bytes, storage_key, state, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        documentId,
        tenantId,
        `message-${tenantId}-001`,
        `hash-document-${tenantId}-001`,
        "factura-001.pdf",
        "application/pdf",
        2048,
        `demo/${tenantId}/factura-001.pdf`,
        "PARSED",
        createdAt,
        updatedAt
      ]
    ],
    [
      `INSERT OR IGNORE INTO invoices
         (id, tenant_id, document_id, supplier_id, number, issued_on, due_on, amount_minor, currency, state, version, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoiceId,
        tenantId,
        documentId,
        supplierId,
        `INV-${tenantId}-001`,
        "2026-01-10",
        "2026-02-10",
        4850000,
        "USD",
        InvoiceState.READY_FOR_DECISION,
        1,
        createdAt,
        updatedAt
      ]
    ],
    [
      `INSERT OR IGNORE INTO invoice_lines
         (id, tenant_id, invoice_id, description, amount_minor, currency, reference, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `line-${tenantId}-001`,
        tenantId,
        invoiceId,
        "Servicios de operación",
        4850000,
        "USD",
        "CTR-ACME-2026",
        createdAt
      ]
    ],
    [
      `INSERT OR IGNORE INTO findings
         (id, tenant_id, invoice_id, type, severity, status, evidence_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `finding-${tenantId}-duplicate`,
        tenantId,
        invoiceId,
        "DUPLICATE_SUSPECTED",
        Severity.HIGH,
        "OPEN",
        JSON.stringify({ match: "INV-ACME-0009", windowDays: 90 }),
        createdAt,
        updatedAt
      ]
    ],
    [
      `INSERT OR IGNORE INTO findings
         (id, tenant_id, invoice_id, type, severity, status, evidence_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `finding-${tenantId}-missing-po`,
        tenantId,
        invoiceId,
        "MISSING_PO",
        Severity.MEDIUM,
        "OPEN",
        JSON.stringify({ required: true, reference: null }),
        createdAt,
        updatedAt
      ]
    ],
    [
      `INSERT OR IGNORE INTO workflows
         (id, tenant_id, invoice_id, state, policy_id, policy_version, policy_snapshot_json,
          budget_id, budget_version, budget_snapshot_json, started_at, closed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        workflowId,
        tenantId,
        invoiceId,
        WorkflowState.IN_PROGRESS,
        policyId,
        1,
        JSON.stringify(policySnapshot),
        budgetId,
        1,
        JSON.stringify(budgetSnapshot),
        createdAt,
        null
      ]
    ],
    [
      `INSERT OR IGNORE INTO workflow_steps
         (id, tenant_id, workflow_id, step_type, state, assignee_id, due_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `step-${tenantId}-review`,
        tenantId,
        workflowId,
        "REVIEW",
        "PENDING",
        userId("approver"),
        "2026-01-20T10:00:00.000Z",
        createdAt,
        updatedAt
      ]
    ],
    [
      `INSERT OR IGNORE INTO audit_events
         (id, tenant_id, entity_type, entity_id, event_type, actor_id, payload_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `audit-${tenantId}-registered`,
        tenantId,
        "invoice",
        invoiceId,
        "INVOICE_REGISTERED",
        userId("admin"),
        JSON.stringify({ source: "synthetic-email" }),
        createdAt
      ]
    ],
    [
      `INSERT OR IGNORE INTO audit_events
         (id, tenant_id, entity_type, entity_id, event_type, actor_id, payload_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `audit-${tenantId}-findings`,
        tenantId,
        "invoice",
        invoiceId,
        "FINDINGS_OPENED",
        null,
        JSON.stringify({ count: 2, severities: [Severity.HIGH, Severity.MEDIUM] }),
        updatedAt
      ]
    ]
  ];

  for (const [query, values] of statements) {
    await run(db, query, ...values);
  }
};

export const createD1Store = (db: D1Database): Store => ({
  listInvoices: (context, filters) => listInvoices(db, context, filters),
  getInvoice: (context, id) => getInvoice(db, context, id),
  listAudit: (context, entityId) => listAudit(db, context, entityId),
  seedDemo: (context) => seedDemo(db, context)
});
