"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AsciiLogo } from "@/components/AsciiLogo";
import { cn } from "@/lib/utils";

type SiteLogoMenuProps = {
  className?: string;
};

export function SiteLogoMenu({ className }: SiteLogoMenuProps) {
  const [open, setOpen] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);

  function clearCloseTimeout() {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }

  function openMenu() {
    clearCloseTimeout();
    setOpen(true);
  }

  function scheduleClose() {
    clearCloseTimeout();
    closeTimeoutRef.current = window.setTimeout(() => setOpen(false), 350);
  }

  return (
    <div
      className={cn("relative inline-flex pb-3", className)}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
      onFocus={openMenu}
      onBlur={scheduleClose}
    >
      <Link
        href="/"
        aria-label="Prompt home"
        className="text-2xl leading-none text-foreground transition hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
      >
        <AsciiLogo />
      </Link>
      <div
        className={cn(
          "absolute left-0 top-full z-30 min-w-40 rounded-[1.25rem] border border-border bg-background p-2 text-sm shadow-lg transition-opacity",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <Link
          href="/"
          className="block rounded-[0.875rem] px-4 py-3 font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
        >
          Write
        </Link>
        <Link
          href="/read"
          className="block rounded-[0.875rem] px-4 py-3 font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
        >
          Read
        </Link>
        <Link
          href="/about"
          className="block rounded-[0.875rem] px-4 py-3 font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
        >
          About
        </Link>
      </div>
    </div>
  );
}
