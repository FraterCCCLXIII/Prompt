-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "googleAnalyticsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "googleAnalyticsMeasurementId" TEXT,
    "updatedAt" DATETIME NOT NULL
);
