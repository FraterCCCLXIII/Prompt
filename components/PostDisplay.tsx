import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DisplayPost = {
  slug: string;
  title: string | null;
  content: string;
  createdAt: Date | string;
};

type PostDisplayProps = {
  post: DisplayPost;
  className?: string;
  showDate?: boolean;
};

export function PostDisplay({ post, className, showDate = true }: PostDisplayProps) {
  const createdAt =
    typeof post.createdAt === "string" ? new Date(post.createdAt) : post.createdAt;
  const wordCount = post.content.trim().split(/\s+/).filter(Boolean).length;
  const isLongPost = wordCount > 80;
  const formattedDate = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(createdAt);

  return (
    <article
      className={cn(
        "mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col justify-center px-6 py-16",
        isLongPost ? "text-left" : "text-center",
        className,
      )}
    >
      {post.title ? (
        <p
          className={cn(
            "mb-8 text-sm font-medium uppercase tracking-[0.28em] text-muted-foreground",
            !isLongPost && "text-center",
          )}
        >
          {post.title}
        </p>
      ) : null}
      <p
        className={cn(
          "whitespace-pre-wrap font-serif tracking-[-0.03em] text-foreground",
          isLongPost
            ? "text-2xl leading-relaxed md:text-4xl md:leading-relaxed"
            : "text-4xl leading-tight md:text-6xl md:leading-[1.04]",
        )}
      >
        {post.content}
      </p>
      <div
        className={cn(
          "mt-10 flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row",
          isLongPost ? "items-start justify-start" : "items-center justify-center",
        )}
      >
        {showDate ? (
          <time dateTime={createdAt.toISOString()}>
            {formattedDate}
          </time>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="default"
          className="text-muted-foreground"
          aria-label="Report this post"
        >
          <Flag className="size-4" aria-hidden="true" />
          Report
        </Button>
      </div>
    </article>
  );
}
