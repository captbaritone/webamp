import { ModernAppState, MakiTree } from "./types";

export function getMakiTree(state: ModernAppState): MakiTree | null {
  return state.makiTree;
}
