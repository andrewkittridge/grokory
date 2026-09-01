import { AddBotButton } from "@/components/add-bot-button";
import { CopyLinkButton } from "@/components/copy-link-button";
import { Frame } from "@/components/frame";
import { ListingTrust } from "@/components/listing-trust";
import { cn } from "@/lib/utils";
import type { ListedTemplate } from "@/lib/types";

export function AddProcedure({
  template,
  listingUrl,
}: {
  template: ListedTemplate;
  listingUrl: string;
}) {
  return (
    <Frame staticFrame matClassName="p-5">
      <p className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
        Add
      </p>
      <ol className="mt-4 space-y-5">
        <li
          className="procedure-step procedure-step-live"
          data-step="01"
        >
          <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            Acquire
          </p>
          <p className="mt-1.5 break-all font-mono text-xs text-foreground">
            {template.botUrl}
          </p>
        </li>
        <li className="procedure-step" data-step="02">
          <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            Copy
          </p>
          <div className="mt-2 flex flex-col gap-2">
            <CopyLinkButton url={template.botUrl} />
            <CopyLinkButton url={listingUrl} label="Copy listing link" />
          </div>
        </li>
        <li
          className={cn(
            "procedure-step",
            template.live && "procedure-step-live"
          )}
          data-step="03"
        >
          <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            Ignite
          </p>
          <div className="mt-2">
            {template.live ? (
              <AddBotButton
                slug={template.slug}
                botUrl={template.botUrl}
                size="lg"
              />
            ) : (
              <p className="rounded-lg border border-destructive/40 bg-transparent px-3 py-2 text-sm text-destructive">
                This share link is down on x.ai. It is hidden from the board
                until the preview comes back.
              </p>
            )}
          </div>
        </li>
      </ol>
      <div className="mt-5 border-t border-border pt-4">
        <ListingTrust template={template} listingUrl={listingUrl} />
        <p className="mt-3 text-xs text-muted-foreground">
          Listed by {template.submittedBy}
        </p>
      </div>
    </Frame>
  );
}
