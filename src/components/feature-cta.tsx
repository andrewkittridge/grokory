import { CheckoutButton } from "@/components/checkout-button";
import { Frame } from "@/components/frame";
import { cn } from "@/lib/utils";
import {
  canBuyFeatured,
  formatFeaturedUntil,
  isFeaturedActive,
} from "@/lib/featured";
import { FEATURED_PLANS } from "@/lib/pricing";
import type { ListedTemplate } from "@/lib/types";

export function FeaturedMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-mono text-[10px] tracking-[0.14em] text-sunset uppercase",
        className
      )}
    >
      Featured
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
        {until ? `Featured through ${until}.` : "Feature this bot."}
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
              {gate.extend ? "Extend " : ""}
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
