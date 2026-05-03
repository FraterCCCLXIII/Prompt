import { ArrowLeft, ArrowRight, Shuffle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type FloatingPostActionsProps = {
  previousSlug?: string | null;
  randomSlug?: string | null;
  nextSlug?: string | null;
};

export function FloatingPostActions({
  previousSlug,
  randomSlug,
  nextSlug,
}: FloatingPostActionsProps) {
  return (
    <div className="fixed inset-x-0 bottom-6 z-10 px-5 sm:px-8">
      <nav className="flex items-center justify-center gap-3" aria-label="Post navigation">
        {previousSlug ? (
          <Button asChild variant="outline" size="icon">
            <Link href={`/p/${previousSlug}`} aria-label="Previous post">
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <Button type="button" variant="outline" size="icon" disabled aria-label="Previous post">
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Button>
        )}
        {randomSlug ? (
          <Button asChild variant="outline" size="icon">
            <Link href={`/p/${randomSlug}`} aria-label="Random post">
              <Shuffle className="size-5" aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <Button type="button" variant="outline" size="icon" disabled aria-label="Random post">
            <Shuffle className="size-5" aria-hidden="true" />
          </Button>
        )}
        {nextSlug ? (
          <Button asChild variant="outline" size="icon">
            <Link href={`/p/${nextSlug}`} aria-label="Next post">
              <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <Button type="button" variant="outline" size="icon" disabled aria-label="Next post">
            <ArrowRight className="size-5" aria-hidden="true" />
          </Button>
        )}
      </nav>
      <div className="absolute bottom-0 right-5 sm:right-8">
        <Button asChild size="lg">
          <Link href="/">Write your own</Link>
        </Button>
      </div>
    </div>
  );
}
