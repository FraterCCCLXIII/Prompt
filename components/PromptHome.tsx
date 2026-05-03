"use client";

import { PostEditor } from "@/components/PostEditor";
import { type DisplayPost } from "@/components/PostDisplay";

type PromptHomeProps = {
  initialViewerPost: DisplayPost | null;
  writingPrompt: string;
  previousSlug?: string | null;
  randomSlug?: string | null;
  nextSlug?: string | null;
};

export function PromptHome({
  initialViewerPost,
  writingPrompt,
  previousSlug,
  randomSlug,
  nextSlug,
}: PromptHomeProps) {
  return (
    <PostEditor
      hasViewerPost={Boolean(initialViewerPost)}
      writingPrompt={writingPrompt}
      previousSlug={previousSlug}
      randomSlug={randomSlug}
      nextSlug={nextSlug}
    />
  );
}
