CREATE TABLE tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE memberships (
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  role TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (tenant_id, user_id, role)
);

CREATE TABLE suppliers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  legal_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  tax_id TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_suppliers_tenant_name ON suppliers(tenant_id, legal_name);

CREATE TABLE supplier_bank_accounts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  supplier_id TEXT NOT NULL REFERENCES suppliers(id),
  account_ref TEXT NOT NULL,
  status TEXT NOT NULL,
  verified_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_bank_accounts_tenant_supplier ON supplier_bank_accounts(tenant_id, supplier_id);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  external_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  received_at TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  raw_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (tenant_id, external_id)
);

CREATE INDEX idx_messages_tenant_hash ON messages(tenant_id, content_hash);

CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  message_id TEXT REFERENCES messages(id),
  content_hash TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  storage_key TEXT NOT NULL,
  state TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, content_hash)
);

CREATE INDEX idx_documents_tenant_state ON documents(tenant_id, state);

CREATE TABLE document_versions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  document_id TEXT NOT NULL REFERENCES documents(id),
  version INTEGER NOT NULL,
  content_hash TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (tenant_id, document_id, version)
);

CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  document_id TEXT NOT NULL REFERENCES documents(id),
  supplier_id TEXT NOT NULL REFERENCES suppliers(id),
  number TEXT NOT NULL,
  issued_on TEXT NOT NULL,
  due_on TEXT NOT NULL,
  amount_minor INTEGER NOT NULL,
  currency TEXT NOT NULL,
  state TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_invoices_tenant_state ON invoices(tenant_id, state);
CREATE INDEX idx_invoices_tenant_supplier_number ON invoices(tenant_id, supplier_id, number);
CREATE INDEX idx_invoices_tenant_document ON invoices(tenant_id, document_id);

CREATE TABLE invoice_lines (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  invoice_id TEXT NOT NULL REFERENCES invoices(id),
  description TEXT NOT NULL,
  amount_minor INTEGER NOT NULL,
  currency TEXT NOT NULL,
  reference TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_invoice_lines_tenant_invoice ON invoice_lines(tenant_id, invoice_id);

CREATE TABLE contracts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  supplier_id TEXT NOT NULL REFERENCES suppliers(id),
  reference TEXT NOT NULL,
  starts_on TEXT NOT NULL,
  ends_on TEXT NOT NULL,
  amount_minor INTEGER NOT NULL,
  currency TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_contracts_tenant_supplier ON contracts(tenant_id, supplier_id);

CREATE TABLE budgets (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  department TEXT NOT NULL,
  period TEXT NOT NULL,
  amount_minor INTEGER NOT NULL,
  consumed_minor INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_budgets_tenant_department_period ON budgets(tenant_id, department, period);

CREATE TABLE policies (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  version INTEGER NOT NULL,
  definition_json TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  UNIQUE (tenant_id, name, version)
);

CREATE INDEX idx_policies_tenant_active ON policies(tenant_id, active);

CREATE TABLE workflows (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  invoice_id TEXT NOT NULL REFERENCES invoices(id),
  state TEXT NOT NULL,
  policy_id TEXT NOT NULL REFERENCES policies(id),
  policy_version INTEGER NOT NULL,
  policy_snapshot_json TEXT NOT NULL,
  budget_id TEXT REFERENCES budgets(id),
  budget_version INTEGER,
  budget_snapshot_json TEXT,
  started_at TEXT NOT NULL,
  closed_at TEXT
);

CREATE INDEX idx_workflows_tenant_invoice ON workflows(tenant_id, invoice_id);
CREATE INDEX idx_workflows_tenant_state ON workflows(tenant_id, state);

CREATE TABLE workflow_steps (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  workflow_id TEXT NOT NULL REFERENCES workflows(id),
  step_type TEXT NOT NULL,
  state TEXT NOT NULL,
  assignee_id TEXT,
  due_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_workflow_steps_tenant_workflow ON workflow_steps(tenant_id, workflow_id);

CREATE TABLE approvals (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  workflow_id TEXT NOT NULL REFERENCES workflows(id),
  actor_id TEXT NOT NULL REFERENCES users(id),
  decision TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_approvals_tenant_workflow ON approvals(tenant_id, workflow_id);
CREATE UNIQUE INDEX idx_approvals_one_decision_per_actor ON approvals(tenant_id, workflow_id, actor_id);

CREATE TABLE findings (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  invoice_id TEXT NOT NULL REFERENCES invoices(id),
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL,
  evidence_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_findings_tenant_invoice ON findings(tenant_id, invoice_id);
CREATE INDEX idx_findings_tenant_status ON findings(tenant_id, status);

CREATE TABLE audit_events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  actor_id TEXT,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_audit_tenant_entity ON audit_events(tenant_id, entity_type, entity_id);
CREATE INDEX idx_audit_tenant_created ON audit_events(tenant_id, created_at);

CREATE TRIGGER audit_events_no_update
BEFORE UPDATE ON audit_events
BEGIN
  SELECT RAISE(ABORT, 'audit_events is append-only');
END;

CREATE TRIGGER audit_events_no_delete
BEFORE DELETE ON audit_events
BEGIN
  SELECT RAISE(ABORT, 'audit_events is append-only');
END;

CREATE TABLE idempotency_keys (
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  scope TEXT NOT NULL,
  key TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  response_json TEXT,
  created_at TEXT NOT NULL,
  PRIMARY KEY (tenant_id, scope, key)
);

CREATE TABLE spend_recommendations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  supplier_id TEXT NOT NULL REFERENCES suppliers(id),
  kind TEXT NOT NULL,
  potential_savings_minor INTEGER NOT NULL,
  currency TEXT NOT NULL,
  evidence_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_spend_tenant_supplier ON spend_recommendations(tenant_id, supplier_id);
