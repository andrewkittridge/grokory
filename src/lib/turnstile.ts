import { publicEnv } from "@/lib/site";

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function turnstileSiteKey() {
  return publicEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY");
}

export async function verifyTurnstile(
  formData: FormData
): Promise<string | undefined> {
  const secret = publicEnv("TURNSTILE_SECRET");
  const siteKey = turnstileSiteKey();

  if (siteKey && !secret) {
    return "Could not verify this listing right now. Try again in a moment.";
  }
  if (!secret) return undefined;

  const token = String(
    formData.get("cf-turnstile-response") ??
      formData.get("g-recaptcha-response") ??
      ""
  ).trim();
  if (!token) {
    return "Confirm you are human, then try again.";
  }

  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", token);
    const res = await fetch(SITEVERIFY, {
      method: "POST",
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    if (!data.success) {
      return "Confirm you are human, then try again.";
    }
  } catch {
    return "Could not verify this listing right now. Try again in a moment.";
  }
  return undefined;
}
