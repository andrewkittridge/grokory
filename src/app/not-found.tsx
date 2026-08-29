import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-20 text-center">
      <p className="font-mono text-sm text-primary">404</p>
      <h1 className="font-heading mt-3 text-4xl tracking-tight">
        That bot is not in the library.
      </h1>
      <p className="mt-3 text-muted-foreground">
        The listing may have been removed, or the link is wrong.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button nativeButton={false} render={<Link href="/templates" />}>
          Browse bots
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/upload" />}
        >
          Share a link
        </Button>
      </div>
    </main>
  );
}
