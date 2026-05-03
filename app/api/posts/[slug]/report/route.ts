import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  await prisma.post.update({
    where: { slug },
    data: {
      reportCount: { increment: 1 },
      reportedAt: new Date(),
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true });
}
