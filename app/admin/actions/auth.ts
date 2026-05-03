"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearAdminSession,
  createAdminSession,
  hashPassword,
  requireAdmin,
  verifyPassword,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { getRequestIp } from "@/lib/request-ip";

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

const LOGIN_ATTEMPT_LIMIT = 8;
const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

function getSetupSecret() {
  return process.env.PROMPT_ADMIN_SETUP_SECRET?.trim() ?? "";
}

function validateSetupSecret(formData: FormData) {
  const expectedSecret = getSetupSecret();

  if (!expectedSecret && process.env.NODE_ENV === "production") {
    return "Set PROMPT_ADMIN_SETUP_SECRET before creating the first admin.";
  }

  if (!expectedSecret) {
    return null;
  }

  const providedSecret = String(formData.get("setupSecret") ?? "").trim();

  return providedSecret === expectedSecret ? null : "Setup secret is incorrect.";
}

async function getLoginAttemptKey(email: string) {
  const ipAddress = await getRequestIp();

  return `${email}:${ipAddress ?? "unknown"}`;
}

async function isLoginRateLimited(key: string) {
  const windowStart = new Date(Date.now() - LOGIN_ATTEMPT_WINDOW_MS);
  const attempts = await prisma.adminLoginAttempt.count({
    where: {
      key,
      createdAt: { gte: windowStart },
    },
  });

  return attempts >= LOGIN_ATTEMPT_LIMIT;
}

async function recordFailedLogin(key: string) {
  await prisma.adminLoginAttempt.create({
    data: { key },
    select: { id: true },
  });
}

async function clearLoginAttempts(key: string) {
  await prisma.adminLoginAttempt.deleteMany({ where: { key } });
}

export async function setupAdminAction(
  _previousState: AdminActionState,
  formData: FormData,
) {
  const email = normalizeEmail(formData.get("email"));
  const password = normalizePassword(formData.get("password"));
  const error = validateSetupSecret(formData) ?? validateCredentials(email, password);

  if (error) {
    return { error };
  }

  const admin = await prisma.$transaction(async (tx) => {
    const existingAdmins = await tx.adminUser.count();

    if (existingAdmins > 0) {
      return null;
    }

    return tx.adminUser.create({
      data: {
        email,
        passwordHash: hashPassword(password),
      },
      select: { id: true },
    });
  });

  if (!admin) {
    return { error: "Admin setup is already complete." };
  }

  await createAdminSession(admin.id);
  redirect("/admin");
}

export async function loginAdminAction(
  _previousState: AdminActionState,
  formData: FormData,
) {
  const email = normalizeEmail(formData.get("email"));
  const password = normalizePassword(formData.get("password"));
  const loginAttemptKey = await getLoginAttemptKey(email);

  if (await isLoginRateLimited(loginAttemptKey)) {
    return { error: "Too many sign-in attempts. Please try again later." };
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    await recordFailedLogin(loginAttemptKey);
    return { error: "Email or password is incorrect." };
  }

  await clearLoginAttempts(loginAttemptKey);
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

  await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: adminSession.id },
      data: updateData,
    }),
    prisma.adminSession.deleteMany({
      where: { adminId: adminSession.id },
    }),
  ]);

  revalidatePath("/admin/settings");
  await clearAdminSession();
  redirect("/admin/login");
}
