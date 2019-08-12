// TODO: Type the state tree
export type MakiTree = any;

export type ModernAppState = {
  makiTree: MakiTree | null;
};
export type ModernAction = { type: "SET_MAKI_TREE"; makiTree: MakiTree };
