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

// The page before this one in the tab, and this one, as "grid", "feed" or a
// pathname. The feed counts as one page, though its URL changes as you scroll.
let currentPage: string | null = null;
let previousPage: string | null = null;

/** Note the page the tab is on (see BottomMenuBar, which is on every page). */
export function notePathname(pathname: string): void {
  let page = pathname;
  if (pathname === "/") page = "grid";
  if (pathname.startsWith("/skin/")) page = "feed";
  if (page === currentPage) return;
  previousPage = currentPage;
  currentPage = page;
}

export function returnToGrid(
  router: { push(href: string): void },
  via: ViewVia = "back"
): void {
  setNextViewVia(via);
  showScreenshotInsteadOfWebamp();
  if (previousPage === "grid") {
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
