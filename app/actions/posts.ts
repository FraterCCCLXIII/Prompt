"use server";

import { redirect } from "next/navigation";
import { getRequestIp } from "@/lib/request-ip";
import {
  createPost,
  normalizeOptionalTitle,
  normalizePostContent,
  normalizePostVisibility,
  validatePostContent,
} from "@/lib/posts";

export type CreatePostState = {
  error?: string;
};

export async function createPostAction(
  _previousState: CreatePostState,
  formData: FormData,
) {
  const content = normalizePostContent(formData.get("content"));
  const title = normalizeOptionalTitle(formData.get("title"));
  const visibility = normalizePostVisibility(formData.get("visibility"));
  const error = validatePostContent(content);

  if (error) {
    return { error };
  }

  const post = await createPost({
      title,
      content,
      visibility,
      ipAddress: await getRequestIp(),
    }).catch((createError: unknown) => ({
      error:
        createError instanceof Error
          ? createError.message
          : "Unable to create this post.",
    }));

  if ("error" in post) {
    return post;
  }

  redirect(`/p/${post.slug}`);
}
