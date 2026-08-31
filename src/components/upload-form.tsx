"use client";

import { useActionState, useEffect, useState } from "react";
import { createListing, lookupShareLink } from "@/lib/actions";
import { CATEGORIES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Frame } from "@/components/frame";
import { BotCover } from "@/components/bot-cover";
import { TurnstileField } from "@/components/turnstile-field";

const initial: { error?: string; slug?: string } = {};

export function UploadForm({ siteKey }: { siteKey?: string }) {
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
  const [turnstileReset, setTurnstileReset] = useState(0);

  const preview = lookupState.preview ?? null;
  const lookupError =
    hideLookupError || !lookupState.error ? null : lookupState.error;

  useEffect(() => {
    if (!lookupState.preview) return;
    setTitle(lookupState.preview.title);
    setAuthorName(lookupState.preview.authorName);
    setDescription(lookupState.preview.description);
  }, [lookupState.preview]);

  useEffect(() => {
    if (!siteKey) return;
    if (!lookupState.error && !lookupState.preview && !lookupState.soft) return;
    setTurnstileReset((value) => value + 1);
  }, [lookupState, siteKey]);

  useEffect(() => {
    if (!siteKey || !state.error) return;
    setTurnstileReset((value) => value + 1);
  }, [state, siteKey]);

  return (
    <form action={action} noValidate className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="shareUrl">Grok Bot share link</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="shareUrl"
            name="shareUrl"
            value={shareUrl}
            onChange={(event) => {
              setShareUrl(event.target.value);
              setHideLookupError(true);
            }}
            placeholder="https://x.ai/bot/N92u9t1nHlL_gtgk2nAeN"
            className="h-10 font-mono"
            autoComplete="off"
          />
          <Button
            type="submit"
            formAction={lookupAction}
            formNoValidate
            variant="outline"
            className="h-10 shrink-0"
            disabled={lookupPending}
            onClick={() => setHideLookupError(false)}
          >
            {lookupPending ? "Looking up…" : "Look up"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          In Grok Bot, open the bot → copy its public share link. That URL is the
          template.
        </p>
        {siteKey ? (
          <div className="pt-2">
            <TurnstileField siteKey={siteKey} resetKey={turnstileReset} />
          </div>
        ) : null}
      </div>

      {lookupError ? (
        <p
          role="alert"
          className="border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
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
            className="h-28"
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
          <Label htmlFor="authorName">Made by</Label>
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
            defaultValue="Work"
            className="h-10 w-full rounded-none border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-foreground focus-visible:ring-1 focus-visible:ring-foreground"
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
            className="h-10"
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
        <Input
          id="submittedBy"
          name="submittedBy"
          placeholder="Anonymous"
          className="h-10"
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
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

      <Button type="submit" disabled={pending} className="h-10 w-full sm:w-auto">
        {pending ? "Publishing…" : "Publish to Grokdex"}
      </Button>
    </form>
  );
}
