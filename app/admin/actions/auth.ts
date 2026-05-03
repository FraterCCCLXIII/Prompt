"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearAdminSession,
  createAdminSession,
  hashPassword,
  hasAdminUser,
  requireAdmin,
  verifyPassword,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export type AdminActionState = {
  error?: string;
};

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizePassword(value: FormDataEntryValue | null) {
  return String(value ?? "");
}

function validateCredentials(email: string, password: string) {
  if (!email.includes("@")) {
    return "Enter a valid email address.";
  }

  if (password.length < 10) {
    return "Use a password with at least 10 characters.";
  }

  return null;
}

export async function setupAdminAction(
  _previousState: AdminActionState,
  formData: FormData,
) {
  if (await hasAdminUser()) {
    return { error: "Admin setup is already complete." };
  }

  const email = normalizeEmail(formData.get("email"));
  const password = normalizePassword(formData.get("password"));
  const error = validateCredentials(email, password);

  if (error) {
    return { error };
  }

  const admin = await prisma.adminUser.create({
    data: {
      email,
      passwordHash: hashPassword(password),
    },
    select: { id: true },
  });

  await createAdminSession(admin.id);
  redirect("/admin");
}

export async function loginAdminAction(
  _previousState: AdminActionState,
  formData: FormData,
) {
  const email = normalizeEmail(formData.get("email"));
  const password = normalizePassword(formData.get("password"));
  const admin = await prisma.adminUser.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    return { error: "Email or password is incorrect." };
  }

  await createAdminSession(admin.id);
  redirect("/admin");
}

export async function logoutAdminAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function updateAdminCredentialsAction(
  _previousState: AdminActionState,
  formData: FormData,
) {
  const adminSession = await requireAdmin();
  const currentPassword = normalizePassword(formData.get("currentPassword"));
  const email = normalizeEmail(formData.get("email"));
  const newPassword = normalizePassword(formData.get("newPassword"));
  const admin = await prisma.adminUser.findUnique({
    where: { id: adminSession.id },
    select: { passwordHash: true },
  });

  if (!admin || !verifyPassword(currentPassword, admin.passwordHash)) {
    return { error: "Current password is incorrect." };
  }

  const updateData: { email?: string; passwordHash?: string } = {};

  if (email && email !== adminSession.email) {
    if (!email.includes("@")) {
      return { error: "Enter a valid email address." };
    }

    updateData.email = email;
  }

  if (newPassword) {
    if (newPassword.length < 10) {
      return { error: "Use a new password with at least 10 characters." };
    }

    updateData.passwordHash = hashPassword(newPassword);
  }

  if (Object.keys(updateData).length === 0) {
    return { error: "Change the email or enter a new password." };
  }

  await prisma.adminUser.update({
    where: { id: adminSession.id },
    data: updateData,
  });

  revalidatePath("/admin/settings");
  return {};
}
