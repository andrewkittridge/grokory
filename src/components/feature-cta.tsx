import { CheckoutButton } from "@/components/checkout-button";
import { Frame } from "@/components/frame";
import { cn } from "@/lib/utils";
import { canBuyBoost, isBoostedActive } from "@/lib/boost";
import {
  canBuyFeatured,
  formatFeaturedUntil,
  isFeaturedActive,
} from "@/lib/featured";
import { BOOST_PLANS, FEATURED_PLANS } from "@/lib/pricing";
import type { ListedTemplate } from "@/lib/types";

export function FeaturedMark({ className }: { className?: string }) {
  return (
    <span
      title="Paid placement, not an endorsement"
      className={cn(
        "font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase",
        className
      )}
    >
      Featured
    </span>
  );
}

export function BoostedMark({ className }: { className?: string }) {
  return (
    <span
      title="Paid placement, not an endorsement"
      className={cn(
        "font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase",
        className
      )}
    >
      Boosted
    </span>
  );
}

export function FeatureCta({
  template,
  listings,
  enabled,
}: {
  template: ListedTemplate;
  listings: ListedTemplate[];
  enabled: boolean;
}) {
  if (!enabled) return null;

  const gate = canBuyFeatured(listings, template);
  const until =
    isFeaturedActive(template) && template.featuredUntil
      ? formatFeaturedUntil(template.featuredUntil)
      : null;
  const cancelPath = `/templates/${template.slug}`;

  return (
    <Frame staticFrame matClassName="p-5">
      <p
        id="feature"
        className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase"
      >
        Featured
      </p>
      <p className="mt-2 text-lg tracking-[-0.02em]">
        {until ? `Featured through ${until}.` : "Pin this bot on the board."}
      </p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        Labeled pin on home and the board. Organic rank stays as it is. Paid
        placement, not an endorsement.
      </p>
      {gate.ok ? (
        <div className="mt-4 grid gap-2">
          {FEATURED_PLANS.map((plan) => (
            <CheckoutButton
              key={plan.id}
              payload={{
                kind: "featured",
                slug: template.slug,
                plan: plan.id,
                cancelPath,
              }}
              variant={plan.id === "week" ? "default" : "outline"}
            >
              {gate.extend ? "Extend " : "Pin "}
              {plan.priceLabel} · {plan.durationLabel}
            </CheckoutButton>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">{gate.reason}</p>
      )}
    </Frame>
  );
}

export function BoostCta({
  template,
  listings,
  enabled,
}: {
  template: ListedTemplate;
  listings: ListedTemplate[];
  enabled: boolean;
}) {
  if (!enabled) return null;

  const gate = canBuyBoost(listings, template);
  const until =
    isBoostedActive(template) && template.boostedUntil
      ? formatFeaturedUntil(template.boostedUntil)
      : null;
  const cancelPath = `/templates/${template.slug}`;

  return (
    <Frame staticFrame matClassName="p-5">
      <p className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
        Boost
      </p>
      <p className="mt-2 text-lg tracking-[-0.02em]">
        {until ? `Boosted through ${until}.` : "Boost this bot on the board."}
      </p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        Labeled strip on the board. Not a homepage pin. Organic rank stays as
        it is. Paid placement, not an endorsement.
      </p>
      {gate.ok ? (
        <div className="mt-4 grid gap-2">
          {BOOST_PLANS.map((plan) => (
            <CheckoutButton
              key={plan.id}
              payload={{
                kind: "boost",
                slug: template.slug,
                plan: plan.id,
                cancelPath,
              }}
              variant={plan.id === "week" ? "default" : "outline"}
            >
              {gate.extend ? "Extend " : "Boost "}
              {plan.priceLabel} · {plan.durationLabel}
            </CheckoutButton>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">{gate.reason}</p>
      )}
    </Frame>
  );
}
