import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { fulfillCheckoutSession } from "@/lib/checkout";
import { getStripe, stripeCryptoProvider } from "@/lib/stripe";

export const dynamic = "force-dynamic";

function sessionSlug(metadata: Record<string, string> | null | undefined) {
  const slug = metadata?.slug?.trim();
  return slug || undefined;
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret || !secret.startsWith("whsec_")) {
    return NextResponse.json(
      { error: "Webhook secret is not configured" },
      { status: 501 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const body = await request.text();
  const stripe = getStripe();
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      secret,
      undefined,
      stripeCryptoProvider()
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded" &&
    event.type !== "checkout.session.async_payment_failed"
  ) {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object;
  const metadata = session.metadata ?? undefined;
  if (event.type === "checkout.session.async_payment_failed") {
    return NextResponse.json({ received: true, failed: true });
  }

  try {
    const result = await fulfillCheckoutSession({
      id: session.id,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      metadata,
    });
    if (result.applied) {
      revalidatePath("/");
      revalidatePath("/templates");
      const slug = sessionSlug(metadata);
      if (slug) revalidatePath(`/templates/${slug}`);
    }
    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to apply checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
