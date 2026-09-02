import { CopyText } from "@/components/copy-link-button";
import { MCP_PATH, SKILL_DOCS } from "@/lib/agent";
import { cn } from "@/lib/utils";
import { absUrl } from "@/lib/site";

export function BotListPaste({
  compact = false,
}: {
  compact?: boolean;
}) {
  const skill = SKILL_DOCS["list-a-grok-bot"].body.trim();
  const mcpUrl = absUrl(MCP_PATH);

  if (compact) {
    return (
      <div
        id="agent"
        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-5"
      >
        <div className="min-w-0">
          <p className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
            Have your bot list it
          </p>
          <p className="mt-0.5 text-sm leading-5 text-body">
            Paste into your Grok Bot, then say list me on Grokdex.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <CopyText
            text={skill}
            label="Copy skill"
            className={compactCopyClass}
          />
          <CopyText
            text={mcpUrl}
            label="Copy MCP"
            className={compactCopyClass}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          Have your bot list it
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Paste this skill into your Grok Bot. Then tell it: list me on Grokdex.
        </p>
      </div>
      <pre className="max-h-40 overflow-auto rounded-lg border border-border/80 bg-transparent p-3 font-mono text-[11px] leading-5 whitespace-pre-wrap text-muted-foreground">
        {skill}
      </pre>
      <CopyText text={skill} label="Copy skill" />
      <div className="border-t border-border pt-4">
        <p className="text-sm leading-6 text-muted-foreground">
          Or add Grokdex as a custom connector. The bot can then call{" "}
          <span className="font-mono text-xs">list_bot</span>.
        </p>
        <p className="mt-3 break-all font-mono text-xs text-foreground">
          {mcpUrl}
        </p>
        <div className="mt-3">
          <CopyText text={mcpUrl} label="Copy MCP URL" />
        </div>
      </div>
    </div>
  );
}

const compactCopyClass = cn(
  "h-8 min-h-8 w-auto flex-1 px-3 text-[0.8rem] sm:flex-none"
);
