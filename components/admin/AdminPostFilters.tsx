import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminPostFiltersProps = {
  filters: {
    search?: string;
    ipAddress?: string;
    visibility?: string;
    reportStatus?: string;
    sort?: string;
  };
};

function SelectShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative">
      {children}
      <ChevronDown
        className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-foreground"
        aria-hidden="true"
      />
    </div>
  );
}

export function AdminPostFilters({ filters }: AdminPostFiltersProps) {
  return (
    <form className="mb-6 grid gap-3 rounded-[1.5rem] border border-border p-4 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto]">
      <Input
        name="search"
        placeholder="Search posts"
        defaultValue={filters.search}
        aria-label="Search posts"
      />
      <Input
        name="ipAddress"
        placeholder="IP address"
        defaultValue={filters.ipAddress}
        aria-label="Filter by IP address"
      />
      <SelectShell>
        <select
          name="visibility"
          defaultValue={filters.visibility ?? "all"}
          className="h-12 w-full appearance-none rounded-full border border-border bg-background py-2 pl-4 pr-12 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
          aria-label="Filter by visibility"
        >
          <option value="all">All visibility</option>
          <option value="public">Public</option>
          <option value="link-only">Unlisted</option>
          <option value="hidden">Hidden</option>
        </select>
      </SelectShell>
      <SelectShell>
        <select
          name="reportStatus"
          defaultValue={filters.reportStatus ?? "all"}
          className="h-12 w-full appearance-none rounded-full border border-border bg-background py-2 pl-4 pr-12 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
          aria-label="Filter by report status"
        >
          <option value="all">All reports</option>
          <option value="reported">Reported</option>
          <option value="unreported">Unreported</option>
        </select>
      </SelectShell>
      <SelectShell>
        <select
          name="sort"
          defaultValue={filters.sort ?? "newest"}
          className="h-12 w-full appearance-none rounded-full border border-border bg-background py-2 pl-4 pr-12 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
          aria-label="Sort posts"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="reports">Most reported</option>
          <option value="visibility">Visibility</option>
          <option value="ip">IP address</option>
        </select>
      </SelectShell>
      <Button type="submit" size="lg">
        Apply
      </Button>
    </form>
  );
}
