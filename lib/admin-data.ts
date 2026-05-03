import { unstable_noStore as noStore } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type AdminPostFilters = {
  search?: string;
  ipAddress?: string;
  visibility?: string;
  reportStatus?: string;
  sort?: string;
};

export async function getAdminPosts(filters: AdminPostFilters = {}) {
  noStore();
  const where: Prisma.PostWhereInput = {};
  const search = filters.search?.trim();
  const ipAddress = filters.ipAddress?.trim();

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

  return prisma.post.findMany({
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
  });
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
