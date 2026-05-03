import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";

const APP_SETTINGS_ID = "default";
const GOOGLE_ANALYTICS_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]+$/;

export type AppSettingsInput = {
  googleAnalyticsEnabled: boolean;
  googleAnalyticsMeasurementId: string | null;
};

export const defaultAppSettings: AppSettingsInput = {
  googleAnalyticsEnabled: false,
  googleAnalyticsMeasurementId: null,
};

export async function getAppSettings() {
  noStore();

  return prisma.appSettings.upsert({
    where: { id: APP_SETTINGS_ID },
    update: {},
    create: {
      id: APP_SETTINGS_ID,
      ...defaultAppSettings,
    },
  });
}

export async function updateAppSettings(input: AppSettingsInput) {
  return prisma.appSettings.upsert({
    where: { id: APP_SETTINGS_ID },
    update: input,
    create: {
      id: APP_SETTINGS_ID,
      ...input,
    },
  });
}

export function normalizeGoogleAnalyticsMeasurementId(
  value: FormDataEntryValue | null,
) {
  const measurementId = String(value ?? "").trim().toUpperCase();

  return measurementId.length > 0 ? measurementId : null;
}

export function validateGoogleAnalyticsMeasurementId(measurementId: string | null) {
  if (!measurementId) {
    return null;
  }

  return GOOGLE_ANALYTICS_MEASUREMENT_ID_PATTERN.test(measurementId)
    ? null
    : "Enter a valid GA4 measurement ID, like G-XXXXXXXXXX.";
}
