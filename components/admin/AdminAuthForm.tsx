"use client";

import { useActionState } from "react";
import {
  type AdminActionState,
  loginAdminAction,
  setupAdminAction,
} from "@/app/admin/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminAuthFormProps = {
  mode: "setup" | "login";
};

const initialState: AdminActionState = {};

export function AdminAuthForm({ mode }: AdminAuthFormProps) {
  const [state, formAction, isPending] = useActionState(
    mode === "setup" ? setupAdminAction : loginAdminAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <Input name="email" type="email" placeholder="Email" autoComplete="email" required />
      <Input
        name="password"
        type="password"
        placeholder="Password"
        autoComplete={mode === "setup" ? "new-password" : "current-password"}
        required
      />
      {mode === "setup" ? (
        <Input
          name="setupSecret"
          type="password"
          placeholder="Setup secret"
          autoComplete="off"
        />
      ) : null}
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={isPending} className="w-full">
        {mode === "setup" ? "Create admin" : "Sign in"}
      </Button>
    </form>
  );
}
