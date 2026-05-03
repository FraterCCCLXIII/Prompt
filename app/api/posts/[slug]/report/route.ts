import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIpFromHeaders } from "@/lib/request-ip";
import { getSpamSettings } from "@/lib/spam-settings";

const REPORTER_COOKIE_NAME = "prompt_reporter";
const REPORT_RATE_LIMIT = 10;
const REPORT_RATE_WINDOW_MS = 60 * 60 * 1000;

function hashReporterKey(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function getReporter(request: NextRequest) {
  const ipAddress = getClientIpFromHeaders(request.headers);

  if (ipAddress) {
    return {
      reporterKey: `ip:${hashReporterKey(ipAddress)}`,
      reporterToken: null,
    };
  }

  const cookieToken =
    request.cookies.get(REPORTER_COOKIE_NAME)?.value || randomBytes(32).toString("hex");

  return {
    reporterKey: `client:${hashReporterKey(cookieToken)}`,
    reporterToken: cookieToken,
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const settings = await getSpamSettings();
  const { reporterKey, reporterToken } = getReporter(request);
  const rateWindowStart = new Date(Date.now() - REPORT_RATE_WINDOW_MS);
  const post = await prisma.post.findUnique({
    where: { slug },
    select: { id: true, visibility: true, previousVisibility: true },
  });

  if (!post) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const existingReport = await tx.postReport.findUnique({
      where: {
        postId_reporterKey: {
          postId: post.id,
          reporterKey,
        },
      },
      select: { id: true },
    });

    if (existingReport) {
      return { status: "duplicate" as const };
    }

    const recentReports = await tx.postReport.count({
      where: {
        reporterKey,
        createdAt: { gte: rateWindowStart },
      },
    });

    if (recentReports >= REPORT_RATE_LIMIT) {
      return { status: "rate-limited" as const };
    }

    await tx.postReport.create({
      data: {
        postId: post.id,
        reporterKey,
      },
      select: { id: true },
    });

    await tx.post.update({
      where: { id: post.id },
      data: {
        reportCount: { increment: 1 },
        reportedAt: new Date(),
      },
      select: { id: true },
    });

    if (settings.autoHideReportThreshold > 0) {
      const countedReports = await tx.postReport.count({
        where: { postId: post.id },
      });

      if (countedReports >= settings.autoHideReportThreshold) {
        await tx.post.update({
          where: { id: post.id },
          data: {
            visibility: "hidden",
            previousVisibility:
              post.visibility === "hidden"
                ? post.previousVisibility
                : post.visibility === "link-only"
                  ? "link-only"
                  : "public",
            hiddenAt: new Date(),
          },
          select: { id: true },
        });
      }
    }

    return { status: "reported" as const };
  });

  const response =
    result.status === "rate-limited"
      ? NextResponse.json(
          { ok: false, message: "Too many reports. Please try again later." },
          { status: 429 },
        )
      : NextResponse.json({
          ok: true,
          counted: result.status === "reported",
          message:
            result.status === "duplicate"
              ? "You have already reported this post."
              : "Report received.",
        });

  if (reporterToken) {
    response.cookies.set(REPORTER_COOKIE_NAME, reporterToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}
