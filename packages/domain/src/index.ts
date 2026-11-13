export type Brand<T, B extends string> = T & { readonly __brand: B };

export type TenantId = Brand<string, "TenantId">;
export type ActorId = Brand<string, "ActorId">;
export type SupplierId = Brand<string, "SupplierId">;
export type DocumentId = Brand<string, "DocumentId">;
export type InvoiceId = Brand<string, "InvoiceId">;
export type WorkflowId = Brand<string, "WorkflowId">;
export type PolicyId = Brand<string, "PolicyId">;
export type BudgetId = Brand<string, "BudgetId">;
export type AuditEventId = Brand<string, "AuditEventId">;

export const asTenantId = (value: string): TenantId => value as TenantId;
export const asActorId = (value: string): ActorId => value as ActorId;
export const asSupplierId = (value: string): SupplierId => value as SupplierId;
export const asDocumentId = (value: string): DocumentId => value as DocumentId;
export const asInvoiceId = (value: string): InvoiceId => value as InvoiceId;
export const asWorkflowId = (value: string): WorkflowId => value as WorkflowId;
export const asPolicyId = (value: string): PolicyId => value as PolicyId;
export const asBudgetId = (value: string): BudgetId => value as BudgetId;
export const asAuditEventId = (value: string): AuditEventId => value as AuditEventId;

export const InvoiceState = {
  REGISTERED: "REGISTERED",
  PENDING_EVIDENCE: "PENDING_EVIDENCE",
  DISCREPANCY_OPEN: "DISCREPANCY_OPEN",
  READY_FOR_DECISION: "READY_FOR_DECISION",
  APPROVED_FOR_PAYMENT: "APPROVED_FOR_PAYMENT",
  REJECTED: "REJECTED",
  INFORMATION_REQUESTED: "INFORMATION_REQUESTED",
  ESCALATED: "ESCALATED",
  INVALIDATED: "INVALIDATED"
} as const;

export type InvoiceState = (typeof InvoiceState)[keyof typeof InvoiceState];

export const WorkflowState = {
  IN_PROGRESS: "IN_PROGRESS",
  WAITING: "WAITING",
  DELEGATED: "DELEGATED",
  BLOCKED: "BLOCKED",
  CLOSED: "CLOSED"
} as const;

export type WorkflowState = (typeof WorkflowState)[keyof typeof WorkflowState];

export const DecisionKind = {
  APPROVE: "APPROVE",
  REJECT: "REJECT",
  REQUEST_INFORMATION: "REQUEST_INFORMATION",
  ESCALATE: "ESCALATE"
} as const;

export type DecisionKind = (typeof DecisionKind)[keyof typeof DecisionKind];

export const Severity = {
  INFORMATIVE: "INFORMATIVE",
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL"
} as const;

export type Severity = (typeof Severity)[keyof typeof Severity];

export const FindingStatus = {
  OPEN: "OPEN",
  RESOLVED: "RESOLVED",
  DISMISSED: "DISMISSED"
} as const;

export type FindingStatus = (typeof FindingStatus)[keyof typeof FindingStatus];

export interface Money {
  readonly amountMinor: number;
  readonly currency: string;
}

export interface Finding {
  readonly id: string;
  readonly tenantId: TenantId;
  readonly invoiceId: InvoiceId;
  readonly type: string;
  readonly severity: Severity;
  readonly status: FindingStatus;
  readonly evidence: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
}

export interface PolicySnapshot {
  readonly policyId: PolicyId;
  readonly version: number;
  readonly rules: Readonly<Record<string, unknown>>;
}

export interface BudgetSnapshot {
  readonly budgetId: BudgetId;
  readonly version: number;
  readonly amountMinor: number;
  readonly currency: string;
  readonly consumedMinor: number;
}

export interface Supplier {
  readonly id: SupplierId;
  readonly tenantId: TenantId;
  readonly legalName: string;
  readonly displayName: string;
  readonly taxId: string | null;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Document {
  readonly id: DocumentId;
  readonly tenantId: TenantId;
  readonly messageId: string | null;
  readonly contentHash: string;
  readonly filename: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly storageKey: string;
  readonly state: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Invoice {
  readonly id: InvoiceId;
  readonly tenantId: TenantId;
  readonly documentId: DocumentId;
  readonly supplierId: SupplierId;
  readonly number: string;
  readonly issuedOn: string;
  readonly dueOn: string;
  readonly amount: Money;
  readonly state: InvoiceState;
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Workflow {
  readonly id: WorkflowId;
  readonly tenantId: TenantId;
  readonly invoiceId: InvoiceId;
  readonly state: WorkflowState;
  readonly policy: PolicySnapshot;
  readonly budget: BudgetSnapshot | null;
  readonly startedAt: string;
  readonly closedAt: string | null;
}

export interface Approval {
  readonly id: string;
  readonly tenantId: TenantId;
  readonly workflowId: WorkflowId;
  readonly actorId: ActorId;
  readonly decision: DecisionKind;
  readonly reason: string;
  readonly createdAt: string;
}

export interface AuditEvent {
  readonly id: AuditEventId;
  readonly tenantId: TenantId;
  readonly entityType: string;
  readonly entityId: string;
  readonly eventType: string;
  readonly actorId: ActorId | null;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
}

export interface InvoiceDetail extends Invoice {
  readonly supplier: Supplier;
  readonly document: Document;
  readonly findings: readonly Finding[];
  readonly workflow: Workflow | null;
}

export interface InvoiceFilters {
  readonly state?: InvoiceState;
  readonly supplierId?: SupplierId;
}

export interface Store {
  listInvoices(context: TenantContext, filters?: InvoiceFilters): Promise<readonly Invoice[]>;
  getInvoice(context: TenantContext, id: InvoiceId): Promise<InvoiceDetail | null>;
  listAudit(context: TenantContext, entityId?: string): Promise<readonly AuditEvent[]>;
  seedDemo(context: TenantContext): Promise<void>;
}

export interface TenantContext {
  readonly tenantId: TenantId;
  readonly actorId: ActorId;
  readonly roles: readonly string[];
}

const invoiceTransitions: Readonly<Record<InvoiceState, readonly InvoiceState[]>> = {
  [InvoiceState.REGISTERED]: [
    InvoiceState.PENDING_EVIDENCE,
    InvoiceState.READY_FOR_DECISION,
    InvoiceState.INVALIDATED
  ],
  [InvoiceState.PENDING_EVIDENCE]: [
    InvoiceState.DISCREPANCY_OPEN,
    InvoiceState.READY_FOR_DECISION,
    InvoiceState.INFORMATION_REQUESTED,
    InvoiceState.INVALIDATED
  ],
  [InvoiceState.DISCREPANCY_OPEN]: [
    InvoiceState.READY_FOR_DECISION,
    InvoiceState.INFORMATION_REQUESTED,
    InvoiceState.ESCALATED,
    InvoiceState.INVALIDATED
  ],
  [InvoiceState.READY_FOR_DECISION]: [
    InvoiceState.APPROVED_FOR_PAYMENT,
    InvoiceState.REJECTED,
    InvoiceState.INFORMATION_REQUESTED,
    InvoiceState.ESCALATED,
    InvoiceState.INVALIDATED
  ],
  [InvoiceState.INFORMATION_REQUESTED]: [
    InvoiceState.READY_FOR_DECISION,
    InvoiceState.INVALIDATED
  ],
  [InvoiceState.ESCALATED]: [
    InvoiceState.READY_FOR_DECISION,
    InvoiceState.REJECTED,
    InvoiceState.INVALIDATED
  ],
  [InvoiceState.APPROVED_FOR_PAYMENT]: [InvoiceState.INVALIDATED],
  [InvoiceState.REJECTED]: [],
  [InvoiceState.INVALIDATED]: []
};

export const canTransitionInvoice = (from: InvoiceState, to: InvoiceState): boolean =>
  invoiceTransitions[from].includes(to);

export const isTerminalInvoiceState = (state: InvoiceState): boolean =>
  state === InvoiceState.REJECTED || state === InvoiceState.INVALIDATED;

export const isPaymentExecuted = (_state: InvoiceState): false => false;

export interface TransitionResult {
  readonly ok: boolean;
  readonly next: InvoiceState;
  readonly reason: string | null;
}

export const transitionInvoice = (
  current: InvoiceState,
  next: InvoiceState,
  context: TenantContext
): TransitionResult => {
  if (context.tenantId.length === 0) {
    return { ok: false, next: current, reason: "TENANT_REQUIRED" };
  }
  if (!canTransitionInvoice(current, next)) {
    return { ok: false, next: current, reason: "TRANSITION_NOT_ALLOWED" };
  }
  return { ok: true, next, reason: null };
};

export const requiresSecondApprover = (severity: Severity): boolean =>
  severity === Severity.HIGH || severity === Severity.CRITICAL;

export const canAutoApprove = (severity: Severity): boolean =>
  severity !== Severity.CRITICAL;

export const formatMoney = (money: Money): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currency
  }).format(money.amountMinor / 100);

export const exactAmountDifference = (invoice: Money, contract: Money): Money | null => {
  if (invoice.currency !== contract.currency) {
    return null;
  }
  return {
    amountMinor: invoice.amountMinor - contract.amountMinor,
    currency: invoice.currency
  };
};
