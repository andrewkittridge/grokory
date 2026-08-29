import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BotCover } from "@/components/bot-cover";
import { formatCount } from "@/lib/bot-url";
import type { BotTemplate } from "@/lib/types";

export function BotCard({ template }: { template: BotTemplate }) {
  return (
    <Link href={`/templates/${template.slug}`} className="group block h-full">
      <Card className="h-full bg-card/80 ring-foreground/8 transition-colors group-hover:ring-primary/40">
        <BotCover
          botId={template.botId}
          title={template.title}
          ogImage={template.ogImage}
          className="-mt-(--card-spacing) h-36 rounded-t-xl"
        />
        <CardHeader className="pt-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={template.origin === "curated" ? "default" : "outline"}>
              {template.origin === "curated" ? "Staff pick" : "Community"}
            </Badge>
            <Badge variant="secondary">{template.category}</Badge>
          </div>
          <CardTitle className="font-heading mt-2 text-xl font-normal tracking-tight">
            {template.title}
          </CardTitle>
          <CardDescription>by {template.authorName}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {template.summary}
          </p>
        </CardContent>
        <CardFooter className="justify-between text-xs text-muted-foreground">
          <span className="truncate font-mono">{template.botId}</span>
          <span>{formatCount(template.adds)} adds</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
