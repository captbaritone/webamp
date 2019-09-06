import { ModernAppState, MakiTree } from "./types";

export function getMakiTree(state: ModernAppState): MakiTree | null {
  return state.makiTree;
}

export function getVolume(state: ModernAppState): number {
  return state.volume;
}

export function getMousePosition(state: ModernAppState): Object {
  return { x: state.mousePosX, y: state.mousePosY };
}
