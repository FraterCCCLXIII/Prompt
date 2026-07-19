"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

type ScrollPageNavigationProps = {
  upHref?: string | null;
  downHref?: string | null;
};

const WHEEL_THRESHOLD = 90;
const TOUCH_THRESHOLD = 60;
const RESET_DELAY_MS = 250;
const NAV_DIRECTION_ATTRIBUTE = "data-post-nav-direction";

type HorizontalDirection = "left" | "right";

type DocumentWithViewTransition = Document & {
  startViewTransition?: (updateCallback: () => void | Promise<void>) => {
    finished: Promise<void>;
  };
};

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest(
      "input, textarea, select, button, a, [contenteditable='true'], [role='button']",
    ),
  );
}

export function ScrollPageNavigation({ upHref, downHref }: ScrollPageNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const wheelDeltaRef = useRef(0);
  const wheelResetTimerRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    isNavigatingRef.current = false;
  }, [pathname]);

  useEffect(() => {
    function navigate(href: string | null | undefined, direction: HorizontalDirection) {
      if (!href || isNavigatingRef.current || href === pathname) {
        return false;
      }

      isNavigatingRef.current = true;
      document.documentElement.setAttribute(NAV_DIRECTION_ATTRIBUTE, direction);
      const documentWithViewTransition = document as DocumentWithViewTransition;
      const startTransition = documentWithViewTransition.startViewTransition;

      if (startTransition) {
        const transition = startTransition.call(document, () => {
          router.push(href);
        });

        transition.finished.finally(() => {
          document.documentElement.removeAttribute(NAV_DIRECTION_ATTRIBUTE);
        });
      } else {
        router.push(href);
        document.documentElement.removeAttribute(NAV_DIRECTION_ATTRIBUTE);
      }

      return true;
    }

    function resetWheelAccumulation() {
      wheelDeltaRef.current = 0;
      if (wheelResetTimerRef.current) {
        window.clearTimeout(wheelResetTimerRef.current);
        wheelResetTimerRef.current = null;
      }
    }

    function scheduleReset() {
      if (wheelResetTimerRef.current) {
        window.clearTimeout(wheelResetTimerRef.current);
      }

      wheelResetTimerRef.current = window.setTimeout(() => {
        wheelDeltaRef.current = 0;
        wheelResetTimerRef.current = null;
      }, RESET_DELAY_MS);
    }

    function handleWheel(event: WheelEvent) {
      if (isInteractiveTarget(event.target)) {
        return;
      }

      wheelDeltaRef.current += event.deltaY;
      scheduleReset();

      if (wheelDeltaRef.current >= WHEEL_THRESHOLD) {
        const didNavigate = navigate(downHref, "left");
        if (didNavigate) {
          event.preventDefault();
        }
        resetWheelAccumulation();
      } else if (wheelDeltaRef.current <= -WHEEL_THRESHOLD) {
        const didNavigate = navigate(upHref, "right");
        if (didNavigate) {
          event.preventDefault();
        }
        resetWheelAccumulation();
      }
    }

    function handleTouchStart(event: TouchEvent) {
      touchStartYRef.current = event.changedTouches[0]?.clientY ?? null;
    }

    function handleTouchEnd(event: TouchEvent) {
      const touchStartY = touchStartYRef.current;
      touchStartYRef.current = null;

      if (touchStartY === null || isInteractiveTarget(event.target)) {
        return;
      }

      const touchEndY = event.changedTouches[0]?.clientY;
      if (typeof touchEndY !== "number") {
        return;
      }

      const deltaY = touchStartY - touchEndY;
      if (deltaY >= TOUCH_THRESHOLD) {
        navigate(downHref, "left");
      } else if (deltaY <= -TOUCH_THRESHOLD) {
        navigate(upHref, "right");
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      if (wheelResetTimerRef.current) {
        window.clearTimeout(wheelResetTimerRef.current);
      }
    };
  }, [downHref, pathname, router, upHref]);

  return null;
}
