"use client";

import { PostEditor } from "@/components/PostEditor";
import { type DisplayPost } from "@/components/PostDisplay";

type PromptHomeProps = {
  initialViewerPost: DisplayPost | null;
  writingPrompt: string;
  turnstileSiteKey?: string;
  previousSlug?: string | null;
  randomSlug?: string | null;
  nextSlug?: string | null;
};

export function PromptHome({
  initialViewerPost,
  writingPrompt,
  turnstileSiteKey,
  previousSlug,
  randomSlug,
  nextSlug,
}: PromptHomeProps) {
  return (
    <PostEditor
      hasViewerPost={Boolean(initialViewerPost)}
      writingPrompt={writingPrompt}
      turnstileSiteKey={turnstileSiteKey}
      scrollDownHref="/read"
      previousSlug={previousSlug}
      randomSlug={randomSlug}
      nextSlug={nextSlug}
    />
  );
}
