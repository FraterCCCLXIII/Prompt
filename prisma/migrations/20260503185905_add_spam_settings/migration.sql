-- CreateTable
CREATE TABLE "SpamSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "maxPostsPerDay" INTEGER NOT NULL DEFAULT 10,
    "cooldownSeconds" INTEGER NOT NULL DEFAULT 60,
    "duplicateWindowHours" INTEGER NOT NULL DEFAULT 24,
    "autoHideReportThreshold" INTEGER NOT NULL DEFAULT 3,
    "updatedAt" DATETIME NOT NULL
);
