import { ModernAppState, MakiTree } from "./types";

export function getMakiTree(state: ModernAppState): MakiTree | null {
  return state.makiTree;
}

export function getSharedMakiTree(state: ModernAppState): MakiTree | null {
  return state.sharedMakiTree;
}

export function getVolume(state: ModernAppState): number {
  return state.volume;
}
