export const STRIPE_APP = "grokdex";

export const FEATURED_PIN_CAP = 3;

export const TIP_PRESETS = [
  { amount: 5, cents: 500, lookupKey: "grokdex_tip_5", label: "$5" },
  { amount: 10, cents: 1000, lookupKey: "grokdex_tip_10", label: "$10" },
  { amount: 25, cents: 2500, lookupKey: "grokdex_tip_25", label: "$25" },
] as const;

export const TIP_CUSTOM_LOOKUP = "grokdex_tip_custom";
export const TIP_CUSTOM_MIN_CENTS = 300;

export const FEATURED_PLANS = [
  {
    id: "week" as const,
    lookupKey: "grokdex_featured_week",
    durationDays: 7,
    cents: 7900,
    priceLabel: "$79",
    durationLabel: "7 days",
  },
  {
    id: "month" as const,
    lookupKey: "grokdex_featured_month",
    durationDays: 30,
    cents: 19900,
    priceLabel: "$199",
    durationLabel: "30 days",
  },
];

export type FeaturedPlanId = (typeof FEATURED_PLANS)[number]["id"];

export function featuredPlan(id: string) {
  return FEATURED_PLANS.find((plan) => plan.id === id) ?? null;
}

export function tipPreset(amount: number) {
  return TIP_PRESETS.find((preset) => preset.amount === amount) ?? null;
}

export function integrationIdentifier(kind: "tip" | "featured") {
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 8);
  return kind === "tip" ? `grokdex-tip-${suffix}` : `grokdex-feat-${suffix}`;
}
