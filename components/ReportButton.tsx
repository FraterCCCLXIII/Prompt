"use client";

import { Flag } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

type ReportButtonProps = {
  slug: string;
};

export function ReportButton({ slug }: ReportButtonProps) {
  const [reported, setReported] = useState(false);
  const [isPending, startTransition] = useTransition();

  function reportPost() {
    startTransition(async () => {
      await fetch(`/api/posts/${slug}/report`, { method: "POST" });
      setReported(true);
    });
  }

  return (
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
  );
}
