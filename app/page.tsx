import { PromptHome } from "@/components/PromptHome";
import { getAdjacentPost, getRandomPost, type PublicPost } from "@/lib/posts";
import { getRandomWritingPrompt } from "@/lib/writing-prompts";

function serializePost(post: PublicPost | null) {
  if (!post) {
    return null;
  }

  return {
    ...post,
    createdAt: post.createdAt.toISOString(),
  };
}

export default async function Home() {
  const initialViewerPost = await getRandomPost();
  const [previousPost, randomPost, nextPost] = initialViewerPost
    ? await Promise.all([
        getAdjacentPost(initialViewerPost.slug, "previous"),
        getRandomPost(initialViewerPost.slug),
        getAdjacentPost(initialViewerPost.slug, "next"),
      ])
    : [null, null, null];

  return (
    <PromptHome
      initialViewerPost={serializePost(initialViewerPost)}
      writingPrompt={getRandomWritingPrompt()}
      previousSlug={previousPost?.slug}
      randomSlug={randomPost?.slug}
      nextSlug={nextPost?.slug}
    />
  );
}
