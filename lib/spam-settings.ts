import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";

const SPAM_SETTINGS_ID = "default";

export type SpamSettingsInput = {
  maxPostsPerDay: number;
  cooldownSeconds: number;
  duplicateWindowHours: number;
  autoHideReportThreshold: number;
};

export const defaultSpamSettings: SpamSettingsInput = {
  maxPostsPerDay: 10,
  cooldownSeconds: 60,
  duplicateWindowHours: 24,
  autoHideReportThreshold: 3,
};

export async function getSpamSettings() {
  noStore();

  return prisma.spamSettings.upsert({
    where: { id: SPAM_SETTINGS_ID },
    update: {},
    create: {
      id: SPAM_SETTINGS_ID,
      ...defaultSpamSettings,
    },
  });
}

export async function updateSpamSettings(input: SpamSettingsInput) {
  return prisma.spamSettings.upsert({
    where: { id: SPAM_SETTINGS_ID },
    update: input,
    create: {
      id: SPAM_SETTINGS_ID,
      ...input,
    },
  });
}

export function clampSpamSetting(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number.parseInt(String(value ?? ""), 10);

  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.max(0, parsed);
}
