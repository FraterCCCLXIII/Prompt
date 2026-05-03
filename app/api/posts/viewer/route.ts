import { NextRequest, NextResponse } from "next/server";
import { getAdjacentPost, getPostBySlug, getRandomPost } from "@/lib/posts";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get("slug");
  const direction = searchParams.get("direction");

  if (direction === "random") {
    const post = await getRandomPost(slug);
    return NextResponse.json({ post });
  }

  if ((direction === "previous" || direction === "next") && slug) {
    const post = await getAdjacentPost(slug, direction);
    return NextResponse.json({ post });
  }

  if (slug) {
    const post = await getPostBySlug(slug);
    return NextResponse.json({ post });
  }

  const post = await getRandomPost();
  return NextResponse.json({ post });
}
