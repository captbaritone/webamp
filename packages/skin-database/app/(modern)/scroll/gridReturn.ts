"use client";

// Going "back to the grid" from the feed: to the grid you came from, if you
// did (with its search and scroll position, via history), otherwise to a new
// one for the list you're in. Either way it comes back to the skin you were
// on (see listPosition.ts).

import { setNextViewVia } from "./eventLogger";
import type { ViewVia } from "./eventTypes";
import { gridPath } from "./paths";
import { getListPosition } from "./listPosition";
import { showScreenshotInsteadOfWebamp } from "./Webamp";

// A page, as "grid", "feed" or a pathname. The feed counts as one page,
// though its URL changes as you scroll.
function pageOf(pathname: string): string {
  if (pathname === "/") return "grid";
  if (pathname.startsWith("/skin/")) return "feed";
  return pathname;
}

// The page before this one in the tab, and this one, as far as we've seen.
let currentPage: string | null = null;
let previousPage: string | null = null;
const listeners = new Set<() => void>();

/** Note the page the tab is on (see layout.tsx, which is on every page). */
export function notePathname(pathname: string): void {
  const page = pageOf(pathname);
  if (page === currentPage) return;
  previousPage = currentPage;
  currentPage = page;
  listeners.forEach((listener) => listener());
}

// The bits of the Navigation API used to see where Back goes. (TypeScript's
// DOM types don't have it yet.) Its entries are this tab's history on this
// site.
type NavigationApi = EventTarget & {
  currentEntry: { index: number } | null;
  entries(): { url: string | null }[];
};

function navigationApi(): NavigationApi | null {
  return (window as { navigation?: NavigationApi }).navigation ?? null;
}

/**
 * Where Back goes in this tab: the page of the previous history entry, if
 * it's on this site. Null if Back would leave the site or there's nothing to
 * go back to, as when a link to this page opened it.
 */
export function previousPageInTab(): string | null {
  const navigation = navigationApi();
  if (navigation?.currentEntry != null) {
    const { url } =
      navigation.entries()[navigation.currentEntry.index - 1] ?? {};
    return url == null ? null : pageOf(new URL(url).pathname);
  }
  // Without the Navigation API, the page we last saw before this one. After
  // going Back that's the page we came back from, so it's only a guess.
  return previousPage;
}

/** Calls `listener` when previousPageInTab() may have changed. */
export function subscribeToPreviousPage(listener: () => void): () => void {
  listeners.add(listener);
  const navigation = navigationApi();
  // Next updates history from a useInsertionEffect, where updating React state
  // isn't allowed, and the event fires right away, so wait until after.
  const onEntryChange = () => queueMicrotask(listener);
  navigation?.addEventListener("currententrychange", onEntryChange);
  return () => {
    listeners.delete(listener);
    navigation?.removeEventListener("currententrychange", onEntryChange);
  };
}

/** Back to the previous page in the tab, animating into the grid if it's that. */
export function goBack(router: { push(href: string): void }): void {
  if (previousPageInTab() === "grid") {
    returnToGrid(router);
    return;
  }
  setNextViewVia("back");
  history.back();
}

export function returnToGrid(
  router: { push(href: string): void },
  via: ViewVia = "back"
): void {
  setNextViewVia(via);
  showScreenshotInsteadOfWebamp();
  if (previousPageInTab() === "grid") {
    backWithTransition();
  } else {
    router.push(gridPath(getListPosition()?.query ?? ""));
  }
}

const SKIN_PATH = /^\/skin\/([0-9a-f]{32})\//;
// How long to wait for the grid to show the skin's tile, before animating to
// whatever it shows.
const TILE_TIMEOUT_MS = 1000;

// Going back with a view transition, like the one into the feed: the skin in
// view in the feed shrinks back into its tile in the grid. React's
// <ViewTransition> can't do this one: React only animates commits made
// entirely of transitions, and on Back, Next's router updates outside its
// transition (it resolves its state asynchronously; in Next 16 its optimistic
// state is an urgent update instead). So it's done by hand.
function backWithTransition(): void {
  const md5 = location.pathname.match(SKIN_PATH)?.[1];
  const from =
    md5 == null
      ? null
      : document.querySelector<HTMLElement>(
          `[data-skin-md5="${md5}"] .skin-frame > div`
        );
  if (
    from == null ||
    document.startViewTransition == null ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    history.back();
    return;
  }
  const name = `skin-${md5}`;
  from.style.viewTransitionName = name;
  let to: HTMLElement | null = null;
  const transition = document.startViewTransition(async () => {
    from.style.viewTransitionName = "";
    history.back();
    to = await waitFor(() =>
      document.querySelector<HTMLElement>(
        `.grid-tile a[href^="/skin/${md5}/"] img`
      )
    );
    if (to != null) to.style.viewTransitionName = name;
  });
  transition.finished.finally(() => {
    if (to != null) to.style.viewTransitionName = "";
  });
}

// Polls with timers, as animation frames don't run while a view transition
// is waiting for the page to update.
function waitFor<T>(find: () => T | null): Promise<T | null> {
  const deadline = performance.now() + TILE_TIMEOUT_MS;
  return new Promise((resolve) => {
    function check() {
      const found = find();
      if (found != null || performance.now() > deadline) resolve(found);
      else setTimeout(check, 10);
    }
    check();
  });
}
