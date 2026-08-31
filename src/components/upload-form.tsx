"use client";

import { useActionState, useEffect, useState } from "react";
import { createListing, lookupShareLink } from "@/lib/actions";
import { CATEGORIES } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Frame } from "@/components/frame";
import { BotCover } from "@/components/bot-cover";
import { cn } from "@/lib/utils";

const initial: { error?: string; slug?: string } = {};

const fieldClass =
  "h-10 w-full rounded-lg border border-input bg-canvas-soft px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const areaClass =
  "min-h-20 w-full rounded-lg border border-input bg-canvas-soft px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function UploadForm() {
  const [state, action, pending] = useActionState(createListing, initial);
  const [lookupState, lookupAction, lookupPending] = useActionState(
    lookupShareLink,
    {}
  );
  const [shareUrl, setShareUrl] = useState("");
  const [hideLookupError, setHideLookupError] = useState(false);
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [description, setDescription] = useState("");

  const preview = lookupState.preview ?? null;
  const lookupError =
    hideLookupError || !lookupState.error ? null : lookupState.error;

  useEffect(() => {
    if (!lookupState.preview) return;
    setTitle(lookupState.preview.title);
    setAuthorName(lookupState.preview.authorName);
    setDescription(lookupState.preview.description);
  }, [lookupState.preview]);

  return (
    <form action={action} noValidate className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="shareUrl">Grok Bot share link</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="shareUrl"
            name="shareUrl"
            value={shareUrl}
            onChange={(event) => {
              setShareUrl(event.target.value);
              setHideLookupError(true);
            }}
            placeholder="https://x.ai/bot/N92u9t1nHlL_gtgk2nAeN"
            className={cn(fieldClass, "font-mono")}
            autoComplete="off"
          />
          <button
            type="submit"
            formAction={lookupAction}
            formNoValidate
            className="h-10 shrink-0 rounded-full border border-pill-border px-4 text-sm font-normal hover:bg-white/5 disabled:opacity-50"
            disabled={lookupPending}
            onClick={() => setHideLookupError(false)}
          >
            {lookupPending ? "Looking up…" : "Look up"}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          In Grok Bot, open the bot → copy its public share link. That URL is the
          template.
        </p>
      </div>

      {lookupError ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {lookupError}
          {lookupState.soft
            ? " You can still name it below and publish."
            : null}
        </p>
      ) : null}

      {preview ? (
        <Frame staticFrame>
          <BotCover
            botId={preview.botId}
            title={preview.title}
            ogImage={preview.ogImage}
            className="h-32"
          />
          <div className="px-4 py-3">
            <p className="text-lg font-normal tracking-tight">{preview.title}</p>
            <p className="text-sm text-muted-foreground">
              by {preview.authorName}
            </p>
          </div>
        </Frame>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Bot name</Label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Jarvis"
            className={fieldClass}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="authorName">Made by</Label>
          <input
            id="authorName"
            name="authorName"
            value={authorName}
            onChange={(event) => setAuthorName(event.target.value)}
            placeholder="Andrew"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">What it does</Label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="A chief of agents for a solo founder…"
          className={areaClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Job category</Label>
          <select
            id="category"
            name="category"
            defaultValue="Work"
            className={fieldClass}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <input
            id="tags"
            name="tags"
            placeholder="chief-of-staff, routing"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Why people should add it (optional)</Label>
        <textarea
          id="note"
          name="note"
          rows={3}
          placeholder="Best as the top of a solo-founder roster. Let it spawn specialists instead of doing the work itself."
          className={areaClass}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="submittedBy">Your name on this listing (optional)</Label>
        <input
          id="submittedBy"
          name="submittedBy"
          placeholder="Anonymous"
          className={fieldClass}
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
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

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-normal text-primary-foreground hover:bg-primary/90 disabled:opacity-50 sm:w-auto"
      >
        {pending ? "Publishing…" : "Publish to Grokdex"}
      </button>
    </form>
  );
}
