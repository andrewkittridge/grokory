import { STRIPE_APP } from "./pricing";

export type CheckoutSessionLike = {
  id: string;
  payment_status?: string | null;
  amount_total?: number | null;
  metadata?: Record<string, string> | null;
};

export function isPaidCheckout(session: CheckoutSessionLike) {
  return (
    session.payment_status === "paid" ||
    session.payment_status === "no_payment_required"
  );
}

export function grokdexMetadata(session: CheckoutSessionLike) {
  const metadata = session.metadata ?? {};
  if (metadata.app !== STRIPE_APP) return null;
  if (
    metadata.kind !== "tip" &&
    metadata.kind !== "featured" &&
    metadata.kind !== "boost"
  ) {
    return null;
  }
  return metadata as Record<string, string> & {
    app: typeof STRIPE_APP;
    kind: "tip" | "featured" | "boost";
  };
}

export function shouldFulfill(session: CheckoutSessionLike) {
  return Boolean(isPaidCheckout(session) && grokdexMetadata(session));
}

export function parseFeaturedFulfillment(session: CheckoutSessionLike) {
  const metadata = grokdexMetadata(session);
  if (!metadata || metadata.kind !== "featured") return null;
  const durationDays = Number(metadata.duration_days);
  if (!metadata.templateId || !Number.isFinite(durationDays) || durationDays <= 0) {
    return null;
  }
  return {
    sessionId: session.id,
    templateId: metadata.templateId,
    slug: metadata.slug,
    durationDays,
    amount: session.amount_total ?? 0,
  };
}

export function parseTipFulfillment(session: CheckoutSessionLike) {
  const metadata = grokdexMetadata(session);
  if (!metadata || metadata.kind !== "tip") return null;
  return {
    sessionId: session.id,
    amount: session.amount_total ?? 0,
  };
}

export function parseBoostFulfillment(session: CheckoutSessionLike) {
  const metadata = grokdexMetadata(session);
  if (!metadata || metadata.kind !== "boost") return null;
  const durationDays = Number(metadata.duration_days);
  if (!metadata.templateId || !Number.isFinite(durationDays) || durationDays <= 0) {
    return null;
  }
  return {
    sessionId: session.id,
    templateId: metadata.templateId,
    slug: metadata.slug,
    durationDays,
    amount: session.amount_total ?? 0,
  };
}
