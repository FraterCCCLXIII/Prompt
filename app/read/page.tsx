import { redirect } from "next/navigation";
import { getMostRecentPublicPost } from "@/lib/posts";

export default async function ReadPage() {
  const post = await getMostRecentPublicPost();

  if (!post) {
    redirect("/");
  }

  redirect(`/p/${post.slug}`);
}
