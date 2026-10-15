"use client";

// Whether the feed was opened from the grid, so going "back to the grid"
// returns to that grid (its search and scroll position) rather than opening a
// fresh one.

let cameFromGrid = false;

export function setCameFromGrid(value: boolean): void {
  cameFromGrid = value;
}

export function returnToGrid(router: { push(href: string): void }): void {
  if (cameFromGrid) {
    history.back();
  } else {
    router.push("/");
  }
}
