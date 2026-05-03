"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const visibilityOptions = [
  {
    value: "public",
    label: "Public",
    description: "Can appear in the viewer.",
  },
  {
    value: "link-only",
    label: "Link-Only",
    description: "Only people with the URL can read it.",
  },
] as const;

type VisibilityValue = (typeof visibilityOptions)[number]["value"];

export function VisibilityDropdown() {
  const [selectedValue, setSelectedValue] = useState<VisibilityValue>("public");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selectedOption = visibilityOptions.find(
    (option) => option.value === selectedValue,
  );

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <input type="hidden" name="visibility" value={selectedValue} />
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className="inline-flex h-12 items-center justify-between gap-3 rounded-full border border-border bg-background py-2 pl-4 pr-5 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
        onClick={() => setOpen((currentOpen) => !currentOpen)}
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown
          className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Post visibility"
          className="absolute bottom-full right-0 z-20 mb-2 w-72 rounded-[1.5rem] border border-border bg-background p-2 shadow-lg"
        >
          {visibilityOptions.map((option) => {
            const selected = option.value === selectedValue;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                className="flex w-full items-start justify-between gap-3 rounded-[1rem] px-4 py-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
                onClick={() => {
                  setSelectedValue(option.value);
                  setOpen(false);
                }}
              >
                <span>
                  <span className="block text-sm font-medium text-foreground">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {option.description}
                  </span>
                </span>
                {selected ? (
                  <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
