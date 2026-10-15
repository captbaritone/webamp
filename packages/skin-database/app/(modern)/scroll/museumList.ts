// The museum as the grid and the feed show it: the museum's skins in order,
// with random skins (from anywhere in the museum) in some places. Random skins
// are shown regardless of how they rank: the only way anyone sees most of the
// museum, and a fair sample of it to learn from. Searches have none.
//
// The server fills the places (see getMuseumPageSkins), and marks the skins
// it put in random ones (GridSkin's `random`), so the client logs which is
// which without knowing these rules.

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
