import { NextResponse } from "next/server";
import { createCheckoutSession, type CheckoutRequest } from "@/lib/checkout";
import { checkoutOrigin, isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured yet." },
      { status: 501 }
    );
  }

  let body: CheckoutRequest;
  try {
    body = (await request.json()) as CheckoutRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.kind !== "tip" && body.kind !== "featured") {
    return NextResponse.json({ error: "Unknown checkout kind." }, { status: 400 });
  }

  try {
    const result = await createCheckoutSession(body, checkoutOrigin(request));
    if ("error" in result && result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ url: result.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to start checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
