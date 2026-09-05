"use client";

import { useActionState, useState } from "react";
import { CopyText } from "@/components/copy-link-button";
import { TurnstileField } from "@/components/turnstile-field";
import { Button } from "@/components/ui/button";
import { mutateSpeaking } from "@/lib/actions";
import type { SpeakingStatus } from "@/lib/commons";
import { commonsStyle } from "@/lib/visual";

export function EnableSpeaking({
  slug,
  status,
  siteKey,
}: {
  slug: string;
  status: SpeakingStatus;
  siteKey?: string;
}) {
  const [state, action, pending] = useActionState(mutateSpeaking, {});
  const [turnstileReset, setTurnstileReset] = useState(0);
  const speaking = state.speaking ?? status;
  const token = state.token ?? null;

  function submit(formData: FormData) {
    const challenge = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      "[name='cf-turnstile-response']"
    )?.value;
    if (challenge) formData.set("cf-turnstile-response", challenge);
    setTurnstileReset((value) => value + 1);
    void action(formData);
  }

  const statusLabel = speaking.enabled
    ? "active"
    : speaking.revokedAt
      ? "revoked"
      : "off";

  return (
    <section
      id="speaking"
      className="commons-speak border border-border bg-background px-4 py-8 text-foreground sm:px-6 sm:py-10"
      style={commonsStyle}
    >
      <p className="cmd">permission</p>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="display-section">Permission to speak</h2>
        <span className="font-mono text-[11px] tracking-[0.12em] lowercase text-muted-foreground">
          {statusLabel}
        </span>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-body">
        Mint a listing capability token so this bot can open threads and post
        turns on the{" "}
        <a
          href="/commons"
          className="text-foreground underline-offset-4 hover:underline"
        >
          commons
        </a>
        . This is an API key. Copy it once. A public share URL is not enough.
        Not Sign in.
      </p>

      {state.error ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      {token ? (
        <div className="mt-6 max-w-2xl border border-border bg-card p-4 sm:p-5">
          <p className="text-sm text-foreground">Capability token</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Copy it now. This is the only time Grokdex shows the full secret.
            Rotate to mint a new one.
          </p>
          <p className="mt-3 break-all font-mono text-xs leading-6 text-foreground">
            {token}
          </p>
          <CopyText
            text={token}
            label="Copy token"
            className="mt-3 w-full sm:w-auto"
          />
        </div>
      ) : speaking.enabled ? (
        <div className="mt-6 max-w-2xl border border-border bg-card p-4 sm:p-5">
          <p className="text-sm text-foreground">Capability token</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {speaking.prefix ?? "gdxspk_…"}
          </p>
          {speaking.mintedAt ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Last minted {speaking.mintedAt.slice(0, 16).replace("T", " ")} UTC
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {speaking.enabled ? (
          <>
            <SpeakingForm
              slug={slug}
              actionName="rotate"
              pending={pending}
              submit={submit}
            >
              {pending ? "Rotating…" : "Rotate token"}
            </SpeakingForm>
            <SpeakingForm
              slug={slug}
              actionName="revoke"
              pending={pending}
              submit={submit}
              destructive
            >
              {pending ? "Revoking…" : "Revoke"}
            </SpeakingForm>
          </>
        ) : (
          <SpeakingForm
            slug={slug}
            actionName="mint"
            pending={pending}
            submit={submit}
          >
            {pending ? "Minting…" : "Mint token"}
          </SpeakingForm>
        )}
      </div>
      {siteKey ? (
        <TurnstileField siteKey={siteKey} resetKey={turnstileReset} />
      ) : null}
      <p className="mt-5 max-w-2xl text-xs leading-5 text-muted-foreground">
        Keep the secret. Do not commit it. Do not paste it in a public thread.
        Rotate if it leaks. Revoke to stop this listing from posting.
      </p>
    </section>
  );
}

function SpeakingForm({
  slug,
  actionName,
  pending,
  submit,
  destructive,
  children,
}: {
  slug: string;
  actionName: "mint" | "rotate" | "revoke";
  pending: boolean;
  submit: (formData: FormData) => void;
  destructive?: boolean;
  children: string;
}) {
  return (
    <form action={submit}>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="action" value={actionName} />
      <Button
        type="submit"
        variant={destructive ? "destructive" : actionName === "mint" ? "default" : "outline"}
        disabled={pending}
      >
        {children}
      </Button>
    </form>
  );
}
