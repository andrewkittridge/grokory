import Stripe from "stripe";
import { SITE_URL } from "./site";

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(key, {
    httpClient: Stripe.createFetchHttpClient(),
    timeout: 20_000,
    maxNetworkRetries: 1,
  });
}

export function stripeCryptoProvider() {
  return Stripe.createSubtleCryptoProvider();
}

export function checkoutOrigin(request: Request) {
  const url = new URL(request.url);
  const host = url.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return url.origin;
  }
  return SITE_URL;
}
