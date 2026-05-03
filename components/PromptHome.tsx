"use client";

import { PostEditor } from "@/components/PostEditor";
import { type DisplayPost } from "@/components/PostDisplay";

type PromptHomeProps = {
  initialViewerPost: DisplayPost | null;
  previousSlug?: string | null;
  randomSlug?: string | null;
  nextSlug?: string | null;
};

export function PromptHome({
  initialViewerPost,
  previousSlug,
  randomSlug,
  nextSlug,
}: PromptHomeProps) {
  return (
    <PostEditor
      hasViewerPost={Boolean(initialViewerPost)}
      previousSlug={previousSlug}
      randomSlug={randomSlug}
      nextSlug={nextSlug}
    />
  );
}
