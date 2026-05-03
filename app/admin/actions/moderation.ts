"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function hidePostAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await prisma.post.update({
    where: { id },
    data: {
      visibility: "hidden",
      hiddenAt: new Date(),
    },
  });

  revalidatePath("/admin");
}

export async function unhidePostAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const visibility = String(formData.get("visibility") ?? "public");

  if (!id) {
    return;
  }

  await prisma.post.update({
    where: { id },
    data: {
      visibility: visibility === "link-only" ? "link-only" : "public",
      hiddenAt: null,
    },
  });

  revalidatePath("/admin");
}

export async function deletePostAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await prisma.post.delete({ where: { id } });
  revalidatePath("/admin");
}

export async function clearReportAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await prisma.post.update({
    where: { id },
    data: {
      reportCount: 0,
      reportedAt: null,
    },
  });

  revalidatePath("/admin");
}

export async function banIpAction(formData: FormData) {
  await requireAdmin();
  const ipAddress = String(formData.get("ipAddress") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!ipAddress) {
    return;
  }

  await prisma.bannedIp.upsert({
    where: { ipAddress },
    update: { reason: reason || null },
    create: { ipAddress, reason: reason || null },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/ip-bans");
}

export async function removeBanAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await prisma.bannedIp.delete({ where: { id } });
  revalidatePath("/admin/ip-bans");
}
