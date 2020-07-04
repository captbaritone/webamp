import { ModernAppState, MakiTree } from "./types";

export function getMakiTree(state: ModernAppState): MakiTree | null {
  return state.modernSkin.makiTree;
}

export function getVolume(state: ModernAppState): number {
  return state.modernSkin.volume;
}

export function getRightVUMeter(state: ModernAppState): number {
  return state.modernSkin.rightVUMeter;
}

export function getLeftVUMeter(state: ModernAppState): number {
  return state.modernSkin.leftVUMeter;
}
