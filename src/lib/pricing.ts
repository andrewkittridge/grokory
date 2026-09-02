export const STRIPE_APP = "grokdex";

/** Website Information Services — Personal Use. Eligible for Managed Payments. */
export const STRIPE_TAX_CODE = "txcd_10701401";

export const FEATURED_PIN_CAP = 3;
export const BOOST_PIN_CAP = 2;

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

export const BOOST_PLANS = [
  {
    id: "week" as const,
    lookupKey: "grokdex_boost_week",
    durationDays: 7,
    cents: 2900,
    priceLabel: "$29",
    durationLabel: "7 days",
  },
  {
    id: "month" as const,
    lookupKey: "grokdex_boost_month",
    durationDays: 30,
    cents: 7900,
    priceLabel: "$79",
    durationLabel: "30 days",
  },
];

export type FeaturedPlanId = (typeof FEATURED_PLANS)[number]["id"];
export type BoostPlanId = (typeof BOOST_PLANS)[number]["id"];

export function featuredPlan(id: string) {
  return FEATURED_PLANS.find((plan) => plan.id === id) ?? null;
}

export function boostPlan(id: string) {
  return BOOST_PLANS.find((plan) => plan.id === id) ?? null;
}

export function catalogPrice(lookupKey: string) {
  const featured = FEATURED_PLANS.find((plan) => plan.lookupKey === lookupKey);
  if (featured) {
    return {
      lookupKey,
      cents: featured.cents,
      productName: "Grokdex Featured listing",
      productDescription:
        "Paid placement on Grokdex. Not an xAI or Grokdex endorsement.",
    };
  }
  const boost = BOOST_PLANS.find((plan) => plan.lookupKey === lookupKey);
  if (boost) {
    return {
      lookupKey,
      cents: boost.cents,
      productName: "Grokdex Boost",
      productDescription:
        "Labeled boost on the Grokdex board. Organic rank stays as it is. Not an endorsement.",
    };
  }
  const tip = TIP_PRESETS.find((preset) => preset.lookupKey === lookupKey);
  if (tip) {
    return {
      lookupKey,
      cents: tip.cents,
      productName: "Grokdex Tip",
      productDescription:
        "Optional tip. Not tax-deductible. Does not change rank.",
    };
  }
  if (lookupKey === TIP_CUSTOM_LOOKUP) {
    return {
      lookupKey,
      cents: null,
      minimumCents: TIP_CUSTOM_MIN_CENTS,
      productName: "Grokdex Tip",
      productDescription:
        "Optional tip. Not tax-deductible. Does not change rank.",
    };
  }
  return null;
}

export function tipPreset(amount: number) {
  return TIP_PRESETS.find((preset) => preset.amount === amount) ?? null;
}

export function integrationIdentifier(kind: "tip" | "featured" | "boost") {
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 8);
  if (kind === "tip") return `grokdex-tip-${suffix}`;
  if (kind === "boost") return `grokdex-boost-${suffix}`;
  return `grokdex-feat-${suffix}`;
}
