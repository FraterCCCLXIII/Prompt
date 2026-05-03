import { NextRequest, NextResponse } from "next/server";
import { incrementPostShare } from "@/lib/posts";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  await incrementPostShare(slug);

  return NextResponse.json({ ok: true });
}
