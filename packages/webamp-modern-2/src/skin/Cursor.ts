// We use a bitmask to encode the possible combinations of cursor attributes as a single number.
// https://en.wikipedia.org/wiki/Mask_(computing)
export const LEFT   = 1 << 1;
export const RIGHT  = 1 << 2;
export const TOP    = 1 << 3;
export const BOTTOM = 1 << 4;
export const MOVE   = 1 << 0 | TOP | LEFT;
export const CURSOR = 1 << 31;