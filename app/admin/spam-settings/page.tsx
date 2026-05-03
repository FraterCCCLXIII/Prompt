import { AdminShell } from "@/components/admin/AdminShell";
import { SpamSettingsForm } from "@/components/admin/SpamSettingsForm";
import { requireAdmin } from "@/lib/admin-auth";
import { getSpamSettings } from "@/lib/spam-settings";

export const dynamic = "force-dynamic";

export default async function AdminSpamSettingsPage() {
  const admin = await requireAdmin();
  const spamSettings = await getSpamSettings();

  return (
    <AdminShell email={admin.email} active="spam-settings">
      <div className="mx-auto w-full max-w-2xl">
        <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">
          Spam prevention
        </p>
        <h1 className="mt-4 font-serif text-5xl tracking-[-0.05em]">
          Posting limits
        </h1>
        <div className="mt-8 rounded-[1.5rem] border border-border p-5">
          <SpamSettingsForm settings={spamSettings} />
        </div>
      </div>
    </AdminShell>
  );
}
