"use client";

import { ArrowLeft, ArrowRight, Loader2, Shuffle } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { createPostAction, type CreatePostState } from "@/app/actions/posts";
import { AsciiLogo } from "@/components/AsciiLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VisibilityDropdown } from "@/components/VisibilityDropdown";

type PostEditorProps = {
  hasViewerPost: boolean;
  previousSlug?: string | null;
  randomSlug?: string | null;
  nextSlug?: string | null;
};

const initialState: CreatePostState = {};

export function PostEditor({
  hasViewerPost,
  previousSlug,
  randomSlug,
  nextSlug,
}: PostEditorProps) {
  const [state, formAction, isPending] = useActionState(
    createPostAction,
    initialState,
  );

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-center px-5 py-8 pb-28 sm:px-8">
      <div
        className="absolute left-5 top-4 text-2xl leading-none text-foreground sm:left-8"
        aria-label="Prompt"
      >
        <AsciiLogo />
      </div>
      <div className="mb-10 text-center">
        <h1 className="font-serif text-5xl tracking-[-0.05em] text-foreground md:text-7xl">
          Say only what matters.
        </h1>
      </div>

      <form action={formAction} className="space-y-4">
        <Input
          name="title"
          placeholder="Optional title"
          aria-label="Post title"
          maxLength={120}
        />
        <Textarea
          name="content"
          placeholder="Write something…"
          aria-label="Post content"
          // maxLength={MAX_POST_LENGTH + 1}
          required
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-6 text-sm">
            {state.error ? (
              <p className="text-destructive" role="alert">
                {state.error}
              </p>
            ) : null}
          </div>
          <div className="flex items-center justify-end gap-3">
            <VisibilityDropdown />
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              Post
            </Button>
          </div>
        </div>
      </form>
      <nav
        className="fixed bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center gap-3"
        aria-label="Post navigation"
      >
        {hasViewerPost && previousSlug ? (
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
        {hasViewerPost && randomSlug ? (
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
        {hasViewerPost && nextSlug ? (
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
    </section>
  );
}
