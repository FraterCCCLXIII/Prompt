import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { DatabaseBackupForm } from "@/components/admin/DatabaseBackupForm";
import { GoogleAnalyticsSettingsForm } from "@/components/admin/GoogleAnalyticsSettingsForm";
import { getAdminUserForSettings } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/admin-auth";
import { getAppSettings } from "@/lib/app-settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  const [adminUser, appSettings] = await Promise.all([
    getAdminUserForSettings(admin.id),
    getAppSettings(),
  ]);

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
        <div className="mt-8">
          <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">
            Analytics
          </p>
          <h2 className="mt-4 font-serif text-4xl tracking-[-0.05em]">
            Google Analytics
          </h2>
          <div className="mt-5 rounded-[1.5rem] border border-border p-5">
            <GoogleAnalyticsSettingsForm settings={appSettings} />
          </div>
        </div>
        <div className="mt-8">
          <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">
            Database
          </p>
          <h2 className="mt-4 font-serif text-4xl tracking-[-0.05em]">
            Backup and restore
          </h2>
          <div className="mt-5">
            <DatabaseBackupForm />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
