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
import { VoteButtons } from "@/components/vote-buttons";
import { formatCount } from "@/lib/bot-url";
import type { ListedTemplate } from "@/lib/types";

export function BotCard({ template }: { template: ListedTemplate }) {
  return (
    <Card className="h-full bg-card/80 ring-foreground/8 transition-colors hover:ring-primary/40">
      <div className="flex h-full gap-1">
        <div className="flex shrink-0 items-start pt-1 pl-1">
          <VoteButtons
            templateId={template.id}
            score={template.score}
            userVote={template.userVote}
          />
        </div>
        <div className="min-w-0 flex-1">
          <Link href={`/templates/${template.slug}`} className="block">
            <BotCover
              botId={template.botId}
              title={template.title}
              ogImage={template.ogImage}
              className="-mt-(--card-spacing) h-36 rounded-tr-xl"
            />
            <CardHeader className="pt-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  variant={template.origin === "curated" ? "default" : "outline"}
                >
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
              <span>
                {template.score === 1 ? "1 point" : `${template.score} points`}
              </span>
              <span>{formatCount(template.adds)} adds</span>
            </CardFooter>
          </Link>
        </div>
      </div>
    </Card>
  );
}
