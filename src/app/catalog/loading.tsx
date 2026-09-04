import { BotIdentityThumb } from "@/components/bot-identity";

export default function CatalogLoading() {
  return (
    <main>
      <div className="mx-auto w-full max-w-6xl px-4 pt-8 pb-4 sm:px-6 sm:pt-14">
        <h1 className="display-page">Catalog</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-body">
          The ranked board, marching.
        </p>
      </div>
      <div className="divide-y divide-border border-y border-border">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="py-6">
            <div className="mx-auto flex w-full max-w-6xl gap-3 overflow-hidden px-4 sm:px-6">
              {Array.from({ length: 7 }).map((__, token) => (
                <BotIdentityThumb
                  key={token}
                  size="lg"
                  className="is-ghost shrink-0"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
