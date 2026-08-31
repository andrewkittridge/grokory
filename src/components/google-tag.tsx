export function GoogleTag({
  gaId,
  awId,
  addLabel,
  listLabel,
}: {
  gaId?: string;
  awId?: string;
  addLabel?: string;
  listLabel?: string;
}) {
  const id = gaId || awId;
  if (!id) return null;

  const config = [
    gaId ? `gtag('config','${gaId}');` : "",
    awId ? `gtag('config','${awId}');` : "",
  ].join("");

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__grokdexAds=${JSON.stringify({
            awId: awId ?? "",
            addLabel: addLabel ?? "",
            listLabel: listLabel ?? "",
          })};`,
        }}
      />
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${id}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());${config}`,
        }}
      />
    </>
  );
}
