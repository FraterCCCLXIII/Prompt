import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
import { hashPassword } from "../lib/admin-auth";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  }),
});

async function promptHidden(question: string) {
  const readline = createInterface({ input, output });
  const mutableOutput = output as typeof output & { muted?: boolean };
  const originalWrite = mutableOutput.write.bind(mutableOutput);

  mutableOutput.write = ((chunk: string | Uint8Array, ...args: unknown[]) => {
    if (mutableOutput.muted && typeof chunk === "string") {
      return true;
    }

    return originalWrite(chunk, ...(args as []));
  }) as typeof output.write;

  mutableOutput.muted = true;
  const answer = await readline.question(question);
  mutableOutput.muted = false;
  output.write("\n");
  readline.close();
  mutableOutput.write = originalWrite as typeof output.write;

  return answer;
}

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    throw new Error("Usage: npm run admin:reset-password -- admin@example.com");
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email },
    select: { id: true, email: true },
  });

  if (!admin) {
    throw new Error(`No admin account found for ${email}.`);
  }

  const password = await promptHidden("New password: ");
  const confirmation = await promptHidden("Confirm password: ");

  if (password.length < 10) {
    throw new Error("Password must be at least 10 characters.");
  }

  if (password !== confirmation) {
    throw new Error("Passwords do not match.");
  }

  await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash: hashPassword(password) },
    }),
    prisma.adminSession.deleteMany({
      where: { adminId: admin.id },
    }),
  ]);

  console.log(`Password reset for ${admin.email}. Existing sessions were cleared.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
