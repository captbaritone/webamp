// The museum as the grid and the feed show it: the museum's skins in order,
// with random skins (from anywhere in the museum) in some places. Random skins
// are shown regardless of how they rank: the only way anyone sees most of the
// museum, and a fair sample of it to learn from. Searches have none.
//
// The server fills the places (see getMuseumPageSkins), and marks the skins
// it put in random ones (GridSkin's `random`), so the client logs which is
// which without knowing these rules.

// Orders the museum can be browsed in: its own ("top", with the random
// skins below), or every skin but the NSFW ones newest first or in a random
// order (see getSortedMuseumPage). Searches have their own order (best match
// first) and aren't sorted.
export type MuseumSort = "top" | "newest" | "random";
export const MUSEUM_SORTS: readonly MuseumSort[] = ["top", "newest", "random"];

export function parseMuseumSort(value: unknown): MuseumSort {
  return value === "newest" || value === "random" ? value : "top";
}

// A random order is picked by a seed from 1 to this (one less than
// data/skins.ts's RANDOM_ORDER_PRIME), so the server can send any page of it.
export const MAX_RANDOM_SEED = 2147483646;

export function pickRandomSeed(): number {
  return 1 + Math.floor(Math.random() * MAX_RANDOM_SEED);
}

// The museum's top skins come first, as they are.
const MUSEUM_TOP = 10;
// After them, one place in this many is a random skin.
const RANDOM_SKIN_EVERY = 5;

/** Whether the skin at this place in the museum list is a random one. */
export function isRandomPlace(index: number): boolean {
  if (index < MUSEUM_TOP) return false;
  return (index - MUSEUM_TOP) % RANDOM_SKIN_EVERY === RANDOM_SKIN_EVERY - 1;
}

/** The museum position of the (non-random) skin at this place in the list. */
export function museumPosition(index: number): number {
  if (index < MUSEUM_TOP) return index;
  const after = index - MUSEUM_TOP;
  return MUSEUM_TOP + after - Math.floor(after / RANDOM_SKIN_EVERY);
}

/** How long the list is for a museum of this many skins. */
export function museumListLength(museumSkins: number): number {
  if (museumSkins <= MUSEUM_TOP) return museumSkins;
  const after = museumSkins - MUSEUM_TOP;
  // A random skin after each full run of the museum's.
  return museumSkins + Math.floor(after / (RANDOM_SKIN_EVERY - 1));
}
