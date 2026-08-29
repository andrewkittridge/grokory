"use client";

import { useActionState, useState, useTransition } from "react";
import { createListing, previewShareLink } from "@/lib/actions";
import { CATEGORIES } from "@/lib/types";
import type { BotPreview } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { BotCover } from "@/components/bot-cover";
import { cn } from "@/lib/utils";

const initial: { error?: string; slug?: string } = {};

const fieldClass =
  "h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const areaClass =
  "min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function UploadForm() {
  const [state, action, pending] = useActionState(createListing, initial);
  const [previewPending, startPreview] = useTransition();
  const [shareUrl, setShareUrl] = useState("");
  const [preview, setPreview] = useState<BotPreview | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [description, setDescription] = useState("");

  function lookup() {
    const value = shareUrl.trim();
    if (!value) {
      setLookupError("Paste a Grok Bot share link first.");
      return;
    }
    setLookupError(null);
    startPreview(async () => {
      const result = await previewShareLink(value);
      if (!result.ok) {
        setPreview(null);
        setLookupError(result.error);
        return;
      }
      setPreview(result.preview);
      setTitle(result.preview.title);
      setAuthorName(result.preview.authorName);
      setDescription(result.preview.description);
    });
  }

  return (
    <form action={action} noValidate className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="shareUrl">Grok Bot share link</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="shareUrl"
            name="shareUrl"
            value={shareUrl}
            onChange={(event) => setShareUrl(event.target.value)}
            placeholder="https://x.ai/bot/N92u9t1nHlL_gtgk2nAeN"
            className={cn(fieldClass, "font-mono")}
            autoComplete="off"
          />
          <button
            type="button"
            className="h-10 shrink-0 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted"
            disabled={previewPending}
            onClick={lookup}
          >
            {previewPending ? "Looking up…" : "Look up"}
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
          {lookupError} You can still name it below and publish.
        </p>
      ) : null}

      {preview ? (
        <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
          <BotCover
            botId={preview.botId}
            title={preview.title}
            ogImage={preview.ogImage}
            className="h-32"
          />
          <div className="bg-card px-4 py-3">
            <p className="font-heading text-lg">{preview.title}</p>
            <p className="text-sm text-muted-foreground">
              by {preview.authorName}
            </p>
          </div>
        </div>
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
        className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50 sm:w-auto"
      >
        {pending ? "Publishing…" : "Publish to Grokory"}
      </button>
    </form>
  );
}
