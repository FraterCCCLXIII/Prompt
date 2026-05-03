"use server";

import { writeFile } from "node:fs/promises";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getDatabaseFilePath, isSQLiteDatabase } from "@/lib/database-file";
import { prisma } from "@/lib/prisma";

export type DatabaseRestoreState = {
  error?: string;
};

export async function restoreDatabaseAction(
  _previousState: DatabaseRestoreState,
  formData: FormData,
): Promise<DatabaseRestoreState> {
  await requireAdmin();

  const upload = formData.get("database");

  if (!(upload instanceof File) || upload.size === 0) {
    return { error: "Choose a SQLite database file to upload." };
  }

  const buffer = Buffer.from(await upload.arrayBuffer());

  if (!isSQLiteDatabase(buffer)) {
    return { error: "The uploaded file does not look like a SQLite database." };
  }

  await prisma.$disconnect();
  await writeFile(getDatabaseFilePath(), buffer);

  redirect("/admin/login");
}
