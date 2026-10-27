"use client";

import { useSyncExternalStore } from "react";
import { getMuseumPageSkins, getSkinDetails } from "./getMuseumPageSkins";
import { GridSkin, SkinDetails, toGridSkin } from "./gridSkin";
import { pickRandomSeed, type MuseumSort } from "./museumList";
import { parseSearch } from "./searchQuery";
import {
  algoliaSearch,
  graphqlSearch,
  USE_ALGOLIA,
} from "../../../legacy-client/src/algolia";

// The lists of skins that the grid and the feed are two views of: the museum
// (every skin, in museum order with random ones mixed in, or newest first, or
// in a random order: see museumList.ts) and searches. A list is named by its
// query ("" is the museum) and, for the museum, its order.
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

// The museum, in each order it's browsed in (see museumList.ts)

type Museum = {
  // Sparse, by position: pages are written at their offset as they arrive.
  skins: ReadonlyArray<GridSkin | undefined>;
  // How many skins it has, once known.
  total: number | null;
};

type MuseumList = {
  // Replaced, never mutated, so it can be a snapshot.
  museum: Museum;
  loadedPages: Set<number>;
  inFlightPages: Set<number>;
};

// By museumKey.
const museumLists = new Map<string, MuseumList>();

// The random order for this visit, once there is one: picked by the server
// for a page it rendered in random order, or else here. So the order stays
// put as you go between the grid and the feed, and back.
let randomSeed: number | null = null;

export function getRandomSeed(): number {
  randomSeed ??= pickRandomSeed();
  return randomSeed;
}

/** Use the server's random order, unless we already have one. */
export function adoptRandomSeed(seed: number): void {
  if (isServer) return;
  randomSeed ??= seed;
}

// Names a museum list. Every random order is a list of its own.
function museumKey(sort: MuseumSort, seed: number | null): string {
  return sort === "random" ? `random:${seed}` : sort;
}

function museumList(key: string): MuseumList {
  let list = museumLists.get(key);
  if (list == null) {
    list = {
      museum: { skins: [], total: null },
      loadedPages: new Set(),
      inFlightPages: new Set(),
    };
    museumLists.set(key, list);
  }
  return list;
}

function storeMuseumPage(
  list: MuseumList,
  offset: number,
  skins: GridSkin[]
): void {
  const next = list.museum.skins.slice();
  skins.forEach((skin, i) => {
    next[offset + i] = skin;
  });
  list.museum = { ...list.museum, skins: next };
  list.loadedPages.add(offset / MUSEUM_PAGE_SIZE);
}

/**
 * Start with a page the server rendered, of the museum in this order (for a
 * random order, the one the server picked: if it isn't this visit's, the
 * page goes unused). Doesn't notify (call it while rendering).
 */
export function seedMuseum(
  sort: MuseumSort,
  seed: number | null,
  offset: number,
  skins: GridSkin[],
  total: number
): void {
  if (isServer) return;
  const list = museumList(
    museumKey(sort, sort === "random" ? seed ?? getRandomSeed() : null)
  );
  if (list.museum.total !== total) list.museum = { ...list.museum, total };
  if (skins.length > 0 && !list.loadedPages.has(offset / MUSEUM_PAGE_SIZE)) {
    storeMuseumPage(list, offset, skins);
  }
}

async function loadMuseumPage(sort: MuseumSort, page: number): Promise<void> {
  const seed = sort === "random" ? getRandomSeed() : null;
  const list = museumList(museumKey(sort, seed));
  if (list.loadedPages.has(page) || list.inFlightPages.has(page)) return;
  list.inFlightPages.add(page);
  try {
    const offset = page * MUSEUM_PAGE_SIZE;
    const skins = await getMuseumPageSkins(
      offset,
      MUSEUM_PAGE_SIZE,
      sort,
      seed
    );
    storeMuseumPage(list, offset, skins);
    if (skins.length < MUSEUM_PAGE_SIZE && list.museum.total == null) {
      list.museum = { ...list.museum, total: offset + skins.length };
    }
    notify();
  } catch (error) {
    // Left unloaded, so it's tried again next time it's asked for.
    console.error("Failed to load skins:", error);
  } finally {
    list.inFlightPages.delete(page);
  }
}

/** Load the museum's skins in this order from `first` to `last` (inclusive). */
export function loadMuseumRange(
  sort: MuseumSort,
  first: number,
  last: number
): void {
  const { total } = getMuseum(sort);
  const end = total == null ? last : Math.min(last, total - 1);
  for (
    let page = Math.floor(Math.max(0, first) / MUSEUM_PAGE_SIZE);
    page <= Math.floor(end / MUSEUM_PAGE_SIZE);
    page++
  ) {
    loadMuseumPage(sort, page);
  }
}

function getMuseum(sort: MuseumSort): Museum {
  const seed = sort === "random" ? getRandomSeed() : null;
  return museumList(museumKey(sort, seed)).museum;
}

const emptyMuseum: Museum = { skins: [], total: null };

export function useMuseum(sort: MuseumSort): Museum {
  return useSyncExternalStore(
    subscribe,
    () => getMuseum(sort),
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

// Same backends as the legacy museum search, with the same has:/filter:
// syntax (see searchQuery.ts). If Algolia is enabled but failing (e.g. out
// of quota) fall back to our own SQLite FTS search, which applies only the
// NSFW filter and ignores the rest.
async function runSearch(query: string): Promise<{
  hits: Array<{ objectID: string; fileName: string; nsfw?: any }>;
}> {
  const { text, options } = parseSearch(query);
  if (USE_ALGOLIA) {
    try {
      return await algoliaSearch(text, options);
    } catch (error) {
      console.warn("Algolia search failed, falling back to SQLite", error);
    }
  }
  return graphqlSearch(text, options);
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
