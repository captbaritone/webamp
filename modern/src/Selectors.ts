import { ModernAppState, MakiTree } from "./types";

export function getMakiTree(state: ModernAppState): MakiTree | null {
  return state.makiTree;
}

export function getVolume(state: ModernAppState): number {
  return state.volume;
}

export function getRightVUMeter(state: ModernAppState): number {
  return state.rightVUMeter;
}

export function getLeftVUMeter(state: ModernAppState): number {
  return state.leftVUMeter;
}
