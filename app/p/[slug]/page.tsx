import { notFound } from "next/navigation";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { FloatingPostActions } from "@/components/FloatingPostActions";
import { PostDisplay } from "@/components/PostDisplay";
import { SiteLogoMenu } from "@/components/SiteLogoMenu";
import {
  getAdjacentPost,
  getPostBySlug,
  getRandomPost,
  incrementPostView,
} from "@/lib/posts";

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  await incrementPostView(slug);
  const [previousPost, randomPost, nextPost] = await Promise.all([
    getAdjacentPost(slug, "previous"),
    getRandomPost(slug),
    getAdjacentPost(slug, "next"),
  ]);

  return (
    <main className="flex min-h-dvh flex-col pb-28">
      <div className="flex items-center justify-between px-5 py-4 sm:px-8">
        <SiteLogoMenu />
        <CopyLinkButton slug={post.slug} label="Share" />
      </div>

      <PostDisplay post={post} className="flex-1" />

      <FloatingPostActions
        previousSlug={previousPost?.slug}
        randomSlug={randomPost?.slug}
        nextSlug={nextPost?.slug}
      />
    </main>
  );
}
