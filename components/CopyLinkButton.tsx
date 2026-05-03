"use client";

import {
  Check,
  ChevronDown,
  Copy,
  Download,
  QrCode,
  Share2,
} from "lucide-react";
import Image from "next/image";
import QRCode from "qrcode";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CopyLinkButtonProps = {
  slug: string;
  label?: string;
  className?: string;
};

export function CopyLinkButton({
  slug,
  label = "Copy link",
  className,
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);
  const href = useMemo(() => {
    if (typeof window === "undefined") {
      return `/p/${slug}`;
    }

    return `${window.location.origin}/p/${slug}`;
  }, [slug]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setQrOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function recordShare() {
    startTransition(() => {
      void fetch(`/api/posts/${slug}/share`, { method: "POST" });
    });
  }

  async function createQrDataUrl() {
    if (qrDataUrl) {
      return qrDataUrl;
    }

    const dataUrl = await QRCode.toDataURL(href, {
      margin: 1,
      width: 208,
      color: {
        dark: "#181614",
        light: "#fffdfa",
      },
    });

    setQrDataUrl(dataUrl);
    return dataUrl;
  }

  async function createQrFile() {
    const dataUrl = await createQrDataUrl();
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    return new File([blob], `prompt-${slug}-qr.png`, {
      type: "image/png",
    });
  }

  async function copyLink() {
    await navigator.clipboard.writeText(href);
    setCopied(true);
    setOpen(false);
    window.setTimeout(() => setCopied(false), 1800);
    recordShare();
  }

  async function shareLink() {
    const qrFile = await createQrFile();
    const shareData = {
      title: "Prompt",
      text: "Read this anonymous post on Prompt.",
      url: href,
    };
    const shareDataWithQr = {
      ...shareData,
      files: [qrFile],
    };

    const supportsNativeShare = typeof navigator.share === "function";

    if (
      supportsNativeShare &&
      navigator.canShare?.(shareDataWithQr)
    ) {
      await navigator.share(shareDataWithQr);
    } else if (
      supportsNativeShare &&
      (!navigator.canShare || navigator.canShare(shareData))
    ) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }

    setOpen(false);
    recordShare();
  }

  async function showQrCode() {
    await createQrDataUrl();
    setQrOpen(true);
    recordShare();
  }

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        disabled={isPending}
        aria-haspopup="menu"
        aria-expanded={open}
        className="pr-5"
      >
        {copied ? (
          <Check className="size-4" aria-hidden="true" />
        ) : (
          <Share2 className="size-4" aria-hidden="true" />
        )}
        {copied ? "Copied" : label}
        <ChevronDown
          className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </Button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 w-64 rounded-[1.5rem] border border-border bg-background p-2 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-3 rounded-[1rem] px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
            onClick={copyLink}
          >
            <Copy className="size-4" aria-hidden="true" />
            Copy link
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-3 rounded-[1rem] px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
            onClick={shareLink}
          >
            <Share2 className="size-4" aria-hidden="true" />
            Share
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-3 rounded-[1rem] px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
            onClick={showQrCode}
          >
            <QrCode className="size-4" aria-hidden="true" />
            Show QR code
          </button>

          {qrOpen ? (
            <div className="mt-2 rounded-[1.25rem] border border-border bg-accent/40 p-4 text-center">
              {qrDataUrl ? (
                <Image
                  src={qrDataUrl}
                  alt={`QR code for ${href}`}
                  width={208}
                  height={208}
                  unoptimized
                  className="mx-auto size-52 rounded-[1rem] bg-background p-2"
                />
              ) : (
                <div className="grid size-52 place-items-center rounded-[1rem] bg-background text-sm text-muted-foreground">
                  Generating...
                </div>
              )}
              <p className="mt-3 break-all text-xs leading-relaxed text-muted-foreground">
                {href}
              </p>
              {qrDataUrl ? (
                <a
                  href={qrDataUrl}
                  download={`prompt-${slug}-qr.png`}
                  className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
                >
                  <Download className="size-4" aria-hidden="true" />
                  Download QR code
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
