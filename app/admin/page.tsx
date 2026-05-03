import Link from "next/link";
import { AdminPostFilters } from "@/components/admin/AdminPostFilters";
import { AdminPostTable } from "@/components/admin/AdminPostTable";
import { AdminShell } from "@/components/admin/AdminShell";
import type { AdminPostFilters as AdminPostFilterValues } from "@/lib/admin-data";
import { getAdminPosts } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type AdminDashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminDashboardPage({
  searchParams,
}: AdminDashboardPageProps) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const filters: AdminPostFilterValues = {
    search: firstParam(params.search),
    ipAddress: firstParam(params.ipAddress),
    visibility: firstParam(params.visibility) ?? "all",
    reportStatus: firstParam(params.reportStatus) ?? "all",
    sort: firstParam(params.sort) ?? "newest",
    page: firstParam(params.page) ?? "1",
  };
  const { posts, total, page, pageSize, totalPages } = await getAdminPosts(filters);
  const reportedCount = posts.filter((post) => post.reportCount > 0).length;
  const hiddenCount = posts.filter((post) => post.visibility === "hidden").length;
  const startPost = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endPost = Math.min(total, page * pageSize);

  function pageHref(nextPage: number) {
    const nextParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (!value || (key !== "page" && value === "all")) {
        return;
      }

      nextParams.set(key, key === "page" ? String(nextPage) : value);
    });

    nextParams.set("page", String(nextPage));

    return `/admin?${nextParams.toString()}`;
  }

  return (
    <AdminShell email={admin.email} active="posts">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">
              Moderation
            </p>
            <h1 className="mt-4 font-serif text-5xl tracking-[-0.05em]">
              All posts
            </h1>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>
              {startPost}-{endPost} of {total} shown
            </span>
            <span>{reportedCount} flagged</span>
            <span>{hiddenCount} hidden</span>
          </div>
        </div>
        <AdminPostFilters filters={filters} />
        <AdminPostTable posts={posts} />
        <nav
          className="mt-6 flex items-center justify-between gap-3 text-sm"
          aria-label="Admin posts pagination"
        >
          {page > 1 ? (
            <Link
              href={pageHref(page - 1)}
              className="rounded-full border border-border px-4 py-2 font-medium hover:bg-accent"
            >
              Previous
            </Link>
          ) : (
            <span className="rounded-full border border-border px-4 py-2 text-muted-foreground opacity-60">
              Previous
            </span>
          )}
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={pageHref(page + 1)}
              className="rounded-full border border-border px-4 py-2 font-medium hover:bg-accent"
            >
              Next
            </Link>
          ) : (
            <span className="rounded-full border border-border px-4 py-2 text-muted-foreground opacity-60">
              Next
            </span>
          )}
        </nav>
      </div>
    </AdminShell>
  );
}
