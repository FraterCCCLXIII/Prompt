"use client";

import { useActionState } from "react";
import {
  type SpamSettingsState,
  updateSpamSettingsAction,
} from "@/app/admin/actions/spam-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SpamSettingsFormProps = {
  settings: {
    maxPostsPerDay: number;
    cooldownSeconds: number;
    duplicateWindowHours: number;
    autoHideReportThreshold: number;
  };
};

const initialState: SpamSettingsState = {};

export function SpamSettingsForm({ settings }: SpamSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateSpamSettingsAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="text-sm font-medium" htmlFor="maxPostsPerDay">
          Max posts per IP per day
        </label>
        <Input
          id="maxPostsPerDay"
          name="maxPostsPerDay"
          type="number"
          min={0}
          defaultValue={settings.maxPostsPerDay}
          className="mt-2"
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Use 0 to disable the daily cap.
        </p>
      </div>

      <div>
        <label className="text-sm font-medium" htmlFor="cooldownSeconds">
          Cooldown between posts, in seconds
        </label>
        <Input
          id="cooldownSeconds"
          name="cooldownSeconds"
          type="number"
          min={0}
          defaultValue={settings.cooldownSeconds}
          className="mt-2"
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Slows rapid repeat submissions from the same IP.
        </p>
      </div>

      <div>
        <label className="text-sm font-medium" htmlFor="duplicateWindowHours">
          Duplicate text window, in hours
        </label>
        <Input
          id="duplicateWindowHours"
          name="duplicateWindowHours"
          type="number"
          min={0}
          defaultValue={settings.duplicateWindowHours}
          className="mt-2"
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Blocks the same IP from reposting identical text in this window.
        </p>
      </div>

      <div>
        <label className="text-sm font-medium" htmlFor="autoHideReportThreshold">
          Auto-hide after reports
        </label>
        <Input
          id="autoHideReportThreshold"
          name="autoHideReportThreshold"
          type="number"
          min={0}
          defaultValue={settings.autoHideReportThreshold}
          className="mt-2"
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Use 0 to disable automatic hiding.
        </p>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={isPending}>
        Save spam settings
      </Button>
    </form>
  );
}
