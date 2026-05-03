import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const examples = [
  {
    slug: "quiet-window-seed",
    title: "A small note",
    content:
      "Some thoughts are easier to set down when no one is watching them arrive.",
  },
  {
    slug: "paper-field-seed",
    title: null,
    content:
      "The page can be a field. Leave one sentence there and walk away lighter.",
  },
  {
    slug: "silver-hour-seed",
    title: "After midnight",
    content:
      "There is a certain hour when even ordinary rooms begin to feel like questions.",
  },
];

async function main() {
  for (const post of examples) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }

  await prisma.slugCounter.upsert({
    where: { name: "post" },
    update: {},
    create: { name: "post", nextValue: 0n },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
