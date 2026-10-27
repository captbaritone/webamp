"use client";

import { useEffect, useState } from "react";
import HintPill from "./HintPill";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FEED_COLUMN_RATIO } from "../../../legacy-client/src/constants";

type ScrollHintPillProps = {
  // True once the user has moved on from the first skin.
  hasScrolled: boolean;
  onShown: () => void;
  onTap: () => void;
};

/** On mobile, a "Swipe up" hint above the floating bar (see HintPill). */
export function ScrollHintPill({
  hasScrolled,
  onShown,
  onTap,
}: ScrollHintPillProps) {
  return (
    <HintPill
      storageKey="scroll-hint-dismissed"
      done={hasScrolled}
      onShown={onShown}
      onTap={onTap}
      icon={<ChevronUp size={16} />}
      className="hint-pill-feed"
    >
      Swipe up for more skins
    </HintPill>
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
