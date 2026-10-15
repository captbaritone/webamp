"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { DESKTOP_MEDIA_QUERY } from "./breakpoints";

// How long the visitor must be idle before we hint.
const HINT_IDLE_MS = 3000;

type Props = {
  // Remembered per device under this key once `done`: after someone has done
  // the thing once, they know how.
  storageKey: string;
  // True once the visitor has done what the hint suggests.
  done: boolean;
  onShown: () => void;
  // Tapping the pill also dismisses it for good.
  onTap?: () => void;
  icon: ReactNode;
  children: ReactNode;
  // Positions this pill (see .hint-pill in scroll.css).
  className: string;
};

/**
 * On mobile, a small pill suggesting what to do next, shown once per device
 * if the visitor hasn't done it after a few idle seconds. Any interaction
 * restarts the wait, so it never interrupts someone who's busy.
 */
export default function HintPill({
  storageKey,
  done,
  onShown,
  onTap,
  icon,
  children,
  className,
}: Props) {
  const [visible, setVisible] = useState(false);
  const onShownRef = useRef(onShown);
  onShownRef.current = onShown;

  useEffect(() => {
    if (done) {
      setVisible(false);
      markHintDone(storageKey);
      return;
    }
    try {
      if (localStorage.getItem(storageKey) != null) return;
    } catch {
      // Fall through and hint.
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    const show = () => {
      if (window.matchMedia(DESKTOP_MEDIA_QUERY).matches) return;
      setVisible(true);
      onShownRef.current();
      stopListening();
    };
    const restart = () => {
      clearTimeout(timer);
      timer = setTimeout(show, HINT_IDLE_MS);
    };
    const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    const stopListening = () => {
      for (const event of events) removeEventListener(event, restart, true);
    };
    for (const event of events) {
      addEventListener(event, restart, { capture: true, passive: true });
    }
    restart();
    return () => {
      clearTimeout(timer);
      stopListening();
    };
  }, [done, storageKey]);

  if (!visible) return null;
  return (
    <button
      className={`hint-pill ${className}`}
      onClick={() => {
        onTap?.();
        setVisible(false);
        markHintDone(storageKey);
      }}
    >
      <span className="hint-pill-icon" aria-hidden>
        {icon}
      </span>
      {children}
    </button>
  );
}

// Remember that the visitor has done what a hint suggests, so it never shows
// again on this device. Callers about to navigate away can call this directly.
export function markHintDone(storageKey: string): void {
  try {
    localStorage.setItem(storageKey, "1");
  } catch {
    // Storage can be unavailable (e.g. private mode). We'll just hint again.
  }
}
