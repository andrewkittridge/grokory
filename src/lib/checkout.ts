import { canBuyBoost } from "./boost";
import { canBuyFeatured } from "./featured";
import {
  BOOST_PLANS,
  FEATURED_PLANS,
  STRIPE_APP,
  STRIPE_TAX_CODE,
  boostPlan,
  catalogPrice,
  featuredPlan,
  integrationIdentifier,
  tipPreset,
  TIP_CUSTOM_LOOKUP,
} from "./pricing";
import { getStripe } from "./stripe";
import {
  parseBoostFulfillment,
  parseFeaturedFulfillment,
  parseTipFulfillment,
  shouldFulfill,
  type CheckoutSessionLike,
} from "./stripe-fulfill";
import { applyPaidCheckout, getTemplate, listTemplates } from "./templates-store";

export type CheckoutRequest =
  | { kind: "tip"; amount?: number; cancelPath?: string }
  | { kind: "featured"; slug: string; plan: string; cancelPath?: string }
  | { kind: "boost"; slug: string; plan: string; cancelPath?: string };

function safeCancelPath(value: string | undefined, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

async function productIdForName(name: string, description: string) {
  const stripe = getStripe();
  const existing = await stripe.products.list({ active: true, limit: 100 });
  const found = existing.data.find((item) => item.name === name);
  if (found) {
    if (!found.tax_code) {
      await stripe.products.update(found.id, { tax_code: STRIPE_TAX_CODE });
    }
    return found.id;
  }
  const created = await stripe.products.create({
    name,
    description,
    tax_code: STRIPE_TAX_CODE,
  });
  return created.id;
}

async function priceIdForLookup(lookupKey: string) {
  const stripe = getStripe();
  const prices = await stripe.prices.list({
    lookup_keys: [lookupKey],
    active: true,
    expand: ["data.product"],
    limit: 1,
  });
  const price = prices.data[0];
  if (price) {
    const product = price.product;
    if (
      product &&
      typeof product !== "string" &&
      !product.deleted &&
      !product.tax_code
    ) {
      await stripe.products.update(product.id, { tax_code: STRIPE_TAX_CODE });
    }
    return price.id;
  }
  const spec = catalogPrice(lookupKey);
  if (!spec) {
    throw new Error(`Missing Stripe price ${lookupKey}`);
  }
  const product = await productIdForName(
    spec.productName,
    spec.productDescription
  );
  if (spec.cents == null) {
    const created = await stripe.prices.create({
      product,
      currency: "usd",
      lookup_key: lookupKey,
      custom_unit_amount: {
        enabled: true,
        minimum: spec.minimumCents ?? 300,
        preset: 500,
      },
    });
    return created.id;
  }
  const created = await stripe.prices.create({
    product,
    currency: "usd",
    lookup_key: lookupKey,
    unit_amount: spec.cents,
  });
  return created.id;
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
        metadata: {
          app: STRIPE_APP,
          kind: "tip",
          amount: preset ? String(preset.amount) : "custom",
        },
      },
    });
    if (!session.url) return { error: "Stripe did not return a checkout URL." };
    return { url: session.url };
  }

  if (request.kind === "featured") {
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
        metadata,
      },
    });
    if (!session.url) return { error: "Stripe did not return a checkout URL." };
    return { url: session.url };
  }

  const boost = boostPlan(request.plan);
  if (!boost) {
    return {
      error: `Choose ${BOOST_PLANS.map((item) => item.durationLabel).join(" or ")}.`,
    };
  }
  const listing = await getTemplate(request.slug);
  if (!listing) {
    return { error: "That listing is gone." };
  }
  const board = await listTemplates(undefined, { includeDown: true });
  const boostGate = canBuyBoost(board, listing);
  if (!boostGate.ok) {
    return { error: boostGate.reason };
  }
  const boostPrice = await priceIdForLookup(boost.lookupKey);
  const boostCancel = safeCancelPath(
    request.cancelPath,
    `/templates/${listing.slug}`
  );
  const boostMetadata = {
    app: STRIPE_APP,
    kind: "boost",
    templateId: listing.id,
    slug: listing.slug,
    duration_days: String(boost.durationDays),
    plan: boost.id,
  };
  const boostStripe = getStripe();
  const boostSession = await boostStripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${origin}/templates/${listing.slug}?boosted=1`,
    cancel_url: `${origin}${boostCancel}`,
    line_items: [{ price: boostPrice, quantity: 1 }],
    customer_creation: "if_required",
    integration_identifier: integrationIdentifier("boost"),
    metadata: boostMetadata,
    payment_intent_data: {
      metadata: boostMetadata,
    },
  });
  if (!boostSession.url) {
    return { error: "Stripe did not return a checkout URL." };
  }
  return { url: boostSession.url };
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
  const boosted = parseBoostFulfillment(session);
  if (boosted) {
    return applyPaidCheckout({
      sessionId: boosted.sessionId,
      kind: "boost",
      templateId: boosted.templateId,
      durationDays: boosted.durationDays,
      amount: boosted.amount,
    });
  }
  return { applied: false, reason: "skip" as const };
}
