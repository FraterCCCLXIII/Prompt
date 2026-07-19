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
import { verifyTurnstileToken } from "@/lib/turnstile";

export type CreatePostState = {
  error?: string;
};

export async function createPostAction(
  _previousState: CreatePostState,
  formData: FormData,
) {
  const ipAddress = await getRequestIp();
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
  const content = normalizePostContent(formData.get("content"));
  const title = normalizeOptionalTitle(formData.get("title"));
  const visibility = normalizePostVisibility(formData.get("visibility"));
  const error = validatePostContent(content);

  if (error) {
    return { error };
  }

  if (turnstileSiteKey) {
    const turnstileToken = String(formData.get("cf-turnstile-response") ?? "").trim();

    if (!turnstileToken) {
      return { error: "Please complete the captcha challenge." };
    }

    const turnstileResult = await verifyTurnstileToken({
      token: turnstileToken,
      ipAddress,
    });

    if (!turnstileResult.ok) {
      return { error: turnstileResult.error };
    }
  }

  const post = await createPost({
      title,
      content,
      visibility,
      ipAddress,
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
