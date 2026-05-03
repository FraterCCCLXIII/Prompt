"use client";

import { useEffect, useState } from "react";

const ANIMATION_FRAMES = ["░", "▒", "▓", "█", "▓", "▒"] as const;

export function AsciiLogo() {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setFrameIndex((currentIndex) => (currentIndex + 1) % ANIMATION_FRAMES.length);
    }, 500);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <span aria-hidden="true" className="inline-block w-[1ch] font-mono">
      {ANIMATION_FRAMES[frameIndex]}
    </span>
  );
}
