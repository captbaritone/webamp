"use client";

import { useSyncExternalStore } from "react";
import type { GridSkin } from "./gridSkin";

// Which list of skins (see skinList.ts) the visitor is in, and where. It lives
// here for the visit (this tab, until it's reloaded), not in URLs: the feed's
// URLs are plain permalinks for the skin in view, and to share a list you
// share the grid's URL. So opening the feed from the grid continues through
// the grid's list, and going back to the grid lands on the skin you were on,
// but a link to a skin opened fresh has no list (see followingList).
//
// Kept apart from skinList.ts, which loads skins with server actions, so the
// menu bar and back links (on every page) don't bring those along.

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * The skin the visitor was last on in a list: the one in view in the feed, or
 * the first one on screen in the grid. The feed opens into this list when
 * it's opened on this skin (from the grid, the menu bar, or Forward), and the
 * grid comes back to it.
 */
export type ListPosition = { query: string; index: number; skin: GridSkin };

let position: ListPosition | null = null;

export function setListPosition(next: ListPosition): void {
  if (
    position != null &&
    position.query === next.query &&
    position.index === next.index &&
    position.skin.md5 === next.skin.md5
  ) {
    return;
  }
  position = next;
  listeners.forEach((listener) => listener());
}

export function getListPosition(): ListPosition | null {
  return position;
}

export function useListPosition(): ListPosition | null {
  return useSyncExternalStore(
    subscribe,
    () => position,
    () => null
  );
}

/**
 * The list a feed opened on `md5` shows: the one the visitor was in, if they
 * were on this skin in it, with the skin's place in it. Otherwise (e.g. a
 * shared link) there's no list to go on, so the skin is shown first and
 * followed by the museum from the top (`index` is null). This is the place to
 * pick something better to follow it with one day, like similar skins.
 */
export function followingList(md5: string): {
  query: string;
  index: number | null;
} {
  if (position != null && position.skin.md5 === md5) {
    return { query: position.query, index: position.index };
  }
  return { query: "", index: null };
}
