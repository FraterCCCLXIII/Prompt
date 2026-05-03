-- CreateTable
CREATE TABLE "SlugCounter" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "nextValue" BIGINT NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);
