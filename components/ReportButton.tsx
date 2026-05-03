"use client";

import { Flag } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

type ReportButtonProps = {
  slug: string;
};

export function ReportButton({ slug }: ReportButtonProps) {
  const [reported, setReported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reportPost() {
    startTransition(async () => {
      setError(null);

      const response = await fetch(`/api/posts/${slug}/report`, { method: "POST" });
      const data = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        setError(data?.message ?? "Unable to report this post.");
        return;
      }

      setReported(true);
    });
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="default"
        className="text-muted-foreground"
        aria-label="Report this post"
        onClick={reportPost}
        disabled={isPending || reported}
      >
        <Flag className="size-4" aria-hidden="true" />
        {reported ? "Reported" : "Report"}
      </Button>
      {error ? (
        <p className="max-w-56 text-center text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
