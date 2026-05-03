import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminUserForSettings } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  const adminUser = await getAdminUserForSettings(admin.id);

  return (
    <AdminShell email={admin.email} active="settings">
      <div className="mx-auto w-full max-w-2xl">
        <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">
          Login
        </p>
        <h1 className="mt-4 font-serif text-5xl tracking-[-0.05em]">
          Admin settings
        </h1>
        <div className="mt-8 rounded-[1.5rem] border border-border p-5">
          <AdminSettingsForm email={adminUser?.email ?? admin.email} />
        </div>
      </div>
    </AdminShell>
  );
}
