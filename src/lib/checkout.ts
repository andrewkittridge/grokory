import { canBuyFeatured } from "./featured";
import {
  FEATURED_PLANS,
  STRIPE_APP,
  featuredPlan,
  integrationIdentifier,
  tipPreset,
  TIP_CUSTOM_LOOKUP,
} from "./pricing";
import { getStripe } from "./stripe";
import {
  parseFeaturedFulfillment,
  parseTipFulfillment,
  shouldFulfill,
  type CheckoutSessionLike,
} from "./stripe-fulfill";
import { applyPaidCheckout, getTemplate, listTemplates } from "./templates-store";

export type CheckoutRequest =
  | { kind: "tip"; amount?: number; cancelPath?: string }
  | { kind: "featured"; slug: string; plan: string; cancelPath?: string };

function safeCancelPath(value: string | undefined, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

async function priceIdForLookup(lookupKey: string) {
  const stripe = getStripe();
  const prices = await stripe.prices.list({
    lookup_keys: [lookupKey],
    active: true,
    limit: 1,
  });
  const price = prices.data[0];
  if (!price) {
    throw new Error(`Missing Stripe price ${lookupKey}`);
  }
  return price.id;
}

export async function createCheckoutSession(
  request: CheckoutRequest,
  origin: string
) {
  if (request.kind === "tip") {
    const preset = request.amount ? tipPreset(request.amount) : null;
    if (request.amount && !preset) {
      return { error: "Pick $5, $10, $25, or a custom amount." };
    }
    const lookupKey = preset?.lookupKey ?? TIP_CUSTOM_LOOKUP;
    const price = await priceIdForLookup(lookupKey);
    const cancel = safeCancelPath(request.cancelPath, "/support");
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      submit_type: "donate",
      success_url: `${origin}/support?tipped=1`,
      cancel_url: `${origin}${cancel}`,
      line_items: [{ price, quantity: 1 }],
      customer_creation: "if_required",
      integration_identifier: integrationIdentifier("tip"),
      metadata: {
        app: STRIPE_APP,
        kind: "tip",
        amount: preset ? String(preset.amount) : "custom",
      },
      payment_intent_data: {
        statement_descriptor: "GROKDEX",
        metadata: {
          app: STRIPE_APP,
          kind: "tip",
          amount: preset ? String(preset.amount) : "custom",
        },
      },
      custom_text: {
        submit: {
          message:
            "Optional tip — Grokdex stays free either way. Not tax-deductible.",
        },
      },
    });
    if (!session.url) return { error: "Stripe did not return a checkout URL." };
    return { url: session.url };
  }

  const plan = featuredPlan(request.plan);
  if (!plan) {
    return {
      error: `Choose ${FEATURED_PLANS.map((item) => item.durationLabel).join(" or ")}.`,
    };
  }
  const template = await getTemplate(request.slug);
  if (!template) {
    return { error: "That listing is gone." };
  }
  const listed = await listTemplates(undefined, { includeDown: true });
  const gate = canBuyFeatured(listed, template);
  if (!gate.ok) {
    return { error: gate.reason };
  }
  const price = await priceIdForLookup(plan.lookupKey);
  const cancel = safeCancelPath(
    request.cancelPath,
    `/templates/${template.slug}`
  );
  const metadata = {
    app: STRIPE_APP,
    kind: "featured",
    templateId: template.id,
    slug: template.slug,
    duration_days: String(plan.durationDays),
    plan: plan.id,
  };
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${origin}/templates/${template.slug}?featured=1`,
    cancel_url: `${origin}${cancel}`,
    line_items: [{ price, quantity: 1 }],
    customer_creation: "if_required",
    integration_identifier: integrationIdentifier("featured"),
    metadata,
    payment_intent_data: {
      statement_descriptor: "GROKDEX",
      metadata,
    },
    custom_text: {
      submit: {
        message:
          "Paid placement on Grokdex. Not an xAI or Grokdex endorsement.",
      },
    },
  });
  if (!session.url) return { error: "Stripe did not return a checkout URL." };
  return { url: session.url };
}

export async function fulfillCheckoutSession(session: CheckoutSessionLike) {
  if (!shouldFulfill(session)) {
    return { applied: false, reason: "skip" as const };
  }
  const featured = parseFeaturedFulfillment(session);
  if (featured) {
    return applyPaidCheckout({
      sessionId: featured.sessionId,
      kind: "featured",
      templateId: featured.templateId,
      durationDays: featured.durationDays,
      amount: featured.amount,
    });
  }
  const tip = parseTipFulfillment(session);
  if (tip) {
    return applyPaidCheckout({
      sessionId: tip.sessionId,
      kind: "tip",
      amount: tip.amount,
    });
  }
  return { applied: false, reason: "skip" as const };
}
