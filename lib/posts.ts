import { unstable_noStore as noStore } from "next/cache";
import { MAX_POST_LENGTH } from "@/lib/post-constants";
import { prisma } from "@/lib/prisma";
import { encodeSlugSequence } from "@/lib/slugs";

export { MAX_POST_LENGTH };

export type PublicPost = {
  id: string;
  slug: string;
  title: string | null;
  content: string;
  createdAt: Date;
};

const postSelect = {
  id: true,
  slug: true,
  title: true,
  content: true,
  createdAt: true,
} satisfies Record<keyof PublicPost, true>;

const SLUG_COUNTER_NAME = "post";
const POST_VISIBILITIES = ["public", "link-only"] as const;

export type PostVisibility = (typeof POST_VISIBILITIES)[number];

export function normalizePostContent(content: FormDataEntryValue | string | null) {
  return String(content ?? "")
    .replace(/\0/g, "")
    .trim();
}

export function normalizeOptionalTitle(title: FormDataEntryValue | string | null) {
  const normalized = String(title ?? "")
    .replace(/\0/g, "")
    .trim();

  return normalized.length > 0 ? normalized.slice(0, 120) : null;
}

export function normalizePostVisibility(
  visibility: FormDataEntryValue | string | null,
): PostVisibility {
  const normalized = String(visibility ?? "public").trim();

  return POST_VISIBILITIES.includes(normalized as PostVisibility)
    ? (normalized as PostVisibility)
    : "public";
}

export function validatePostContent(content: string) {
  if (!content) {
    return "Write something before posting.";
  }

  // if (content.length > MAX_POST_LENGTH) {
  //   return `Posts must be ${MAX_POST_LENGTH.toLocaleString()} characters or fewer.`;
  // }

  return null;
}

export async function createPost(input: {
  title?: string | null;
  content: string;
  visibility?: PostVisibility;
}) {
  const content = normalizePostContent(input.content);
  const error = validatePostContent(content);

  if (error) {
    throw new Error(error);
  }

  return prisma.$transaction(async (tx) => {
    const counter = await tx.slugCounter.upsert({
      where: { name: SLUG_COUNTER_NAME },
      update: { nextValue: { increment: 1n } },
      create: { name: SLUG_COUNTER_NAME, nextValue: 1n },
      select: { nextValue: true },
    });
    const slug = encodeSlugSequence(counter.nextValue - 1n);

    return tx.post.create({
      data: {
        slug,
        title: normalizeOptionalTitle(input.title ?? null),
        content,
        visibility: input.visibility ?? "public",
      },
      select: postSelect,
    });
  });
}

export async function getPostBySlug(slug: string) {
  noStore();

  return prisma.post.findUnique({
    where: { slug },
    select: postSelect,
  });
}

export async function incrementPostView(slug: string) {
  await prisma.post.update({
    where: { slug },
    data: { viewsCount: { increment: 1 } },
    select: { id: true },
  });
}

export async function incrementPostShare(slug: string) {
  return prisma.post.update({
    where: { slug },
    data: { shareCount: { increment: 1 } },
    select: { shareCount: true },
  });
}

export async function getRandomPost(excludeSlug?: string | null) {
  noStore();

  const posts = await prisma.post.findMany({
    where: {
      visibility: "public",
      ...(excludeSlug ? { NOT: { slug: excludeSlug } } : {}),
    },
    select: postSelect,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  if (posts.length === 0) {
    return null;
  }

  return posts[Math.floor(Math.random() * posts.length)];
}

export async function getMostRecentPublicPost() {
  noStore();

  return prisma.post.findFirst({
    where: { visibility: "public" },
    select: postSelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

export async function getAdjacentPost(slug: string, direction: "previous" | "next") {
  noStore();

  const current = await prisma.post.findUnique({
    where: { slug },
    select: { createdAt: true, id: true },
  });

  if (!current) {
    return null;
  }

  const isPrevious = direction === "previous";

  const adjacent = await prisma.post.findFirst({
    where: {
      OR: isPrevious
        ? [
            { visibility: "public", createdAt: { lt: current.createdAt } },
            {
              visibility: "public",
              createdAt: current.createdAt,
              id: { lt: current.id },
            },
          ]
        : [
            { visibility: "public", createdAt: { gt: current.createdAt } },
            {
              visibility: "public",
              createdAt: current.createdAt,
              id: { gt: current.id },
            },
          ],
    },
    select: postSelect,
    orderBy: [
      { createdAt: isPrevious ? "desc" : "asc" },
      { id: isPrevious ? "desc" : "asc" },
    ],
  });

  if (adjacent) {
    return adjacent;
  }

  return prisma.post.findFirst({
    where: { visibility: "public" },
    select: postSelect,
    orderBy: [
      { createdAt: isPrevious ? "asc" : "desc" },
      { id: isPrevious ? "asc" : "desc" },
    ],
  });
}
