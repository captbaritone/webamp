"use client";

import { useSyncExternalStore } from "react";
import { getMuseumPageSkins, getSkinDetails } from "./getMuseumPageSkins";
import { GridSkin, SkinDetails, toGridSkin } from "./gridSkin";
import {
  algoliaSearch,
  graphqlSearch,
  USE_ALGOLIA,
} from "../../../legacy-client/src/algolia";

// The lists of skins that the grid and the feed are two views of: the museum
// (every skin, in museum order, with random ones mixed in: see
// museumList.ts) and searches. A list is named by its query;
// "" is the museum.
//
// Which list you're in, and where, is kept in listPosition.ts.
//
// Everything is kept in module state, so it outlives the views and switching
// between them never refetches. Nothing is stored during the server's render.

const isServer = typeof window === "undefined";

export const MUSEUM_PAGE_SIZE = 50;
const MAX_CACHED_SEARCHES = 20;

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

// The museum

type Museum = {
  // Sparse, by position: pages are written at their offset as they arrive.
  skins: ReadonlyArray<GridSkin | undefined>;
  // How many skins it has, once known.
  total: number | null;
};

// Replaced, never mutated, so it can be a snapshot.
let museum: Museum = { skins: [], total: null };
const loadedPages = new Set<number>();
const inFlightPages = new Set<number>();

function storeMuseumPage(offset: number, skins: GridSkin[]): void {
  const next = museum.skins.slice();
  skins.forEach((skin, i) => {
    next[offset + i] = skin;
  });
  museum = { ...museum, skins: next };
  loadedPages.add(offset / MUSEUM_PAGE_SIZE);
}

/** Start with a page the server rendered. Doesn't notify (call it while rendering). */
export function seedMuseum(
  offset: number,
  skins: GridSkin[],
  total: number
): void {
  if (isServer) return;
  if (museum.total !== total) museum = { ...museum, total };
  if (skins.length > 0 && !loadedPages.has(offset / MUSEUM_PAGE_SIZE)) {
    storeMuseumPage(offset, skins);
  }
}

async function loadMuseumPage(page: number): Promise<void> {
  if (loadedPages.has(page) || inFlightPages.has(page)) return;
  inFlightPages.add(page);
  try {
    const offset = page * MUSEUM_PAGE_SIZE;
    const skins = await getMuseumPageSkins(offset, MUSEUM_PAGE_SIZE);
    storeMuseumPage(offset, skins);
    if (skins.length < MUSEUM_PAGE_SIZE && museum.total == null) {
      museum = { ...museum, total: offset + skins.length };
    }
    notify();
  } catch (error) {
    // Left unloaded, so it's tried again next time it's asked for.
    console.error("Failed to load skins:", error);
  } finally {
    inFlightPages.delete(page);
  }
}

/** Load the museum's skins from `first` to `last` (inclusive). */
export function loadMuseumRange(first: number, last: number): void {
  const end = museum.total == null ? last : Math.min(last, museum.total - 1);
  for (
    let page = Math.floor(Math.max(0, first) / MUSEUM_PAGE_SIZE);
    page <= Math.floor(end / MUSEUM_PAGE_SIZE);
    page++
  ) {
    loadMuseumPage(page);
  }
}

const emptyMuseum: Museum = { skins: [], total: null };

export function useMuseum(): Museum {
  return useSyncExternalStore(
    subscribe,
    () => museum,
    () => emptyMuseum
  );
}

// Searches

// Recent searches' results, most recent last.
const searches = new Map<string, GridSkin[]>();
const inFlightSearches = new Map<string, Promise<GridSkin[]>>();

export function getCachedSearch(query: string): GridSkin[] | undefined {
  return searches.get(query);
}

/** Remember a search's results. Doesn't notify (call it while rendering). */
export function cacheSearch(query: string, skins: GridSkin[]): void {
  if (isServer) return;
  searches.delete(query);
  searches.set(query, skins);
  if (searches.size > MAX_CACHED_SEARCHES) {
    searches.delete(searches.keys().next().value!);
  }
}

// Same backends as the legacy museum search. If Algolia is enabled but
// failing (e.g. out of quota) fall back to our own SQLite FTS search.
async function runSearch(query: string): Promise<{
  hits: Array<{ objectID: string; fileName: string; nsfw?: any }>;
}> {
  if (USE_ALGOLIA) {
    try {
      return await algoliaSearch(query);
    } catch (error) {
      console.warn("Algolia search failed, falling back to SQLite", error);
    }
  }
  return graphqlSearch(query);
}

/** A search's results, from the cache if we have them. */
export function loadSearch(query: string): Promise<GridSkin[]> {
  const cached = searches.get(query);
  if (cached != null) return Promise.resolve(cached);
  let pending = inFlightSearches.get(query);
  if (pending == null) {
    pending = runSearch(query)
      .then((result) => {
        const skins = result.hits.map((hit) =>
          toGridSkin(
            hit.objectID,
            hit.fileName,
            // Some records still have float scores rather than booleans.
            hit.nsfw === true || hit.nsfw === 1
          )
        );
        cacheSearch(query, skins);
        notify();
        return skins;
      })
      .finally(() => inFlightSearches.delete(query));
    inFlightSearches.set(query, pending);
  }
  return pending;
}

export function useSearch(query: string): GridSkin[] | undefined {
  return useSyncExternalStore(
    subscribe,
    () => searches.get(query),
    () => undefined
  );
}

// The feed's details for each skin

const details = new Map<string, SkinDetails>();
const inFlightDetails = new Set<string>();
// Bumped on every change, as the snapshot.
let detailsVersion = 0;

/** Start with details the server rendered. Doesn't notify (call it while rendering). */
export function seedDetails(md5: string, skinDetails: SkinDetails): void {
  if (isServer || details.has(md5)) return;
  details.set(md5, skinDetails);
  detailsVersion++;
}

export function getDetails(md5: string): SkinDetails | undefined {
  return details.get(md5);
}

/** Load the details of whichever of these skins we don't have yet. */
export async function loadDetails(md5s: string[]): Promise<void> {
  const missing = md5s.filter(
    (md5) => !details.has(md5) && !inFlightDetails.has(md5)
  );
  if (missing.length === 0) return;
  missing.forEach((md5) => inFlightDetails.add(md5));
  try {
    const loaded = await getSkinDetails(missing);
    for (const [md5, skinDetails] of Object.entries(loaded)) {
      details.set(md5, skinDetails);
    }
    detailsVersion++;
    notify();
  } finally {
    missing.forEach((md5) => inFlightDetails.delete(md5));
  }
}

/** Re-renders when any skin's details arrive; read them with getDetails. */
export function useDetailsVersion(): number {
  return useSyncExternalStore(
    subscribe,
    () => detailsVersion,
    () => 0
  );
}
