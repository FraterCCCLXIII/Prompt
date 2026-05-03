import { banIpAction, removeBanAction } from "@/app/admin/actions/moderation";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBannedIps } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminIpBansPage() {
  const admin = await requireAdmin();
  const bannedIps = await getBannedIps();

  return (
    <AdminShell email={admin.email} active="ip-bans">
      <div className="mx-auto w-full max-w-3xl">
        <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">
          IP bans
        </p>
        <h1 className="mt-4 font-serif text-5xl tracking-[-0.05em]">
          Block posting
        </h1>
        <form
          action={banIpAction}
          className="mt-8 space-y-3 rounded-[1.5rem] border border-border p-5"
        >
          <Input name="ipAddress" placeholder="IP address" required />
          <Input name="reason" placeholder="Reason, optional" />
          <Button type="submit">Ban IP</Button>
        </form>

        <div className="mt-6 space-y-3">
          {bannedIps.map((ban) => (
            <div
              key={ban.id}
              className="flex items-center justify-between gap-4 rounded-[1rem] border border-border p-4"
            >
              <div>
                <p className="font-mono text-sm">{ban.ipAddress}</p>
                {ban.reason ? (
                  <p className="mt-1 text-sm text-muted-foreground">{ban.reason}</p>
                ) : null}
              </div>
              <form action={removeBanAction}>
                <input type="hidden" name="id" value={ban.id} />
                <Button type="submit" variant="ghost">
                  Remove
                </Button>
              </form>
            </div>
          ))}
          {bannedIps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No banned IPs.</p>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}
