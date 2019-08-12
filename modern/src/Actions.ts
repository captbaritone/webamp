import { MakiTree, ModernAction } from "./types";

export function setMakiTree(makiTree: MakiTree): ModernAction {
  return { type: "SET_MAKI_TREE", makiTree };
}
