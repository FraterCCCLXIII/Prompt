import { prisma } from "../lib/prisma";
import {
  createPost,
  incrementPostShare,
  normalizePostVisibility,
} from "../lib/posts";
import { getSpamSettings, updateSpamSettings } from "../lib/spam-settings";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const originalSettings = await getSpamSettings();
  const smokePrefix = `review-smoke-${Date.now()}`;
  const ipAddress = "198.51.100.42";

  await updateSpamSettings({
    maxPostsPerDay: 100,
    cooldownSeconds: 0,
    duplicateWindowHours: 24,
    autoHideReportThreshold: originalSettings.autoHideReportThreshold,
  });

  try {
    assert(
      normalizePostVisibility("hidden") === "public",
      "Public post creation must not accept hidden visibility.",
    );

    const post = await createPost({
      content: smokePrefix,
      visibility: "link-only",
      ipAddress,
    });

    const share = await incrementPostShare(post.slug);
    assert(share?.shareCount === 1, "Existing post share count should increment.");

    const missingShare = await incrementPostShare("missing-review-smoke-slug");
    assert(missingShare === null, "Missing post share should return null.");

    await createPost({
      content: `${smokePrefix}-duplicate`,
      visibility: "public",
      ipAddress,
    });

    await createPost({
      content: `${smokePrefix}-duplicate`,
      visibility: "public",
      ipAddress,
    })
      .then(() => {
        throw new Error("Duplicate content should have been blocked.");
      })
      .catch((error: unknown) => {
        assert(
          error instanceof Error && error.message.includes("same text"),
          "Duplicate content should return the expected spam error.",
        );
      });

    await prisma.post.deleteMany({
      where: { content: { startsWith: smokePrefix } },
    });

    console.log("Review smoke checks passed.");
  } finally {
    await updateSpamSettings({
      maxPostsPerDay: originalSettings.maxPostsPerDay,
      cooldownSeconds: originalSettings.cooldownSeconds,
      duplicateWindowHours: originalSettings.duplicateWindowHours,
      autoHideReportThreshold: originalSettings.autoHideReportThreshold,
    });
    await prisma.post.deleteMany({
      where: { content: { startsWith: smokePrefix } },
    });
    await prisma.$disconnect();
  }
}

void main();
