"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import {
  clampSpamSetting,
  defaultSpamSettings,
  updateSpamSettings,
} from "@/lib/spam-settings";

export type SpamSettingsState = {
  error?: string;
};

export async function updateSpamSettingsAction(
  _previousState: SpamSettingsState,
  formData: FormData,
): Promise<SpamSettingsState> {
  await requireAdmin();

  const settings = {
    maxPostsPerDay: clampSpamSetting(
      formData.get("maxPostsPerDay"),
      defaultSpamSettings.maxPostsPerDay,
    ),
    cooldownSeconds: clampSpamSetting(
      formData.get("cooldownSeconds"),
      defaultSpamSettings.cooldownSeconds,
    ),
    duplicateWindowHours: clampSpamSetting(
      formData.get("duplicateWindowHours"),
      defaultSpamSettings.duplicateWindowHours,
    ),
    autoHideReportThreshold: clampSpamSetting(
      formData.get("autoHideReportThreshold"),
      defaultSpamSettings.autoHideReportThreshold,
    ),
  };

  await updateSpamSettings(settings);
  revalidatePath("/admin/settings");

  return {};
}
