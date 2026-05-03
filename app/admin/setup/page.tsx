import { redirect } from "next/navigation";
import { AdminAuthForm } from "@/components/admin/AdminAuthForm";
import { hasAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminSetupPage() {
  if (await hasAdminUser()) {
    redirect("/admin/login");
  }

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-12">
      <section className="w-full max-w-md">
        <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">
          First-time setup
        </p>
        <h1 className="mt-6 font-serif text-5xl tracking-[-0.05em]">
          Create the Prompt admin.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Set the email and password used to manage posts, reports, and bans.
          Use the setup secret from your environment file if one is configured.
        </p>
        <AdminAuthForm mode="setup" />
      </section>
    </main>
  );
}
