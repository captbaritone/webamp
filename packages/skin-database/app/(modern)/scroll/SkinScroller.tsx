"use client";

import {
  useState,
  useLayoutEffect,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import SkinPage from "./SkinPage";
import { FeedNavButtons, ScrollHintPill } from "./FeedNavigation";
import { showScreenshotInsteadOfWebamp, useSharedWebamp } from "./Webamp";
import { skinPath } from "./paths";
import { returnToGrid } from "./gridReturn";
import { backdropColors, corsScreenshotUrl, useSkinTint } from "./skinTint";
import {
  enterView,
  onSessionEnd,
  onSessionResume,
  setFeedSkin,
  useEventLogger,
} from "./eventLogger";
import type { FeedSource, NavMethod, WebampExit } from "./eventTypes";
import { ClientSkin, GridSkin, SkinDetails, toClientSkin } from "./gridSkin";
import {
  getDetails,
  loadDetails,
  loadMuseumRange,
  loadSearch,
  seedDetails,
  useDetailsVersion,
  useMuseum,
  useSearch,
} from "./skinList";
import { followingList, setListPosition } from "./listPosition";
import { skinUrlFromHash } from "../../../legacy-client/src/utils";

type Props = {
  // The skin the page is for: the one the feed opens on.
  skin: GridSkin;
  details: SkinDetails;
};

// A skin in the feed, why it's there, and its place in the list (null for
// the skin the feed opened on, when it isn't in the list).
type FeedItem = {
  skin: GridSkin;
  source: FeedSource;
  listIndex: number | null;
};

// Show this many more of the list once the skin in view is within
// EXTEND_WITHIN of the last (or first) one shown.
const SHOW_MORE = 10;
const EXTEND_WITHIN = 4;
// Skins are added above the one in view (which moves everything) only once
// scrolling has stopped for this long, or this long after the feed opens (so
// its transition from the grid has finished).
const SCROLL_IDLE_MS = 150;
const OPEN_SETTLE_MS = 600;
function feedPages(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>("[data-skin-md5]"));
}

// The page nearest the top of the feed.
function pageInView(container: HTMLElement): HTMLElement | null {
  const top = container.getBoundingClientRect().top;
  let nearest: HTMLElement | null = null;
  let nearestDistance = Infinity;
  for (const page of feedPages(container)) {
    const distance = Math.abs(page.getBoundingClientRect().top - top);
    if (distance < nearestDistance) {
      nearest = page;
      nearestDistance = distance;
    }
  }
  return nearest;
}

// Load readmes for this many skins either side of the one in view.
const DETAILS_BEHIND = 2;
const DETAILS_AHEAD = 5;

// The skin currently in view, for timing how long it holds attention.
type OpenView = {
  skinMd5: string;
  skinUrl: string;
  source: FeedSource;
  listIndex: number | null;
  depth: number;
  // performance.now() when it came into view.
  startedAt: number;
  // Time the page was visible while it was in view, not counting the current
  // stretch (see activeSince).
  activeMs: number;
  // performance.now() when the page last became visible, or null while hidden.
  activeSince: number | null;
  // Completed presses on Webamp while it was in view.
  webampInteractions: number;
  // How long after it came into view Webamp showed it, once it has.
  readyMs: number | null;
};

// A navigation we started (key, button, hint) is attributed to the next view
// if it comes within this long; anything else is the visitor scrolling.
const NAV_ATTRIBUTION_MS = 1500;

/**
 * The feed: one skin at a time, full screen, scrolling through a list (see
 * skinList.ts). Opened from the grid it shows the grid's list from the skin
 * you tapped, in both directions; opened on a link it shows that skin
 * followed by the museum.
 */
export default function SkinScroller({
  skin: linkedSkin,
  details: linkedDetails,
}: Props) {
  const logger = useEventLogger();
  const router = useRouter();

  // Which list this visit to the feed shows, and where the skin it opened on
  // is in it (null: shown first, followed by the list from the top).
  const [{ query, sort, index: anchor }] = useState(() => {
    seedDetails(linkedSkin.md5, linkedDetails);
    return typeof window === "undefined"
      ? { query: "", sort: "top" as const, index: null }
      : followingList(linkedSkin.md5);
  });
  // How events name the list: searches aren't sorted.
  const listSort = query === "" ? sort : null;
  const museum = useMuseum(sort);
  const search = useSearch(query);
  const list = query === "" ? museum.skins : search;
  // How long the list is, once known.
  const listLength = query === "" ? museum.total : search?.length ?? null;
  useEffect(() => {
    // Normally already loaded by the grid we came from.
    if (query !== "") {
      loadSearch(query).catch((error) => console.error(error));
    }
  }, [query]);

  // The part of the list shown, from `first` to `last` (inclusive). It grows
  // in both directions as you get near either end.
  const [shownBefore, setShownBefore] = useState(0);
  const [shownAfter, setShownAfter] = useState(SHOW_MORE);
  const first = anchor == null ? 0 : Math.max(0, anchor - shownBefore);
  const last = (anchor ?? -1) + shownAfter;
  useEffect(() => {
    if (query === "") loadMuseumRange(sort, first, last);
  }, [query, sort, first, last]);

  const items = useMemo(() => {
    // The list's copy of the skin opened on, once loaded, says whether it's
    // a random one.
    const at = (i: number): GridSkin | undefined =>
      i === anchor ? list?.[i] ?? linkedSkin : list?.[i];
    // Only the run of loaded skins around the anchor, so there are no gaps.
    const shown: FeedItem[] = [];
    const item = (i: number): FeedItem => ({
      skin: at(i)!,
      source: at(i)!.random ? "random" : "list",
      listIndex: i,
    });
    for (let i = (anchor ?? 0) - 1; i >= first && at(i) != null; i--) {
      shown.unshift(item(i));
    }
    if (anchor == null) {
      shown.push({ skin: linkedSkin, source: "link", listIndex: null });
    }
    const end = listLength == null ? last : Math.min(last, listLength - 1);
    for (let i = anchor ?? 0; i <= end && at(i) != null; i++) {
      shown.push(item(i));
    }
    // The skin a feed opened on can also be in the list after it; show each
    // skin once.
    const seen = new Set<string>();
    return shown.filter(
      (item) => !seen.has(item.skin.md5) && seen.add(item.skin.md5)
    );
  }, [query, anchor, linkedSkin, list, listLength, first, last]);
  const lastShown = items.at(-1)?.listIndex ?? -1;
  const listEnded =
    query !== "" && listLength != null && lastShown === listLength - 1;

  const [visibleMd5, setVisibleMd5] = useState(linkedSkin.md5);
  const visiblePos = Math.max(
    0,
    items.findIndex((item) => item.skin.md5 === visibleMd5)
  );
  const visibleItem = items[visiblePos];

  // Each skin with its details (once loaded), reused until they change so
  // only the pages that change re-render.
  const detailsVersion = useDetailsVersion();
  const clientSkinsRef = useRef(
    new Map<
      string,
      { skin: GridSkin; details: SkinDetails | undefined; client: ClientSkin }
    >()
  );
  const clientSkins = useMemo(
    () =>
      items.map(({ skin }) => {
        const details =
          getDetails(skin.md5) ??
          (skin.md5 === linkedSkin.md5 ? linkedDetails : undefined);
        const cached = clientSkinsRef.current.get(skin.md5);
        if (cached?.skin === skin && cached.details === details) {
          return cached.client;
        }
        const client = toClientSkin(skin, details);
        clientSkinsRef.current.set(skin.md5, { skin, details, client });
        return client;
      }),
    [items, detailsVersion, linkedSkin, linkedDetails]
  );
  const visibleSkin = clientSkins[visiblePos];

  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  // On touch screens, the skin whose Webamp the visitor is using (see
  // .webamp-shield in scroll.css), and since when. Meanwhile the feed
  // doesn't scroll, and Webamp gets every touch.
  const [usingWebampOn, setUsingWebampOn] = useState<string | null>(null);
  const webampUseRef = useRef<{ md5: string; startedAt: number } | null>(null);
  const startUsingWebamp = useCallback(
    (md5: string) => {
      webampUseRef.current = { md5, startedAt: performance.now() };
      setUsingWebampOn(md5);
      logger.log({ type: "webamp_use_start", skinMd5: md5 });
    },
    [logger]
  );
  const stopUsingWebamp = useCallback(
    (how: WebampExit) => {
      const use = webampUseRef.current;
      if (use == null) return;
      webampUseRef.current = null;
      setUsingWebampOn(null);
      logger.log({
        type: "webamp_use_end",
        skinMd5: use.md5,
        durationMs: Math.round(performance.now() - use.startedAt),
        how,
      });
    },
    [logger]
  );
  // Tapping anywhere but the skin (or Webamp's menus, which it puts at the
  // end of the page) stops using it. The tap still does whatever it does.
  useEffect(() => {
    if (usingWebampOn == null) return;
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Element | null;
      if (
        target?.closest(
          ".using-webamp .skin-stage, #webamp-context-menu, .webamp-done"
        )
      ) {
        return;
      }
      stopUsingWebamp("outside");
    }
    document.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, {
        capture: true,
      });
  }, [usingWebampOn, stopUsingWebamp]);
  const [webampSlot, setWebampSlot] = useState<HTMLDivElement | null>(null);

  // The backdrop is tinted with the visible skin's colors, and morphs to the
  // next skin's as you scroll. Until a skin's tint is known it keeps the
  // previous one.
  const tint = useSkinTint(corsScreenshotUrl(visibleSkin.screenshotUrl));
  const backdrop = tint == null ? null : backdropColors(tint);
  // For event handlers that outlive a render.
  const visibleRef = useRef(visibleItem);
  visibleRef.current = visibleItem;

  // View timing. Views are opened and closed imperatively (rather than in
  // effect cleanups) because how a view ends matters: moving on to another
  // skin, leaving the feed, or the session ending on it.
  const openViewRef = useRef<OpenView | null>(null);
  const depthRef = useRef(0);

  function openView(item: FeedItem, via: NavMethod) {
    const now = performance.now();
    const view: OpenView = {
      skinMd5: item.skin.md5,
      skinUrl: skinUrlFromHash(item.skin.md5),
      source: item.source,
      listIndex: item.listIndex,
      depth: depthRef.current++,
      startedAt: now,
      activeMs: 0,
      activeSince: document.visibilityState === "visible" ? now : null,
      webampInteractions: 0,
      // Back from the back/forward cache, it's still showing.
      readyMs: via === "resume" ? 0 : null,
    };
    openViewRef.current = view;
    logger.log({
      type: "skin_view_start",
      skinMd5: view.skinMd5,
      source: view.source,
      query: query || null,
      sort: listSort,
      listIndex: view.listIndex,
      depth: view.depth,
      via,
    });
  }

  function closeView(endedBy: "next_skin" | "left_feed" | "session_end") {
    const view = openViewRef.current;
    if (view == null) return;
    openViewRef.current = null;
    const now = performance.now();
    const activeMs =
      view.activeMs + (view.activeSince == null ? 0 : now - view.activeSince);
    logger.log({
      type: "skin_view_end",
      skinMd5: view.skinMd5,
      source: view.source,
      query: query || null,
      sort: listSort,
      listIndex: view.listIndex,
      depth: view.depth,
      durationMs: Math.round(now - view.startedAt),
      activeMs: Math.round(activeMs),
      endedBy,
      webampInteractions: view.webampInteractions,
      readyMs: view.readyMs,
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
    },
    (skinUrl) => {
      const view = openViewRef.current;
      if (view?.skinUrl === skinUrl && view.readyMs == null) {
        view.readyMs = Math.round(performance.now() - view.startedAt);
      }
    },
    (skinUrl, error) => {
      const view = openViewRef.current;
      if (view?.skinUrl !== skinUrl) return;
      logger.log({
        type: "skin_load_failure",
        skinMd5: view.skinMd5,
        errorMessage: String((error as Error)?.message ?? error),
      });
    }
  );

  // Leaving with the browser's Back (or Forward) button: as with the back
  // arrow, have the screenshot rather than Webamp make the transition. This
  // has to happen before Next.js renders the grid, which it does before any
  // popstate listener runs, so this uses the Navigation API's navigate event,
  // which comes first. (Without it, Back crossfades instead.)
  useEffect(() => {
    const navigation = (window as { navigation?: EventTarget }).navigation;
    if (navigation == null) return;
    function onNavigate(e: Event) {
      if (
        (e as Event & { navigationType: string }).navigationType === "traverse"
      ) {
        showScreenshotInsteadOfWebamp();
      }
    }
    navigation.addEventListener("navigate", onNavigate);
    return () => navigation.removeEventListener("navigate", onNavigate);
  }, []);

  // The skin we're scrolling to, until scrolling stops, so pressing again
  // mid-scroll goes one further.
  const scrollTargetRef = useRef<string | null>(null);

  // Scroll `delta` skins from the one in view. Counted from the pages where
  // they are, not visibleMd5: that's only updated as pages cross the middle,
  // so it can be off by one after an interrupted scroll (e.g. by skins being
  // added below), and moving to the skin already in view would then never
  // scroll to correct it.
  function scrollBySkins(delta: number, via: NavMethod) {
    if (containerRef == null) return;
    stopUsingWebamp("moved_on");
    const pages = feedPages(containerRef);
    let from = pages.findIndex(
      (page) => page.dataset.skinMd5 === scrollTargetRef.current
    );
    if (from === -1) from = pages.indexOf(pageInView(containerRef)!);
    const target = pages[from + delta];
    if (target == null) return;
    scrollTargetRef.current = target.dataset.skinMd5!;
    pendingNavRef.current = { via, at: performance.now() };
    target.scrollIntoView({ behavior: "smooth" });
  }

  // Keyboard navigation: J / Down / Space for the next skin, K / Up /
  // Shift+Space for the previous one, Escape back to the grid. Webamp's
  // hotkeys use Up/Down for volume; the feed takes them instead (listening on
  // window in the capture phase so we see them first, and stopping them
  // there). Left/Right still seek in Webamp.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) {
        return;
      }
      if (e.key === "Escape" && webampUseRef.current != null) {
        e.preventDefault();
        stopUsingWebamp("escape");
        return;
      }
      if (e.key === "Escape") {
        // An expanded readme handles Escape itself (it collapses).
        if (document.querySelector(".skin-readme.expanded") != null) return;
        e.preventDefault();
        returnToGrid(router);
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
      scrollBySkins(delta, "key");
    }
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [containerRef]);

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
            const md5 = (entry.target as HTMLElement).dataset.skinMd5;
            if (md5 != null) setVisibleMd5(md5);
          }
        });
      },
      {
        root: containerRef,
        threshold: 0.5, // Trigger when 50% of the element is visible
      }
    );

    containerRef
      .querySelectorAll("[data-skin-md5]")
      .forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, [containerRef, items]);

  // Keep the skin in view where it is when skins are added above it. They're
  // only added while the feed is at rest on a skin, so that's where it goes.
  // (Set outright, rather than moved by what was added: some browsers already
  // re-snap to the same skin themselves.)
  const shownAboveRef = useRef({ md5: visibleMd5, count: visiblePos });
  useLayoutEffect(() => {
    const previous = shownAboveRef.current;
    shownAboveRef.current = { md5: visibleMd5, count: visiblePos };
    if (
      containerRef == null ||
      previous.md5 !== visibleMd5 ||
      previous.count === visiblePos
    ) {
      return;
    }
    const page = containerRef.querySelector<HTMLElement>(
      `[data-skin-md5="${visibleMd5}"]`
    );
    if (page != null) {
      containerRef.scrollTop +=
        page.getBoundingClientRect().top -
        containerRef.getBoundingClientRect().top;
    }
  });

  // Once scrolling stops: make sure visibleMd5 is the skin actually in view
  // (the observer can miss one), and near the top of what's shown, show more
  // of the list above.
  const onScrollIdleRef = useRef(() => {});
  onScrollIdleRef.current = () => {
    scrollTargetRef.current = null;
    const md5 = containerRef && pageInView(containerRef)?.dataset.skinMd5;
    if (md5 != null) setVisibleMd5(md5);
    if (first > 0 && visiblePos < EXTEND_WITHIN) {
      setShownBefore((n) => n + SHOW_MORE);
    }
  };
  useEffect(() => {
    if (containerRef == null) return;
    let timer = setTimeout(() => onScrollIdleRef.current(), OPEN_SETTLE_MS);
    function onScroll() {
      clearTimeout(timer);
      timer = setTimeout(() => onScrollIdleRef.current(), SCROLL_IDLE_MS);
    }
    containerRef.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      containerRef.removeEventListener("scroll", onScroll);
    };
  }, [containerRef]);

  // Near the bottom of what's shown, show more of the list below (once the
  // ones already asked for have loaded).
  useEffect(() => {
    if (items.length - 1 - visiblePos >= EXTEND_WITHIN) return;
    if (lastShown < last) return;
    if (listLength != null && last >= listLength - 1) return;
    setShownAfter((n) => n + SHOW_MORE);
  }, [items.length, visiblePos, lastShown, last, listLength]);

  // Readmes for the skins around the one in view.
  useEffect(() => {
    const md5s = items
      .slice(
        Math.max(0, visiblePos - DETAILS_BEHIND),
        visiblePos + DETAILS_AHEAD + 1
      )
      .map((item) => item.skin.md5)
      .filter((md5) => getDetails(md5) == null);
    if (md5s.length === 0) return;
    loadDetails(md5s).catch((error) => {
      logger.log({
        type: "details_fetch_failure",
        errorMessage: String(error?.message ?? error),
      });
    });
  }, [items, visiblePos, logger]);

  // This visit to the feed. Declared before the view effect below so its
  // arrival is logged before its first view. How it was reached is taken once
  // per visit, not per run of the effect (which runs twice in development's
  // Strict Mode).
  const arrivedViaRef = useRef<NavMethod | null>(null);
  useEffect(() => {
    if (arrivedViaRef.current == null) {
      arrivedViaRef.current = enterView("feed", {
        query: query || null,
        sort: listSort,
        skinMd5: linkedSkin.md5,
        listIndex: anchor,
      });
    }

    // Count only time the page is actually visible as dwell.
    function onVisibilityChange() {
      const view = openViewRef.current;
      if (view == null) return;
      const now = performance.now();
      if (document.visibilityState === "hidden") {
        if (view.activeSince != null) {
          view.activeMs += now - view.activeSince;
          view.activeSince = null;
        }
      } else if (view.activeSince == null) {
        view.activeSince = now;
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    const stopEnd = onSessionEnd(() => closeView("session_end"));
    // Restored from the back/forward cache: pick up where we left off.
    const stopResume = onSessionResume(() =>
      openView(visibleRef.current, "resume")
    );
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stopEnd();
      stopResume();
      // Client-side navigation away from the feed.
      stopUsingWebamp("moved_on");
      closeView("left_feed");
      setFeedSkin(null);
    };
  }, [logger]);

  const visibleFileName = visibleItem.skin.fileName;
  const hasOpenedViewRef = useRef(false);
  useEffect(() => {
    // We want the URL and title to update as you scroll, but
    // we can't trigger a NextJS navigation since that would remount the
    // component. So, here we replicate the metadata behavior of the route.
    const newUrl = skinPath(visibleMd5, visibleFileName);
    window.document.title = `${visibleFileName} - Winamp Skin Museum`;
    window.history.replaceState(
      { ...window.history.state, as: newUrl, url: newUrl },
      "",
      newUrl
    );
    setFeedSkin(visibleMd5);
    const item = visibleRef.current;
    if (item.listIndex != null) {
      setListPosition({
        query,
        sort,
        index: item.listIndex,
        skin: item.skin,
      });
    }

    if (openViewRef.current?.skinMd5 !== visibleMd5) {
      const isFirstView = !hasOpenedViewRef.current;
      hasOpenedViewRef.current = true;
      closeView("next_skin");
      openView(
        item,
        isFirstView ? arrivedViaRef.current ?? "link" : takeNavMethod()
      );
    }
  }, [visibleMd5, visibleFileName]);

  return (
    <>
      <div
        className="feed-backdrop"
        aria-hidden
        style={
          backdrop == null
            ? undefined
            : ({
                // The spotlight's center, and its color halfway to the edge.
                "--feed-glow": backdrop.glow,
                "--feed-glow-mid": backdrop.glowMid,
              } as React.CSSProperties)
        }
      />
      <div
        ref={setContainerRef}
        style={{
          // Full width so the wheel scrolls from anywhere on desktop, and so
          // the action icons can sit beside the skin. Each page constrains its
          // own content to MOBILE_MAX_WIDTH.
          height: "100dvh",
          // Not while the visitor is using Webamp.
          overflowY: usingWebampOn == null ? "scroll" : "hidden",
          scrollSnapType: "y mandatory",
          // We keep the skin in view in place ourselves when skins are added
          // above it.
          overflowAnchor: "none",
          WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
        }}
        className="hide-scrollbar"
      >
        {clientSkins.map((skin, i) => (
          <SkinPage
            key={skin.md5}
            skin={skin}
            focused={i === visiblePos}
            webampSlotRef={setWebampSlot}
            usingWebamp={skin.md5 === usingWebampOn}
            onUseWebamp={startUsingWebamp}
            onStopUsingWebamp={stopUsingWebamp}
          />
        ))}
        {listEnded && (
          <div className="skin-page feed-end">
            <p>That&apos;s every skin for &ldquo;{query}&rdquo;.</p>
            <button
              className="feed-end-button"
              onClick={() => returnToGrid(router)}
            >
              Back to the results
            </button>
          </div>
        )}
      </div>
      <ScrollHintPill
        // Once done, the hint is remembered as done (see HintPill), so
        // scrolling back to the first skin doesn't bring it back.
        hasScrolled={visibleMd5 !== linkedSkin.md5}
        onShown={() => {
          logger.log({ type: "scroll_hint_shown" });
        }}
        onTap={() => scrollBySkins(1, "hint")}
      />
      <FeedNavButtons
        canGoPrevious={visiblePos > 0}
        canGoNext={visiblePos < items.length - 1}
        onPrevious={() => scrollBySkins(-1, "button")}
        onNext={() => scrollBySkins(1, "button")}
      />
      {/*
        Fades out whatever runs off the bottom of the page (usually the readme)
        above the floating bar. Fixed, so it stays put as you scroll between
        skins.
      */}
      <div className="feed-bottom-fade" aria-hidden />
      <div className="feed-top-shadow" aria-hidden />
    </>
  );
}
