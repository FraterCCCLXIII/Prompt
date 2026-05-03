import { NextRequest, NextResponse } from "next/server";
import { incrementPostShare } from "@/lib/posts";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const share = await incrementPostShare(slug);

  if (!share) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
