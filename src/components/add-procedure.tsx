import { AddBotButton } from "@/components/add-bot-button";
import { CopyLinkButton } from "@/components/copy-link-button";
import { ListingTrust } from "@/components/listing-trust";
import { Button } from "@/components/ui/button";
import type { ListedTemplate } from "@/lib/types";
import type { ReactNode } from "react";

export function AddProcedure({
  template,
  listingUrl,
  refresh,
}: {
  template: ListedTemplate;
  listingUrl: string;
  refresh?: ReactNode;
}) {
  return (
    <div>
      <p className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
        Add to Grok
      </p>
      {template.live ? (
        <div className="mt-4 flex flex-col gap-2">
          <AddBotButton
            slug={template.slug}
            botId={template.botId}
            size="lg"
          />
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            nativeButton={false}
            render={
              <a
                href={template.botUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            Preview on x.ai
          </Button>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Add opens the Grok Bot app and copies the template onto your
            account. Preview if you don’t have it. Third-party template: keep
            sends, buys, and deletes behind your approval.
          </p>
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-destructive/40 bg-transparent px-3 py-2 text-sm text-destructive">
          This share link is down on x.ai. It is hidden from the board until the
          preview comes back.
        </p>
      )}
      <div className="mt-5 flex flex-col gap-2 border-t border-border pt-4">
        <CopyLinkButton url={template.botUrl} label="Copy share link" />
        <CopyLinkButton url={listingUrl} label="Copy listing link" />
      </div>
      <div className="mt-5 border-t border-border pt-4">
        <ListingTrust
          template={template}
          listingUrl={listingUrl}
          refresh={refresh}
        />
        <p className="mt-3 text-xs text-muted-foreground">
          Listed by {template.submittedBy}
        </p>
      </div>
    </div>
  );
}
