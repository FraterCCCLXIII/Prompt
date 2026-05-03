"use client";

import { useActionState } from "react";
import {
  type AppSettingsState,
  updateAppSettingsAction,
} from "@/app/admin/actions/app-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type GoogleAnalyticsSettingsFormProps = {
  settings: {
    googleAnalyticsEnabled: boolean;
    googleAnalyticsMeasurementId: string | null;
  };
};

const initialState: AppSettingsState = {};

export function GoogleAnalyticsSettingsForm({
  settings,
}: GoogleAnalyticsSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateAppSettingsAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="googleAnalyticsEnabled" value="false" />
      <label
        className="flex items-start gap-3 rounded-[1.25rem] border border-border p-4"
        htmlFor="googleAnalyticsEnabled"
      >
        <input
          id="googleAnalyticsEnabled"
          name="googleAnalyticsEnabled"
          type="checkbox"
          value="true"
          defaultChecked={settings.googleAnalyticsEnabled}
          className="mt-1 size-4 accent-foreground"
        />
        <span>
          <span className="block text-sm font-medium">Enable Google Analytics</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            Adds the GA4 tag to public pages when a measurement ID is configured.
          </span>
        </span>
      </label>

      <div>
        <label
          className="text-sm font-medium"
          htmlFor="googleAnalyticsMeasurementId"
        >
          GA4 measurement ID
        </label>
        <Input
          id="googleAnalyticsMeasurementId"
          name="googleAnalyticsMeasurementId"
          type="text"
          placeholder="G-XXXXXXXXXX"
          defaultValue={settings.googleAnalyticsMeasurementId ?? ""}
          autoComplete="off"
          className="mt-2 uppercase"
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Find this in Google Analytics under Admin, Data streams, Web.
        </p>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={isPending}>
        Save analytics settings
      </Button>
    </form>
  );
}
