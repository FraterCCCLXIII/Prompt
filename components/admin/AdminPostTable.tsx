import { Ban, Eye, EyeOff, FlagOff, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  banIpAction,
  clearReportAction,
  deletePostAction,
  hidePostAction,
  unhidePostAction,
} from "@/app/admin/actions/moderation";
import { Button } from "@/components/ui/button";

type AdminPost = {
  id: string;
  slug: string;
  title: string | null;
  content: string;
  createdAt: Date;
  visibility: string;
  ipAddress: string | null;
  reportCount: number;
  reportedAt: Date | null;
  hiddenAt: Date | null;
};

function visibilityLabel(visibility: string) {
  if (visibility === "link-only") {
    return "Unlisted";
  }

  if (visibility === "hidden") {
    return "Hidden";
  }

  return "Public";
}

export function AdminPostTable({ posts }: { posts: AdminPost[] }) {
  return (
    <div className="overflow-x-auto rounded-[1.5rem] border border-border">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="border-b border-border bg-accent/60 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Post ID</th>
            <th className="px-4 py-3">IP address</th>
            <th className="px-4 py-3">Visibility</th>
            <th className="px-4 py-3">Reports</th>
            <th className="px-4 py-3">Preview</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} className="border-b border-border last:border-b-0">
              <td className="px-4 py-4 text-muted-foreground">
                {new Intl.DateTimeFormat("en", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(post.createdAt)}
              </td>
              <td className="px-4 py-4 font-mono text-xs">
                <Link href={`/p/${post.slug}`} className="underline-offset-4 hover:underline">
                  {post.id}
                </Link>
              </td>
              <td className="px-4 py-4 font-mono text-xs">
                {post.ipAddress ?? "Unknown"}
              </td>
              <td className="px-4 py-4">
                <span className="rounded-full border border-border px-3 py-1">
                  {visibilityLabel(post.visibility)}
                </span>
              </td>
              <td className="px-4 py-4">
                {post.reportCount > 0 ? (
                  <span className="text-destructive">
                    Flagged {post.reportCount}
                    {post.reportedAt ? "x" : ""}
                  </span>
                ) : (
                  <span className="text-muted-foreground">None</span>
                )}
              </td>
              <td className="max-w-xs px-4 py-4">
                <p className="line-clamp-2 text-muted-foreground">
                  {post.title ? `${post.title}: ` : ""}
                  {post.content}
                </p>
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  {post.visibility === "hidden" ? (
                    <form action={unhidePostAction}>
                      <input type="hidden" name="id" value={post.id} />
                      <input type="hidden" name="visibility" value="public" />
                      <Button
                        type="submit"
                        variant="outline"
                        size="icon"
                        aria-label="Unhide post"
                        title="Unhide post"
                      >
                        <Eye className="size-4" aria-hidden="true" />
                      </Button>
                    </form>
                  ) : (
                    <form action={hidePostAction}>
                      <input type="hidden" name="id" value={post.id} />
                      <Button
                        type="submit"
                        variant="outline"
                        size="icon"
                        aria-label="Hide post"
                        title="Hide post"
                      >
                        <EyeOff className="size-4" aria-hidden="true" />
                      </Button>
                    </form>
                  )}
                  {post.reportCount > 0 ? (
                    <form action={clearReportAction}>
                      <input type="hidden" name="id" value={post.id} />
                      <Button
                        type="submit"
                        variant="outline"
                        size="icon"
                        aria-label="Clear report flag"
                        title="Clear report flag"
                      >
                        <FlagOff className="size-4" aria-hidden="true" />
                      </Button>
                    </form>
                  ) : null}
                  {post.ipAddress ? (
                    <form action={banIpAction}>
                      <input type="hidden" name="ipAddress" value={post.ipAddress} />
                      <input
                        type="hidden"
                        name="reason"
                        value={`Banned from post ${post.id}`}
                      />
                      <Button
                        type="submit"
                        variant="outline"
                        size="icon"
                        aria-label="Ban IP address"
                        title="Ban IP address"
                      >
                        <Ban className="size-4" aria-hidden="true" />
                      </Button>
                    </form>
                  ) : null}
                  <form action={deletePostAction}>
                    <input type="hidden" name="id" value={post.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      aria-label="Delete post"
                      title="Delete post"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {posts.length === 0 ? (
        <p className="p-8 text-center text-muted-foreground">No posts yet.</p>
      ) : null}
    </div>
  );
}
