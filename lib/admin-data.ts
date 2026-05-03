import { unstable_noStore as noStore } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type AdminPostFilters = {
  search?: string;
  ipAddress?: string;
  visibility?: string;
  reportStatus?: string;
  sort?: string;
  page?: string;
};

export const ADMIN_POSTS_PAGE_SIZE = 25;

function normalizePage(page: string | undefined) {
  const parsedPage = Number(page);

  return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}

export async function getAdminPosts(filters: AdminPostFilters = {}) {
  noStore();
  const where: Prisma.PostWhereInput = {};
  const search = filters.search?.trim();
  const ipAddress = filters.ipAddress?.trim();
  const page = normalizePage(filters.page);

  if (filters.visibility && filters.visibility !== "all") {
    where.visibility = filters.visibility;
  }

  if (filters.reportStatus === "reported") {
    where.reportCount = { gt: 0 };
  }

  if (filters.reportStatus === "unreported") {
    where.reportCount = 0;
  }

  if (ipAddress) {
    where.ipAddress = { contains: ipAddress };
  }

  if (search) {
    where.OR = [
      { id: { contains: search } },
      { slug: { contains: search } },
      { title: { contains: search } },
      { content: { contains: search } },
    ];
  }

  const orderBy: Prisma.PostOrderByWithRelationInput[] =
    filters.sort === "oldest"
      ? [{ createdAt: "asc" }, { id: "asc" }]
      : filters.sort === "reports"
        ? [{ reportCount: "desc" }, { createdAt: "desc" }]
        : filters.sort === "visibility"
          ? [{ visibility: "asc" }, { createdAt: "desc" }]
          : filters.sort === "ip"
            ? [{ ipAddress: "asc" }, { createdAt: "desc" }]
            : [{ createdAt: "desc" }, { id: "desc" }];

  const [total, posts] = await prisma.$transaction([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        createdAt: true,
        visibility: true,
        ipAddress: true,
        reportCount: true,
        reportedAt: true,
        hiddenAt: true,
      },
      orderBy,
      skip: (page - 1) * ADMIN_POSTS_PAGE_SIZE,
      take: ADMIN_POSTS_PAGE_SIZE,
    }),
  ]);

  return {
    posts,
    total,
    page,
    pageSize: ADMIN_POSTS_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / ADMIN_POSTS_PAGE_SIZE)),
  };
}

export async function getBannedIps() {
  noStore();

  return prisma.bannedIp.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminUserForSettings(adminId: string) {
  noStore();

  return prisma.adminUser.findUnique({
    where: { id: adminId },
    select: { id: true, email: true },
  });
}
