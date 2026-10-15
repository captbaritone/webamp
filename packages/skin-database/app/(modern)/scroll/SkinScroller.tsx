"use client";

import { useState, useLayoutEffect, useEffect, useRef } from "react";
import SkinPage from "./SkinPage";
import { FeedNavButtons, ScrollHintPill } from "./FeedNavigation";
import { useSharedWebamp } from "./Webamp";
import { skinPath } from "./paths";
import {
  createEventLogger,
  EventLoggerContext,
  getVisitContext,
  takeFeedEntry,
} from "./eventLogger";
import type { NavMethod, SkinSource } from "./eventTypes";

export type ClientSkin = {
  screenshotUrl: string;
  skinUrl: string;
  fileName: string;
  md5: string;
  // Where it came from, for logging which kinds of skins hold attention.
  source: SkinSource;
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
  // The route was for a specific skin (the first one), e.g. a shared link.
  landedOnSkin?: boolean;
};

// After a failed fetch, wait this long before trying again, doubling on each
// consecutive failure.
const FETCH_RETRY_BASE_MS = 2000;
const FETCH_RETRY_MAX_MS = 60000;

// The skin currently in view, for timing how long it holds attention.
type OpenView = {
  skinMd5: string;
  position: number;
  source: SkinSource;
  // performance.now() when it came into view.
  startedAt: number;
  // Time the page was visible while it was in view, not counting the current
  // stretch (see activeSince).
  activeMs: number;
  // performance.now() when the page last became visible, or null while hidden.
  activeSince: number | null;
  // Completed presses on Webamp while it was in view.
  webampInteractions: number;
};

// A navigation we started (key, button, hint) is attributed to the next view
// if it comes within this long; anything else is the visitor scrolling.
const NAV_ATTRIBUTION_MS = 1500;

export default function SkinScroller({
  initialSkins,
  getSkins,
  sessionId,
  landedOnSkin = false,
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
  const [logger] = useState(() => createEventLogger(sessionId));

  const visibleSkin = skins[visibleSkinIndex];
  // For event handlers that outlive a render.
  const visibleRef = useRef({ skin: visibleSkin, index: visibleSkinIndex });
  visibleRef.current = { skin: visibleSkin, index: visibleSkinIndex };

  // View timing. Views are opened and closed imperatively (rather than in
  // effect cleanups) because how a view ends matters: moving on to another
  // skin, or the session ending on it.
  const openViewRef = useRef<OpenView | null>(null);
  const hasOpenedViewRef = useRef(false);

  function openView(skin: ClientSkin, position: number, via: NavMethod) {
    const now = performance.now();
    openViewRef.current = {
      skinMd5: skin.md5,
      position,
      source: skin.source,
      startedAt: now,
      activeMs: 0,
      activeSince: document.visibilityState === "visible" ? now : null,
      webampInteractions: 0,
    };
    logger.log({
      type: "skin_view_start",
      skinMd5: skin.md5,
      position,
      source: skin.source,
      via,
    });
  }

  function closeView(exit: boolean) {
    const view = openViewRef.current;
    if (view == null) return;
    openViewRef.current = null;
    const now = performance.now();
    const activeMs =
      view.activeMs + (view.activeSince == null ? 0 : now - view.activeSince);
    logger.log({
      type: "skin_view_end",
      skinMd5: view.skinMd5,
      position: view.position,
      source: view.source,
      durationMs: Math.round(now - view.startedAt),
      activeMs: Math.round(activeMs),
      exit,
      webampInteractions: view.webampInteractions,
    });
  }

  // How the next view was reached, if we're the ones navigating.
  const pendingNavRef = useRef<{ via: NavMethod; at: number } | null>(null);

  function takeNavMethod(): NavMethod {
    const pending = pendingNavRef.current;
    pendingNavRef.current = null;
    if (
      pending != null &&
      performance.now() - pending.at < NAV_ATTRIBUTION_MS
    ) {
      return pending.via;
    }
    return "scroll";
  }

  useSharedWebamp(
    webampSlot,
    visibleSkin.skinUrl,
    (status) => {
      logger.log({
        type: "audio_status",
        status,
        skinMd5: openViewRef.current?.skinMd5 ?? null,
      });
    },
    (target) => {
      const view = openViewRef.current;
      if (view == null) return;
      view.webampInteractions++;
      if (view.webampInteractions === 1) {
        logger.log({ type: "webamp_interact", skinMd5: view.skinMd5, target });
      }
    }
  );

  // Track if user has ever scrolled to another skin
  useEffect(() => {
    if (visibleSkinIndex > 0) {
      setHasEverScrolled(true);
    }
  }, [visibleSkinIndex]);

  function scrollToSkin(index: number, via: NavMethod) {
    pendingNavRef.current = { via, at: performance.now() };
    containerRef
      ?.querySelector(`[data-skin-index="${index}"]`)
      ?.scrollIntoView({ behavior: "smooth" });
  }

  // Keyboard navigation: J / Down / Space for the next skin, K / Up /
  // Shift+Space for the previous one. Webamp's hotkeys use Up/Down for volume;
  // the feed takes them instead (listening on window in the capture phase so we
  // see them first, and stopping them there). Left/Right still seek in Webamp.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) {
        return;
      }
      let delta: number;
      if (e.key === "j" || e.key === "J" || e.key === "ArrowDown") {
        delta = 1;
      } else if (e.key === "k" || e.key === "K" || e.key === "ArrowUp") {
        delta = -1;
      } else if (e.key === " ") {
        // Space should still press a focused button or link.
        if (target?.closest("button, a, [role='button']")) return;
        delta = e.shiftKey ? -1 : 1;
      } else {
        return;
      }
      e.preventDefault();
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.stopPropagation();
      }
      const index = visibleSkinIndex + delta;
      if (index >= 0 && index < skins.length) scrollToSkin(index, "key");
    }
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", onKeyDown, { capture: true });
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

  // Session lifecycle. Declared before the view effect below so session_start
  // is the session's first event.
  useEffect(() => {
    const pendingEntry = takeFeedEntry();
    logger.log({
      type: "session_start",
      entry: pendingEntry?.entry ?? (landedOnSkin ? "link" : "direct"),
      fromSessionId: pendingEntry?.fromSessionId ?? null,
      ...getVisitContext(),
      skinMd5s: initialSkins.map((skin) => skin.md5),
    });
    // Send right away: this is what records the session and its first skins.
    logger.flush();

    let ended = false;

    function endSession(reason: "pagehide" | "unmount") {
      if (ended) return;
      ended = true;
      closeView(true);
      logger.log({ type: "session_end", reason });
      logger.flush({ unloading: true });
    }

    // Count only time the page is actually visible as dwell, and send what we
    // have whenever it's hidden: mobile browsers often discard backgrounded
    // pages without a pagehide.
    function onVisibilityChange() {
      const view = openViewRef.current;
      const now = performance.now();
      if (document.visibilityState === "hidden") {
        if (view != null && view.activeSince != null) {
          view.activeMs += now - view.activeSince;
          view.activeSince = null;
        }
        logger.log({ type: "page_hidden", skinMd5: view?.skinMd5 ?? null });
        logger.flush({ unloading: true });
      } else {
        if (view != null && view.activeSince == null) {
          view.activeSince = now;
        }
        logger.log({ type: "page_visible", skinMd5: view?.skinMd5 ?? null });
      }
    }

    function onPageHide() {
      endSession("pagehide");
    }

    // Restored from the back/forward cache after a pagehide: pick up where
    // the session left off.
    function onPageShow(e: PageTransitionEvent) {
      if (!e.persisted || !ended) return;
      ended = false;
      logger.log({ type: "session_resume" });
      openView(visibleRef.current.skin, visibleRef.current.index, "resume");
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    addEventListener("pagehide", onPageHide);
    addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      removeEventListener("pagehide", onPageHide);
      removeEventListener("pageshow", onPageShow);
      // Client-side navigation away from the feed.
      endSession("unmount");
    };
  }, [logger]);

  const visibleSkinMd5 = visibleSkin.md5;
  const visibleSkinFileName = visibleSkin.fileName;
  useEffect(() => {
    // We want the URL and title to update as you scroll, but
    // we can't trigger a NextJS navigation since that would remount the
    // component. So, here we replicate the metadata behavior of the route.
    const newUrl = skinPath(visibleSkinMd5, visibleSkinFileName);
    window.document.title = `${visibleSkinFileName} - Winamp Skin Museum`;
    window.history.replaceState(
      { ...window.history.state, as: newUrl, url: newUrl },
      "",
      newUrl
    );

    if (openViewRef.current?.skinMd5 !== visibleSkinMd5) {
      const isFirstView = !hasOpenedViewRef.current;
      hasOpenedViewRef.current = true;
      closeView(false);
      openView(
        visibleRef.current.skin,
        visibleRef.current.index,
        isFirstView ? "initial" : takeNavMethod()
      );
    }
  }, [visibleSkinMd5, visibleSkinFileName]);

  useLayoutEffect(() => {
    if (fetching || exhausted) {
      return;
    }
    if (visibleSkinIndex + 5 < skins.length) {
      return;
    }
    setFetching(true);
    const offset = skins.length;
    logger.log({ type: "skins_fetch_start", offset });
    getSkins(sessionId, offset)
      .then((newSkins) => {
        logger.log({ type: "skins_fetch_success", offset });
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
        logger.log({
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
    logger,
  ]);

  return (
    <EventLoggerContext.Provider value={logger}>
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
              focused={i === visibleSkinIndex}
              webampSlotRef={setWebampSlot}
            />
          );
        })}
      </div>
      <ScrollHintPill
        hasScrolled={hasEverScrolled}
        onShown={() => {
          logger.log({ type: "scroll_hint_shown" });
        }}
        onTap={() => scrollToSkin(visibleSkinIndex + 1, "hint")}
      />
      <FeedNavButtons
        canGoPrevious={visibleSkinIndex > 0}
        canGoNext={visibleSkinIndex < skins.length - 1}
        onPrevious={() => scrollToSkin(visibleSkinIndex - 1, "button")}
        onNext={() => scrollToSkin(visibleSkinIndex + 1, "button")}
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
    </EventLoggerContext.Provider>
  );
}
