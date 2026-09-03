export default function CatalogLoading() {
  return (
    <main>
      <div className="mx-auto w-full max-w-6xl px-4 pt-14 pb-8 sm:px-6 sm:pt-20">
        <div className="h-10 w-48 animate-pulse rounded-md bg-canvas-soft sm:h-12" />
        <div className="mt-4 h-4 w-full max-w-xl animate-pulse bg-canvas-soft" />
      </div>
      <div className="border-y border-border">
        <div className="mx-auto flex h-12 w-full max-w-6xl items-center gap-2 px-4 sm:px-6">
          <div className="h-8 min-w-0 flex-1 animate-pulse rounded-lg bg-canvas-soft" />
          <div className="h-8 w-20 shrink-0 animate-pulse rounded-full bg-canvas-soft" />
          <div className="h-8 w-28 shrink-0 animate-pulse rounded-full bg-canvas-soft" />
        </div>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="empty-scan relative overflow-hidden py-6">
            <div className="mx-auto mb-4 flex w-full max-w-6xl justify-between px-4 sm:px-6">
              <div className="h-3 w-20 animate-pulse bg-canvas-soft" />
              <div className="h-3 w-24 animate-pulse bg-canvas-soft" />
            </div>
            <div className="flex gap-3 px-4 sm:px-6">
              {Array.from({ length: 7 }).map((__, token) => (
                <div
                  key={token}
                  className="h-28 w-20 shrink-0 animate-pulse rounded-full bg-canvas-soft"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
