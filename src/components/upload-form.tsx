"use client";

import { useActionState, useState, useTransition } from "react";
import { createListing, previewShareLink } from "@/lib/actions";
import { CATEGORIES } from "@/lib/types";
import type { BotPreview } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BotCover } from "@/components/bot-cover";

const initial: { error?: string; slug?: string } = {};

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
    setLookupError(null);
    startPreview(async () => {
      const result = await previewShareLink(shareUrl);
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
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="shareUrl">Grok Bot share link</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="shareUrl"
            name="shareUrl"
            required
            value={shareUrl}
            onChange={(event) => setShareUrl(event.target.value)}
            onBlur={() => {
              if (shareUrl.trim()) lookup();
            }}
            placeholder="https://x.ai/bot/N92u9t1nHlL_gtgk2nAeN"
            className="h-10 font-mono"
          />
          <Button
            type="button"
            variant="outline"
            className="h-10"
            disabled={previewPending || !shareUrl.trim()}
            onClick={lookup}
          >
            {previewPending ? "Looking up…" : "Look up"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          In Grok Bot, open the bot → copy its public share link. That URL is the
          template.
        </p>
      </div>

      {lookupError ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
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
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Jarvis"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="authorName">Made by</Label>
          <Input
            id="authorName"
            name="authorName"
            value={authorName}
            onChange={(event) => setAuthorName(event.target.value)}
            placeholder="Andrew"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">What it does</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="A chief of agents for a solo founder…"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Job category</Label>
          <select
            id="category"
            name="category"
            required
            defaultValue="Work"
            className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
          <Input
            id="tags"
            name="tags"
            placeholder="chief-of-staff, routing"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Why people should add it (optional)</Label>
        <Textarea
          id="note"
          name="note"
          rows={3}
          placeholder="Best as the top of a solo-founder roster. Let it spawn specialists instead of doing the work itself."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="submittedBy">Your name on this listing (optional)</Label>
        <Input id="submittedBy" name="submittedBy" placeholder="Anonymous" />
      </div>

      {state.error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
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

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Publishing…" : "Publish to Grokory"}
      </Button>
    </form>
  );
}
