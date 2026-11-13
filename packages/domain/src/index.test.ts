import { describe, expect, it } from "vitest";
import {
  InvoiceState,
  Severity,
  asActorId,
  asTenantId,
  canAutoApprove,
  canTransitionInvoice,
  exactAmountDifference,
  formatMoney,
  isPaymentExecuted,
  isTerminalInvoiceState,
  requiresSecondApprover,
  transitionInvoice
} from "./index";

const context = {
  tenantId: asTenantId("tenant-1"),
  actorId: asActorId("actor-1"),
  roles: ["approver"]
};

describe("invoice state machine", () => {
  it("allows a registered invoice to become ready for decision", () => {
    expect(canTransitionInvoice(InvoiceState.REGISTERED, InvoiceState.READY_FOR_DECISION)).toBe(true);
  });

  it("rejects a direct transition from registered to approved for payment", () => {
    expect(canTransitionInvoice(InvoiceState.REGISTERED, InvoiceState.APPROVED_FOR_PAYMENT)).toBe(false);
  });

  it("rejects every transition out of a terminal state", () => {
    expect(isTerminalInvoiceState(InvoiceState.REJECTED)).toBe(true);
    expect(canTransitionInvoice(InvoiceState.REJECTED, InvoiceState.READY_FOR_DECISION)).toBe(false);
  });

  it("requires a tenant context", () => {
    const result = transitionInvoice(InvoiceState.REGISTERED, InvoiceState.READY_FOR_DECISION, {
      ...context,
      tenantId: asTenantId("")
    });
    expect(result).toEqual({ ok: false, next: InvoiceState.REGISTERED, reason: "TENANT_REQUIRED" });
  });
});

describe("payment and authority boundaries", () => {
  it("never reports an executed payment", () => {
    expect(isPaymentExecuted(InvoiceState.APPROVED_FOR_PAYMENT)).toBe(false);
  });

  it("requires a second approver for high and critical severity", () => {
    expect(requiresSecondApprover(Severity.HIGH)).toBe(true);
    expect(requiresSecondApprover(Severity.CRITICAL)).toBe(true);
    expect(requiresSecondApprover(Severity.MEDIUM)).toBe(false);
  });

  it("never auto-approves critical severity", () => {
    expect(canAutoApprove(Severity.CRITICAL)).toBe(false);
  });
});

describe("money", () => {
  it("formats minor units", () => {
    expect(formatMoney({ amountMinor: 1000000, currency: "USD" })).toBe("$10,000.00");
  });

  it("does not compare different currencies", () => {
    expect(
      exactAmountDifference(
        { amountMinor: 1000000, currency: "USD" },
        { amountMinor: 800000, currency: "EUR" }
      )
    ).toBeNull();
  });
});
