const BUTTON_CLASS =
  "inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted sm:w-auto";

function escapeAttr(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Inline handler so the label changes even if React has not hydrated yet.
const COPY_HANDLER =
  "var b=this;var u=b.getAttribute('data-url')||'';var l=b.getAttribute('data-label')||'Copy share link';function f(){var t=document.createElement('textarea');t.value=u;t.setAttribute('readonly','');t.style.cssText='position:fixed;left:-9999px';document.body.appendChild(t);t.select();document.execCommand('copy');document.body.removeChild(t);}try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(u).catch(f);}else{f();}}catch(e){f();}b.textContent='Copied';clearTimeout(Number(b.getAttribute('data-t')||0));b.setAttribute('data-t',String(setTimeout(function(){b.textContent=l;},1800)));";

export function CopyLinkButton({
  url,
  label = "Copy share link",
}: {
  url: string;
  label?: string;
}) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<button type="button" class="${BUTTON_CLASS}" data-url="${escapeAttr(url)}" data-label="${escapeAttr(label)}" aria-live="polite" onclick="${COPY_HANDLER}">${escapeAttr(label)}</button>`,
      }}
    />
  );
}
