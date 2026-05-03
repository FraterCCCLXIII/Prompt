import Link from "next/link";
import { logoutAdminAction } from "@/app/admin/actions/auth";
import { Button } from "@/components/ui/button";

type AdminHeaderProps = {
  email: string;
};

export function AdminHeader({ email }: AdminHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div>
        <Link href="/admin" className="text-sm uppercase tracking-[0.32em]">
          Prompt Admin
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">{email}</p>
      </div>
      <nav className="flex items-center gap-3">
        <Button asChild variant="outline">
          <Link href="/admin">Posts</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/settings">Settings</Link>
        </Button>
        <form action={logoutAdminAction}>
          <Button type="submit" variant="ghost">
            Sign out
          </Button>
        </form>
      </nav>
    </header>
  );
}
