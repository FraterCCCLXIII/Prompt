"use client";

import { useActionState } from "react";
import {
  type AdminActionState,
  updateAdminCredentialsAction,
} from "@/app/admin/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminSettingsFormProps = {
  email: string;
};

const initialState: AdminActionState = {};

export function AdminSettingsForm({ email }: AdminSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateAdminCredentialsAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <Input name="email" type="email" defaultValue={email} autoComplete="email" />
      <Input
        name="newPassword"
        type="password"
        placeholder="New password"
        autoComplete="new-password"
      />
      <Input
        name="currentPassword"
        type="password"
        placeholder="Current password required"
        autoComplete="current-password"
        required
      />
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={isPending}>
        Save login settings
      </Button>
    </form>
  );
}
