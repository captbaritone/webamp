// TODO: Type the state tree
export type MakiTree = any;

export type ModernAppState = {
  makiTree: MakiTree | null;
  volume: number;
};
export type ModernAction =
  | { type: "SET_MAKI_TREE"; makiTree: MakiTree }
  | { type: "SET_VOLUME"; volume: number };

export type ModernDispatch = (action: ModernAction) => void;

export type ModernStore = {
  getState(): ModernAppState;
  subscribe(cb: () => void): () => void;
  dispatch: ModernDispatch;
};
