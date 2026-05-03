"use client";

import { useEffect, useState } from "react";

const LOGO_FRAMES = ["░", "▒", "▓", "█"] as const;

export function AsciiLogo() {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setFrameIndex((currentIndex) => (currentIndex + 1) % LOGO_FRAMES.length);
    }, 500);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <span aria-hidden="true" className="inline-block w-[1ch] font-mono">
      {LOGO_FRAMES[frameIndex]}
    </span>
  );
}
