"use client";

import { useState, useLayoutEffect, useEffect, useRef } from "react";
import SkinPage from "./SkinPage";
import { logUserEvent } from "./Events";
import { FeedNavButtons, ScrollHintPill } from "./FeedNavigation";
import { useSharedWebamp } from "./Webamp";

export type ClientSkin = {
  screenshotUrl: string;
  skinUrl: string;
  fileName: string;
  md5: string;
  readme: string;
  downloadUrl: string;
  shareUrl: string;
  nsfw: boolean;
  likeCount: number;
};

type Props = {
  initialSkins: ClientSkin[];
  getSkins: (sessionId: string, offset: number) => Promise<ClientSkin[]>;
  sessionId: string;
};

// After a failed fetch, wait this long before trying again, doubling on each
// consecutive failure.
const FETCH_RETRY_BASE_MS = 2000;
const FETCH_RETRY_MAX_MS = 60000;

export default function SkinScroller({
  initialSkins,
  getSkins,
  sessionId,
}: Props) {
  const [skins, setSkins] = useState<ClientSkin[]>(initialSkins);
  const [visibleSkinIndex, setVisibleSkinIndex] = useState(0);
  const [fetching, setFetching] = useState(false);
  // Set once the server has no more skins for this session.
  const [exhausted, setExhausted] = useState(false);
  const failureCountRef = useRef(0);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [webampSlot, setWebampSlot] = useState<HTMLDivElement | null>(null);
  const [hasEverScrolled, setHasEverScrolled] = useState(false);

  const visibleSkin = skins[visibleSkinIndex];
  useSharedWebamp(webampSlot, visibleSkin.skinUrl);

  // Track if user has ever scrolled to another skin
  useEffect(() => {
    if (visibleSkinIndex > 0) {
      setHasEverScrolled(true);
    }
  }, [visibleSkinIndex]);

  function scrollToSkin(index: number) {
    containerRef
      ?.querySelector(`[data-skin-index="${index}"]`)
      ?.scrollIntoView({ behavior: "smooth" });
  }

  // Keyboard navigation: J / Space for the next skin, K / Shift+Space for the
  // previous one. Webamp's own hotkeys don't use any of these.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) {
        return;
      }
      let delta: number;
      if (e.key === "j" || e.key === "J") {
        delta = 1;
      } else if (e.key === "k" || e.key === "K") {
        delta = -1;
      } else if (e.key === " ") {
        // Space should still press a focused button or link.
        if (target?.closest("button, a, [role='button']")) return;
        delta = e.shiftKey ? -1 : 1;
      } else {
        return;
      }
      e.preventDefault();
      const index = visibleSkinIndex + delta;
      if (index >= 0 && index < skins.length) scrollToSkin(index);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [visibleSkinIndex, skins.length, containerRef]);

  useLayoutEffect(() => {
    if (containerRef == null) {
      return;
    }

    // Use IntersectionObserver for cross-browser compatibility (iOS doesn't support scrollsnapchange)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When an element becomes mostly visible (> 50% intersecting)
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = parseInt(
              (entry.target as HTMLElement).dataset.skinIndex || "0",
              10
            );
            setVisibleSkinIndex(index);
          }
        });
      },
      {
        root: containerRef,
        threshold: 0.5, // Trigger when 50% of the element is visible
      }
    );

    // Observe all skin page elements
    const skinElements = containerRef.querySelectorAll("[data-skin-index]");
    skinElements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, [containerRef, skins.length]);

  useEffect(() => {
    logUserEvent(sessionId, {
      type: "session_start",
    });

    // Make sure we only ever log one session_end per session.
    let ended = false;

    // `pagehide` fires more reliably than `beforeunload`, notably on mobile
    // where pages are often closed by backgrounding the browser. A beacon is
    // used because a regular request may be cancelled as the page unloads.
    function onPageHide() {
      if (ended) return;
      ended = true;
      navigator.sendBeacon(
        "/scroll/events",
        new Blob(
          [
            JSON.stringify({
              sessionId,
              event: { type: "session_end", reason: "before_unload" },
            }),
          ],
          { type: "application/json" }
        )
      );
    }

    addEventListener("pagehide", onPageHide);
    return () => {
      removeEventListener("pagehide", onPageHide);
      if (ended) return;
      ended = true;
      // Client-side navigation away from the scroller.
      logUserEvent(sessionId, {
        type: "session_end",
        reason: "unmount",
      });
    };
  }, [sessionId]);

  const visibleSkinMd5 = visibleSkin.md5;
  const visibleSkinFileName = visibleSkin.fileName;
  useEffect(() => {
    // We want the URL and title to update as you scroll, but
    // we can't trigger a NextJS navigation since that would remount the
    // component. So, here we replicate the metadata behavior of the route.
    const newUrl = `/scroll/skin/${visibleSkinMd5}`;
    window.document.title = `${visibleSkinFileName} - Winamp Skin Museum`;
    window.history.replaceState(
      { ...window.history.state, as: newUrl, url: newUrl },
      "",
      newUrl
    );

    logUserEvent(sessionId, {
      type: "skin_view_start",
      skinMd5: visibleSkinMd5,
    });
    const startTime = Date.now();
    return () => {
      const durationMs = Date.now() - startTime;
      logUserEvent(sessionId, {
        type: "skin_view_end",
        skinMd5: visibleSkinMd5,
        durationMs,
      });
    };
  }, [visibleSkinMd5, visibleSkinFileName, sessionId]);

  useLayoutEffect(() => {
    if (fetching || exhausted) {
      return;
    }
    if (visibleSkinIndex + 5 < skins.length) {
      return;
    }
    setFetching(true);
    const offset = skins.length;
    logUserEvent(sessionId, {
      type: "skins_fetch_start",
      offset,
    });
    getSkins(sessionId, offset)
      .then((newSkins) => {
        logUserEvent(sessionId, {
          type: "skins_fetch_success",
          offset,
        });
        failureCountRef.current = 0;
        if (newSkins.length === 0) {
          setExhausted(true);
        } else {
          setSkins((prev) => {
            // Guard against the server returning a skin we already have,
            // which would give two pages the same key.
            const seen = new Set(prev.map((skin) => skin.md5));
            return [...prev, ...newSkins.filter((skin) => !seen.has(skin.md5))];
          });
        }
        setFetching(false);
      })
      .catch((error) => {
        logUserEvent(sessionId, {
          type: "skins_fetch_failure",
          offset,
          errorMessage: error.message,
        });
        // Back off before allowing another attempt, rather than retrying in a
        // tight loop.
        const delay = Math.min(
          FETCH_RETRY_BASE_MS * 2 ** failureCountRef.current,
          FETCH_RETRY_MAX_MS
        );
        failureCountRef.current++;
        setTimeout(() => setFetching(false), delay);
      });
  }, [
    visibleSkinIndex,
    skins.length,
    fetching,
    exhausted,
    sessionId,
    getSkins,
  ]);

  return (
    <>
      <div
        ref={setContainerRef}
        style={{
          // Full width so the wheel scrolls from anywhere on desktop, and so
          // the action icons can sit beside the skin. Each page constrains its
          // own content to MOBILE_MAX_WIDTH.
          height: "100dvh",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE and Edge
          WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
        }}
        className="hide-scrollbar"
      >
        {skins.map((skin, i) => {
          return (
            <SkinPage
              key={skin.md5}
              skin={skin}
              index={i}
              sessionId={sessionId}
              focused={i === visibleSkinIndex}
              webampSlotRef={setWebampSlot}
            />
          );
        })}
      </div>
      <ScrollHintPill
        hasScrolled={hasEverScrolled}
        onShown={() => {
          logUserEvent(sessionId, {
            type: "scroll_hint_shown",
          });
        }}
        onTap={() => scrollToSkin(visibleSkinIndex + 1)}
      />
      <FeedNavButtons
        canGoPrevious={visibleSkinIndex > 0}
        canGoNext={visibleSkinIndex < skins.length - 1}
        onPrevious={() => scrollToSkin(visibleSkinIndex - 1)}
        onNext={() => scrollToSkin(visibleSkinIndex + 1)}
      />
      {/* Top shadow overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "1rem",
          background:
            "linear-gradient(180deg, rgba(26, 26, 26, 0.8) 0%, rgba(26, 26, 26, 0.4) 50%, rgba(26, 26, 26, 0) 100%)",
          pointerEvents: "none",
          zIndex: 500,
        }}
      />
    </>
  );
}
