import { unstable_noStore as noStore } from "next/cache";
import { MAX_POST_LENGTH } from "@/lib/post-constants";
import { prisma } from "@/lib/prisma";
import { encodeSlugSequence } from "@/lib/slugs";
import { getSpamSettings } from "@/lib/spam-settings";

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
const PUBLIC_POST_VISIBILITIES = ["public", "link-only"] as const;

export type PublicPostVisibility = (typeof PUBLIC_POST_VISIBILITIES)[number];
export type PostVisibility = PublicPostVisibility | "hidden";

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
): PublicPostVisibility {
  const normalized = String(visibility ?? "public").trim();

  return PUBLIC_POST_VISIBILITIES.includes(normalized as PublicPostVisibility)
    ? (normalized as PublicPostVisibility)
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
  visibility?: PublicPostVisibility;
  ipAddress?: string | null;
}) {
  const content = normalizePostContent(input.content);
  const error = validatePostContent(content);

  if (error) {
    throw new Error(error);
  }

  if (input.ipAddress) {
    const bannedIp = await prisma.bannedIp.findUnique({
      where: { ipAddress: input.ipAddress },
      select: { id: true },
    });

    if (bannedIp) {
      throw new Error("Posting from this network is currently unavailable.");
    }
  }

  const settings = await getSpamSettings();
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const spamIdentityWhere = input.ipAddress
    ? { ipAddress: input.ipAddress }
    : { ipAddress: null };

  if (settings.maxPostsPerDay > 0) {
    const postsToday = await prisma.post.count({
      where: {
        ...spamIdentityWhere,
        createdAt: { gte: startOfDay },
      },
    });

    if (postsToday >= settings.maxPostsPerDay) {
      throw new Error(
        `This network has reached today's limit of ${settings.maxPostsPerDay} posts.`,
      );
    }
  }

  if (settings.cooldownSeconds > 0) {
    const latestPost = await prisma.post.findFirst({
      where: spamIdentityWhere,
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    const elapsedSeconds = latestPost
      ? Math.floor((now.getTime() - latestPost.createdAt.getTime()) / 1000)
      : settings.cooldownSeconds;

    if (elapsedSeconds < settings.cooldownSeconds) {
      throw new Error(
        `Please wait ${settings.cooldownSeconds - elapsedSeconds} more seconds before posting again.`,
      );
    }
  }

  if (settings.duplicateWindowHours > 0) {
    const duplicateWindowStart = new Date(
      now.getTime() - settings.duplicateWindowHours * 60 * 60 * 1000,
    );
    const duplicatePost = await prisma.post.findFirst({
      where: {
        ...spamIdentityWhere,
        content,
        createdAt: { gte: duplicateWindowStart },
      },
      select: { id: true },
    });

    if (duplicatePost) {
      throw new Error(
        `This network has already posted the same text in the last ${settings.duplicateWindowHours} hours.`,
      );
    }
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
        ipAddress: input.ipAddress ?? null,
      },
      select: postSelect,
    });
  });
}

export async function getPostBySlug(slug: string) {
  noStore();

  return prisma.post.findFirst({
    where: { slug, NOT: { visibility: "hidden" } },
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
  const post = await prisma.post.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!post) {
    return null;
  }

  return prisma.post.update({
    where: { id: post.id },
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
