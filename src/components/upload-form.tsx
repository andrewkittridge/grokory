"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createListing, lookupShareLink } from "@/lib/actions";
import { parseShareUrl } from "@/lib/bot-url";
import type { BotPreview } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Frame } from "@/components/frame";
import { BotCover } from "@/components/bot-cover";
import { ScanField } from "@/components/scan-field";
import { TurnstileField } from "@/components/turnstile-field";
import { cn } from "@/lib/utils";

const initial: { error?: string; slug?: string } = {};

export function UploadForm({
  siteKey,
  defaultShareUrl,
}: {
  siteKey?: string;
  defaultShareUrl?: string;
}) {
  const [state, action, pending] = useActionState(createListing, initial);
  const [lookupState, lookupAction, lookupPending] = useActionState(
    lookupShareLink,
    {}
  );
  const [shareUrl, setShareUrl] = useState(defaultShareUrl ?? "");
  const [editFor, setEditFor] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);
  const lastLookup = useRef("");

  const parsedShare = parseShareUrl(shareUrl);
  const preview =
    lookupState.preview && parsedShare?.botId === lookupState.preview.botId
      ? lookupState.preview
      : null;
  const lookupMatches =
    !!lookupState.input &&
    (shareUrl.trim() === lookupState.input ||
      parsedShare?.botUrl === lookupState.input);
  const lookupError =
    lookupPending || !lookupMatches ? null : lookupState.error ?? null;
  const existing = lookupMatches ? lookupState.existing : undefined;
  const updating = Boolean(existing);
  const showIdentityFields =
    !updating && (!preview || editFor === preview.botId);
  const lookupReady = !parsedShare || (!lookupPending && lookupMatches);

  useEffect(() => {
    const parsed = parseShareUrl(shareUrl);
    if (!parsed) return;
    const timer = window.setTimeout(() => {
      if (lastLookup.current === parsed.botId) return;
      lastLookup.current = parsed.botId;
      const formData = new FormData();
      formData.set("shareUrl", parsed.botUrl);
      lookupAction(formData);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [shareUrl, lookupAction]);

  function runLookup(raw: string, force = false) {
    const parsed = parseShareUrl(raw);
    const formData = new FormData();
    formData.set("shareUrl", parsed?.botUrl ?? raw);
    if (parsed) {
      if (!force && lastLookup.current === parsed.botId) return;
      lastLookup.current = parsed.botId;
    } else {
      lastLookup.current = "";
    }
    lookupAction(formData);
  }

  return (
    <form
      action={(formData) => {
        setTurnstileReset((value) => value + 1);
        return action(formData);
      }}
      noValidate
      className="space-y-5"
    >
      <div className="space-y-2">
        <Label
          htmlFor="shareUrl"
          className={cn(parsedShare && "field-lock")}
        >
          Grok Bot share link
        </Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <ScanField active={lookupPending} failed={!!lookupError}>
            <Input
              id="shareUrl"
              name="shareUrl"
              value={shareUrl}
              onChange={(event) => setShareUrl(event.target.value)}
              onBlur={() => {
                if (parseShareUrl(shareUrl)) runLookup(shareUrl);
              }}
              placeholder="https://x.ai/bot/N92u9t1nHlL_gtgk2nAeN"
              className="h-10 font-mono"
              autoComplete="off"
            />
          </ScanField>
          <Button
            type="button"
            variant="outline"
            className="h-10 shrink-0"
            disabled={lookupPending}
            onClick={() => runLookup(shareUrl, true)}
          >
            {lookupPending ? "Looking up…" : "Look up"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          In Grok Bot, open the bot → copy its public share link. That URL is the
          template.
        </p>
      </div>

      {existing ? (
        <>
          <input type="hidden" name="updateFields" value="1" />
          <p className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm leading-6 text-body">
            {existing.title} is already on the board. Publishing refreshes the
            name from x.ai and any tags or note you set.{" "}
            <a className="underline" href={`/templates/${existing.slug}`}>
              Open listing
            </a>
          </p>
        </>
      ) : null}

      {lookupError ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-transparent px-3 py-2 text-sm text-destructive"
        >
          {lookupError}
          {lookupState.soft
            ? " You can still name it below and publish."
            : null}
        </p>
      ) : null}

      {preview ? (
        <div className="motion-board">
          <Frame staticFrame>
            <BotCover
              botId={preview.botId}
              title={preview.title}
              ogImage={preview.ogImage}
              className="h-28"
              acquire
            />
            <div className="px-4 py-3">
              <p className="text-lg font-normal tracking-tight">
                {preview.title}
              </p>
              <p className="text-sm text-muted-foreground">
                by {preview.authorName}
              </p>
              {!updating ? (
                <button
                  type="button"
                  className="mt-2 font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase hover:text-foreground focus-visible:ring-1 focus-visible:ring-foreground"
                  onClick={() =>
                    setEditFor((id) =>
                      id === preview.botId ? null : preview.botId
                    )
                  }
                >
                  {editFor === preview.botId
                    ? "Hide details"
                    : "Edit name and description"}
                </button>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  Name and description refresh from x.ai.
                </p>
              )}
            </div>
          </Frame>
        </div>
      ) : null}

      {updating ? null : (
        <IdentityFields
          key={preview?.botId ?? "none"}
          preview={preview}
          open={showIdentityFields}
        />
      )}

      <div className="space-y-2">
        <Label htmlFor="xHandle">X handle (optional)</Label>
        <Input
          key={`${existing?.slug ?? "new"}-handle`}
          id="xHandle"
          name="xHandle"
          placeholder="@handle"
          defaultValue={existing?.xHandle ? `@${existing.xHandle}` : ""}
          readOnly={Boolean(existing?.xHandle)}
          className="h-10"
          autoComplete="off"
        />
        <p className="text-xs text-muted-foreground">
          {existing?.xHandle
            ? "This listing already has an X handle. The first one sticks."
            : updating
              ? "Shown on the listing. Not a login, and we do not verify you own that account. The first handle sticks."
              : "Shown on the listing. Not a login, and we do not verify you own that account. Already listed? Paste the same share link and add a handle — the first one sticks."}
        </p>
      </div>

      <details className="rounded-lg border border-border" open={updating}>
        <summary className="cursor-pointer px-3 py-2 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase hover:text-foreground focus-visible:ring-1 focus-visible:ring-foreground">
          Tags, note, your name
        </summary>
        <div className="space-y-4 border-t border-border px-3 py-4">
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              key={`${existing?.slug ?? "new"}-tags`}
              id="tags"
              name="tags"
              defaultValue={existing?.tags.join(", ") ?? ""}
              placeholder="chief-of-staff, routing"
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Why people should add it (optional)</Label>
            <Textarea
              key={`${existing?.slug ?? "new"}-note`}
              id="note"
              name="note"
              rows={3}
              defaultValue={existing?.note ?? ""}
              placeholder="Best as the top of a solo-founder roster. Let it spawn specialists instead of doing the work itself."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="submittedBy">Your name on this listing (optional)</Label>
            <Input
              id="submittedBy"
              name="submittedBy"
              placeholder="Anonymous"
              className="h-10"
            />
          </div>
        </div>
      </details>

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-transparent px-3 py-2 text-sm text-destructive"
        >
          {state.error}
          {state.slug ? (
            <>
              {" "}
              <a className="underline" href={`/templates/${state.slug}`}>
                Open the existing listing
              </a>
            </>
          ) : null}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        {siteKey ? (
          <TurnstileField siteKey={siteKey} resetKey={turnstileReset} />
        ) : null}
        <Button
          type="submit"
          disabled={pending || !lookupReady}
          className="btn-ignite h-10 w-full sm:w-auto"
        >
          {pending
            ? updating
              ? "Updating…"
              : "Publishing…"
            : !lookupReady
              ? "Looking up…"
              : updating
                ? "Update listing"
                : "Publish to Grokdex"}
        </Button>
      </div>
    </form>
  );
}

function IdentityFields({
  preview,
  open,
}: {
  preview: BotPreview | null;
  open: boolean;
}) {
  const [title, setTitle] = useState(preview?.title ?? "");
  const [authorName, setAuthorName] = useState(preview?.authorName ?? "");
  const [description, setDescription] = useState(preview?.description ?? "");

  if (!open) {
    return (
      <>
        <input type="hidden" name="title" value={title} />
        <input type="hidden" name="authorName" value={authorName} />
        <input type="hidden" name="description" value={description} />
      </>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title" className={cn(title && "field-lock")}>
            Bot name
          </Label>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Jarvis"
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="authorName"
            className={cn(authorName && "field-lock")}
          >
            Made by
          </Label>
          <Input
            id="authorName"
            name="authorName"
            value={authorName}
            onChange={(event) => setAuthorName(event.target.value)}
            placeholder="Andrew"
            className="h-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="description"
          className={cn(description && "field-lock")}
        >
          What it does
        </Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="A chief of agents for a solo founder…"
        />
      </div>
    </>
  );
}
