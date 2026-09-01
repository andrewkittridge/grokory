import { CheckoutButton } from "@/components/checkout-button";
import { TIP_PRESETS } from "@/lib/pricing";

export function TipForm() {
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {TIP_PRESETS.map((preset) => (
          <CheckoutButton
            key={preset.amount}
            payload={{
              kind: "tip",
              amount: preset.amount,
              cancelPath: "/support",
            }}
            variant={preset.amount === 10 ? "default" : "outline"}
          >
            {preset.label}
          </CheckoutButton>
        ))}
        <CheckoutButton
          payload={{ kind: "tip", cancelPath: "/support" }}
          variant="outline"
        >
          Custom
        </CheckoutButton>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">
        Optional. Grokdex stays free to browse and list. Tips are not
        tax-deductible and do not feature a bot.
      </p>
    </div>
  );
}
