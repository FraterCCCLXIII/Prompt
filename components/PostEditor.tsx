"use client";

import { ArrowLeft, ArrowRight, Loader2, RefreshCw, Shuffle } from "lucide-react";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { createPostAction, type CreatePostState } from "@/app/actions/posts";
import { SiteLogoMenu } from "@/components/SiteLogoMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VisibilityDropdown } from "@/components/VisibilityDropdown";
import { getWritingPrompts } from "@/lib/writing-prompts";
import { cn } from "@/lib/utils";

type PostEditorProps = {
  hasViewerPost: boolean;
  writingPrompt: string;
  previousSlug?: string | null;
  randomSlug?: string | null;
  nextSlug?: string | null;
};

const initialState: CreatePostState = {};

export function PostEditor({
  hasViewerPost,
  writingPrompt,
  previousSlug,
  randomSlug,
  nextSlug,
}: PostEditorProps) {
  const prompts = useMemo(() => getWritingPrompts(), []);
  const [currentPrompt, setCurrentPrompt] = useState(writingPrompt);
  const [dismissedError, setDismissedError] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState(
    createPostAction,
    initialState,
  );
  const promptSizeClass =
    currentPrompt.length > 82
      ? "text-3xl md:text-5xl"
      : currentPrompt.length > 58
        ? "text-4xl md:text-6xl"
        : "text-5xl md:text-7xl";

  function refreshPrompt() {
    const availablePrompts = prompts.filter((prompt) => prompt !== currentPrompt);
    const nextPrompt =
      availablePrompts[Math.floor(Math.random() * availablePrompts.length)] ??
      currentPrompt;

    setCurrentPrompt(nextPrompt);
  }

  const showErrorModal = Boolean(state.error && state.error !== dismissedError);

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-center px-5 pb-28 pt-24 sm:px-8">
      <SiteLogoMenu className="absolute left-5 top-4 sm:left-8" />
      <div className="group mb-10 text-center">
        <h1
          className={cn(
            "font-serif leading-[1.05] tracking-[-0.05em] text-foreground transition-all",
            promptSizeClass,
          )}
        >
          <button
            type="button"
            onClick={refreshPrompt}
            className="inline cursor-pointer text-center font-inherit text-inherit tracking-inherit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
            aria-label="Show another writing prompt"
          >
            {currentPrompt}
            <RefreshCw
              className="ml-3 inline size-4 translate-y-[-0.12em] opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            />
          </button>
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
      {state.error && showErrorModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 px-5 backdrop-blur-sm">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="posting-limit-title"
            className="w-full max-w-md rounded-[2rem] border border-border bg-background p-6 text-center shadow-xl"
          >
            <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">
              Posting paused
            </p>
            <h2
              id="posting-limit-title"
              className="mt-4 font-serif text-4xl tracking-[-0.05em]"
            >
              Give it a little room.
            </h2>
            <p className="mt-4 text-muted-foreground">{state.error}</p>
            <Button
              type="button"
              className="mt-6"
              onClick={() => setDismissedError(state.error ?? null)}
            >
              OK
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
