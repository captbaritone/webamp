"use client";

import { useSyncExternalStore } from "react";

// Skins flagged NSFW are blurred until the visitor chooses to see them. Like
// the classic museum, the choice lasts for the visit (this tab), not forever,
// so a shared device doesn't stay opted in.

const STORAGE_KEY = "museum-show-nsfw";

const listeners = new Set<() => void>();
let revealed: boolean | null = null;

function getRevealed(): boolean {
  if (revealed == null) {
    try {
      revealed = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      revealed = false;
    }
  }
  return revealed;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Whether NSFW skins should be shown unblurred. */
export function useShowNsfw(): boolean {
  // Blurred on the server, so nothing NSFW is in the initial HTML.
  return useSyncExternalStore(subscribe, getRevealed, () => false);
}

/** Show NSFW skins for the rest of this visit. */
export function revealNsfw(): void {
  revealed = true;
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Not remembered across reloads; fine.
  }
  listeners.forEach((listener) => listener());
}

// Whether skins opened from the grid are flagged NSFW, for the feed's loading
// screen, which has only the skin's md5 to go on.
const knownNsfw = new Map<string, boolean>();

export function rememberSkinNsfw(md5: string, nsfw: boolean): void {
  knownNsfw.set(md5, nsfw);
}

/** Whether a skin is NSFW, or undefined if we don't know yet. */
export function getKnownNsfw(md5: string): boolean | undefined {
  return knownNsfw.get(md5);
}
