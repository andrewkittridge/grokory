export type RateRecord = { n: number; resetAt: number };

type RateKv = {
  get: (key: string, type: "text") => Promise<string | null>;
  put: (
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ) => Promise<void>;
};

export const VOTE_RATE_LIMIT = 30;
export const VOTE_RATE_WINDOW_MS = 10 * 60 * 1000;

export function headerIp(headers: { get(name: string): string | null }) {
  return (
    headers.get("cf-connecting-ip")?.trim() ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export function nextRate(
  record: RateRecord | null,
  now: number,
  limit: number,
  windowMs: number
): { ok: boolean; record: RateRecord } {
  const data =
    record && record.resetAt && now < record.resetAt
      ? record
      : { n: 0, resetAt: now + windowMs };
  if (data.n >= limit) return { ok: false, record: data };
  return { ok: true, record: { n: data.n + 1, resetAt: data.resetAt } };
}

async function rateKv(): Promise<RateKv | undefined> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    return env.TEMPLATES as RateKv | undefined;
  } catch {
    return undefined;
  }
}

export async function consumeKvRate(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const kv = await rateKv();
  if (!kv) return true;
  const now = Date.now();
  try {
    const raw = await kv.get(key, "text");
    const parsed = raw ? (JSON.parse(raw) as RateRecord) : null;
    const current =
      parsed && typeof parsed.n === "number" && typeof parsed.resetAt === "number"
        ? parsed
        : null;
    const { ok, record } = nextRate(current, now, limit, windowMs);
    if (!ok) return false;
    const ttl = Math.max(60, Math.ceil((record.resetAt - now) / 1000));
    await kv.put(key, JSON.stringify(record), { expirationTtl: ttl });
    return true;
  } catch {
    return true;
  }
}

export async function consumeVoteRate(ip: string) {
  return consumeKvRate(
    `vote-rate:v1:${ip || "unknown"}`,
    VOTE_RATE_LIMIT,
    VOTE_RATE_WINDOW_MS
  );
}

const memoryRates = new Map<string, RateRecord>();

export function resetMemoryRates() {
  memoryRates.clear();
}

/** KV when present; in-process fallback so local/tests are still capped. */
export async function consumeBoundedRate(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now()
) {
  const kv = await rateKv();
  if (kv) return consumeKvRate(key, limit, windowMs);
  const current = memoryRates.get(key) ?? null;
  const { ok, record } = nextRate(current, now, limit, windowMs);
  memoryRates.set(key, record);
  return ok;
}
