"use client";

import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { ArrowNavigation } from "@/components/ArrowNavigation";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { type DisplayPost, PostDisplay } from "@/components/PostDisplay";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FullscreenPostViewerProps = {
  initialPost: DisplayPost | null;
  open: boolean;
  requestedDirection: {
    direction: "previous" | "random" | "next";
    id: number;
  } | null;
  onClose: () => void;
};

export function FullscreenPostViewer({
  initialPost,
  open,
  requestedDirection,
  onClose,
}: FullscreenPostViewerProps) {
  const [post, setPost] = useState<DisplayPost | null>(initialPost);
  const currentSlugRef = useRef(initialPost?.slug ?? null);
  const [isPending, startTransition] = useTransition();

  const loadPost = useCallback(
    (direction: "previous" | "next" | "random") => {
      startTransition(async () => {
        const params = new URLSearchParams({ direction });

        if (currentSlugRef.current) {
          params.set("slug", currentSlugRef.current);
        }

        const response = await fetch(`/api/posts/viewer?${params.toString()}`);
        const data = (await response.json()) as { post: DisplayPost | null };

        if (data.post) {
          currentSlugRef.current = data.post.slug;
          setPost(data.post);
        }
      });
    },
    [startTransition],
  );

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (open && requestedDirection) {
      loadPost(requestedDirection.direction);
    }
  }, [loadPost, open, requestedDirection]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!open) {
        return;
      }

      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowLeft") {
        loadPost("previous");
      }

      if (event.key === "ArrowRight") {
        loadPost("next");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col bg-background transition duration-300 ease-out",
        open
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
      )}
      aria-hidden={!open}
    >
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <Button type="button" variant="ghost" size="icon" onClick={onClose}>
          <X className="size-5" aria-hidden="true" />
          <span className="sr-only">Close viewer</span>
        </Button>
        {post ? <CopyLinkButton slug={post.slug} label="Share" /> : null}
      </header>

      <main
        className={cn(
          "grid flex-1 place-items-center transition-opacity duration-300",
          isPending ? "opacity-45" : "opacity-100",
        )}
      >
        {post ? (
          <PostDisplay post={post} showDate={false} />
        ) : (
          <div className="px-6 text-center">
            <p className="font-serif text-4xl tracking-[-0.04em]">
              Nothing has been written yet.
            </p>
            <p className="mt-4 text-muted-foreground">
              Create the first prompt, then come back here.
            </p>
          </div>
        )}
      </main>

      <footer className="px-5 py-6 sm:px-8">
        <ArrowNavigation
          onPrevious={() => loadPost("previous")}
          onRandom={() => loadPost("random")}
          onNext={() => loadPost("next")}
          disabled={isPending || !post}
        />
      </footer>
    </div>
  );
}
