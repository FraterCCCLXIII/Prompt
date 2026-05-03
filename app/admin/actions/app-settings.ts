"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import {
  normalizeGoogleAnalyticsMeasurementId,
  updateAppSettings,
  validateGoogleAnalyticsMeasurementId,
} from "@/lib/app-settings";

export type AppSettingsState = {
  error?: string;
};

export async function updateAppSettingsAction(
  _previousState: AppSettingsState,
  formData: FormData,
): Promise<AppSettingsState> {
  await requireAdmin();

  const googleAnalyticsEnabled = formData.get("googleAnalyticsEnabled") === "true";
  const googleAnalyticsMeasurementId = normalizeGoogleAnalyticsMeasurementId(
    formData.get("googleAnalyticsMeasurementId"),
  );
  const measurementIdError = validateGoogleAnalyticsMeasurementId(
    googleAnalyticsMeasurementId,
  );

  if (measurementIdError) {
    return { error: measurementIdError };
  }

  if (googleAnalyticsEnabled && !googleAnalyticsMeasurementId) {
    return { error: "Enter a GA4 measurement ID before enabling analytics." };
  }

  await updateAppSettings({
    googleAnalyticsEnabled,
    googleAnalyticsMeasurementId,
  });
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");

  return {};
}
