import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDatabaseFilePath } from "@/lib/database-file";

export async function GET() {
  await requireAdmin();

  const databasePath = getDatabaseFilePath();
  const database = await readFile(databasePath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `prompt-${timestamp}-${basename(databasePath)}`;

  return new NextResponse(database, {
    headers: {
      "Content-Type": "application/vnd.sqlite3",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
