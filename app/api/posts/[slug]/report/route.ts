import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSpamSettings } from "@/lib/spam-settings";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const settings = await getSpamSettings();
  const post = await prisma.post.findUnique({
    where: { slug },
    select: { reportCount: true },
  });

  if (!post) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const nextReportCount = post.reportCount + 1;

  await prisma.post.update({
    where: { slug },
    data: {
      reportCount: { increment: 1 },
      reportedAt: new Date(),
      ...(settings.autoHideReportThreshold > 0 &&
      nextReportCount >= settings.autoHideReportThreshold
        ? { visibility: "hidden", hiddenAt: new Date() }
        : {}),
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true });
}
