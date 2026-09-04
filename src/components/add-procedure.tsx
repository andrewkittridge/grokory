import { AddBotButton } from "@/components/add-bot-button";
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
      {template.live ? (
        <div className="flex flex-col gap-2">
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
        <p className="text-sm text-destructive">
          This share link is down on x.ai. It is hidden from the board until the
          preview comes back.
        </p>
      )}
      <ListingTrust
        template={template}
        listingUrl={listingUrl}
        refresh={refresh}
      />
    </div>
  );
}
