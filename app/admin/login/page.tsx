import { redirect } from "next/navigation";
import { AdminAuthForm } from "@/components/admin/AdminAuthForm";
import { getAdminSessionUser, hasAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (!(await hasAdminUser())) {
    redirect("/admin/setup");
  }

  if (await getAdminSessionUser()) {
    redirect("/admin");
  }

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-12">
      <section className="w-full max-w-md">
        <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">
          Admin
        </p>
        <h1 className="mt-6 font-serif text-5xl tracking-[-0.05em]">
          Sign in to Prompt.
        </h1>
        <AdminAuthForm mode="login" />
      </section>
    </main>
  );
}
