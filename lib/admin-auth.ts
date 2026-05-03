import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "prompt_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;
const HASH_KEY_LENGTH = 64;

export type AdminSessionUser = {
  id: string;
  email: string;
};

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, HASH_KEY_LENGTH).toString("hex");

  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");

  if (!salt || !hash) {
    return false;
  }

  const candidate = scryptSync(password, salt, HASH_KEY_LENGTH);
  const stored = Buffer.from(hash, "hex");

  return stored.length === candidate.length && timingSafeEqual(stored, candidate);
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function hasAdminUser() {
  return (await prisma.adminUser.count()) > 0;
}

export async function createAdminSession(adminId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await prisma.adminSession.create({
    data: {
      tokenHash: hashSessionToken(token),
      adminId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.adminSession.deleteMany({
      where: { tokenHash: hashSessionToken(token) },
    });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getAdminSessionUser(): Promise<AdminSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    select: {
      expiresAt: true,
      admin: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    await clearAdminSession();
    return null;
  }

  return session.admin;
}

export async function requireAdmin() {
  const setupRequired = !(await hasAdminUser());

  if (setupRequired) {
    redirect("/admin/setup");
  }

  const admin = await getAdminSessionUser();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}
