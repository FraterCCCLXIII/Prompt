-- AlterTable
ALTER TABLE "Post" ADD COLUMN "previousVisibility" TEXT;

-- CreateTable
CREATE TABLE "PostReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "reporterKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PostReport_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminLoginAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "PostReport_postId_reporterKey_key" ON "PostReport"("postId", "reporterKey");

-- CreateIndex
CREATE INDEX "PostReport_reporterKey_createdAt_idx" ON "PostReport"("reporterKey", "createdAt");

-- CreateIndex
CREATE INDEX "AdminLoginAttempt_key_createdAt_idx" ON "AdminLoginAttempt"("key", "createdAt");
