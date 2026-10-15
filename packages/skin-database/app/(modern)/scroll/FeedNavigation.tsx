"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FEED_COLUMN_RATIO } from "../../../legacy-client/src/constants";

// The desktop breakpoint from scroll.css: action icons beside the skin,
// next/previous buttons, no hint pill.
export const DESKTOP_MEDIA_QUERY = "(min-aspect-ratio: 3/4)";

// Remembered per device: once someone has scrolled, they know how.
const HINT_DISMISSED_KEY = "scroll-hint-dismissed";

// How long the user must be idle before we hint.
const HINT_IDLE_MS = 3000;

type ScrollHintPillProps = {
  // True once the user has moved on from the first skin.
  hasScrolled: boolean;
  onShown: () => void;
  onTap: () => void;
};

/**
 * On mobile, a small "Swipe up" pill above the bottom menu bar, shown once
 * per device if the user hasn't scrolled after a few idle seconds.
 */
export function ScrollHintPill({
  hasScrolled,
  onShown,
  onTap,
}: ScrollHintPillProps) {
  const [visible, setVisible] = useState(false);
  const onShownRef = useRef(onShown);
  onShownRef.current = onShown;

  useEffect(() => {
    if (hasScrolled) {
      setVisible(false);
      try {
        localStorage.setItem(HINT_DISMISSED_KEY, "1");
      } catch {
        // Storage can be unavailable (e.g. private mode). We'll just hint again.
      }
      return;
    }
    try {
      if (localStorage.getItem(HINT_DISMISSED_KEY) != null) return;
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
    // Any interaction (e.g. playing with Webamp) restarts the idle timer.
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
  }, [hasScrolled]);

  if (!visible) return null;
  return (
    <button className="scroll-hint-pill" onClick={onTap}>
      <ChevronUp size={16} className="scroll-hint-chevron" aria-hidden />
      Swipe up for more skins
    </button>
  );
}

type FeedNavButtonsProps = {
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

/** On desktop, previous/next skin buttons at the right edge of the screen. */
export function FeedNavButtons({
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
}: FeedNavButtonsProps) {
  const hasRoom = useHasRoomForNavButtons();
  if (!hasRoom) return null;
  return (
    <div className="feed-nav-buttons">
      <button
        className="feed-nav-button"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        aria-label="Previous skin"
        aria-keyshortcuts="K ArrowUp Shift+Space"
        title="Previous skin (K)"
      >
        <ChevronUp size={24} />
      </button>
      <button
        className="feed-nav-button"
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="Next skin"
        aria-keyshortcuts="J ArrowDown Space"
        title="Next skin (J)"
      >
        <ChevronDown size={24} />
      </button>
    </div>
  );
}

// Horizontal space the right edge needs, beside the skin column, to fit the
// action icons and these buttons without overlapping: the icons' 1.5rem
// offset and ~2.5rem width, a 1rem gap, the 2.75rem buttons and their 1.5rem
// margin. 9.25rem at the default 16px font size.
const NAV_BUTTONS_SIDE_SPACE_PX = 148;

/**
 * Whether there's room beside the skin column (min(100vw, 56.25dvh) wide,
 * centered) for the buttons. Starts true so server and client render the
 * same; the CSS hides them on mobile anyway.
 */
function useHasRoomForNavButtons(): boolean {
  const [hasRoom, setHasRoom] = useState(true);
  useEffect(() => {
    function measure() {
      const width = window.innerWidth;
      const columnWidth = Math.min(
        width,
        window.innerHeight * FEED_COLUMN_RATIO
      );
      setHasRoom((width - columnWidth) / 2 >= NAV_BUTTONS_SIDE_SPACE_PX);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  return hasRoom;
}
