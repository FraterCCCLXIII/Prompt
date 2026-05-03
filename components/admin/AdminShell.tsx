import { LogOut } from "lucide-react";
import Link from "next/link";
import { logoutAdminAction } from "@/app/admin/actions/auth";
import { SiteLogoMenu } from "@/components/SiteLogoMenu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  email: string;
  active: "posts" | "settings" | "ip-bans";
  children: React.ReactNode;
};

const navItems = [
  { href: "/admin", label: "Posts", active: "posts" },
  { href: "/admin/ip-bans", label: "IP bans", active: "ip-bans" },
  { href: "/admin/settings", label: "Admin settings", active: "settings" },
] as const;

export function AdminShell({ email, active, children }: AdminShellProps) {
  return (
    <main className="min-h-dvh md:grid md:grid-cols-[17rem_1fr]">
      <aside className="flex flex-col border-b border-border px-5 py-4 md:sticky md:top-0 md:min-h-dvh md:border-b-0 md:border-r md:px-6 md:py-6">
        <div className="flex items-start gap-4">
          <SiteLogoMenu className="shrink-0" />
          <div>
            <Link href="/admin" className="text-sm uppercase tracking-[0.32em]">
              Prompt Admin
            </Link>
          </div>
        </div>
        <nav className="mt-6 flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-3 text-sm font-medium transition-colors hover:bg-accent",
                active === item.active
                  ? "bg-foreground text-background hover:bg-foreground/85"
                  : "text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-6 md:mt-auto">
          <p className="min-w-0 break-all text-sm text-muted-foreground">{email}</p>
          <form action={logoutAdminAction} className="shrink-0">
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </Button>
          </form>
        </div>
      </aside>
      <section className="min-w-0 px-5 py-8 sm:px-8">{children}</section>
    </main>
  );
}
