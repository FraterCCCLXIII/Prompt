import { resolve } from "node:path";

const SQLITE_HEADER = "SQLite format 3\u0000";

export function getDatabaseFilePath() {
  const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";

  if (!databaseUrl.startsWith("file:")) {
    throw new Error("Database backup is only available for SQLite file databases.");
  }

  const filePath = databaseUrl.slice("file:".length);

  if (!filePath || filePath.includes("?")) {
    throw new Error("Database backup requires a direct SQLite file path.");
  }

  return resolve(/* turbopackIgnore: true */ process.cwd(), filePath);
}

export function isSQLiteDatabase(buffer: Buffer) {
  return buffer.subarray(0, SQLITE_HEADER.length).toString("binary") === SQLITE_HEADER;
}
