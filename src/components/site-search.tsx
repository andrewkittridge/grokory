import { ScanField } from "@/components/scan-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SiteSearch({
  defaultValue = "",
  size = "header",
  className,
}: {
  defaultValue?: string;
  size?: "header" | "hero" | "menu";
  className?: string;
}) {
  const ids = {
    header: "header-q",
    hero: "hero-q",
    menu: "menu-q",
  } as const;
  const inputId = ids[size];
  const header = size === "header";
  const hero = size === "hero";

  return (
    <form
      action="/templates"
      role="search"
      className={cn(
        "flex min-w-0 items-center gap-2",
        hero && "flex-col sm:flex-row",
        className
      )}
    >
      <label className="sr-only" htmlFor={inputId}>
        Search Grok Bots
      </label>
      <ScanField>
        <Input
          id={inputId}
          name="q"
          defaultValue={defaultValue}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          placeholder={
            hero ? "Search bots, authors, @handles…" : "Search the board…"
          }
          className={cn(
            "font-mono",
            header && "h-9 bg-background/70 text-sm md:h-8",
            hero && "h-11 text-sm sm:text-[15px]",
            size === "menu" && "h-9"
          )}
        />
      </ScanField>
      {header ? (
        <Button type="submit" size="sm" variant="ghost" className="sr-only">
          Search
        </Button>
      ) : (
        <Button
          type="submit"
          variant={hero ? "default" : "outline"}
          className={cn(hero && "h-11 w-full sm:w-auto", size === "menu" && "h-9")}
        >
          Search
        </Button>
      )}
    </form>
  );
}
