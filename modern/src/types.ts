// TODO: Type the state tree
export type MakiTree = any;

export type XmlNode = {
  children: XmlNode[];
};

export type XmlTree = XmlNode;

export type ModernAppState = {
  makiTree: MakiTree | null;
  xmlTree: XmlTree | null;
  volume: number;
};
export type ModernAction =
  | { type: "SET_MAKI_TREE"; makiTree: MakiTree }
  | { type: "SET_XML_TREE"; xmlTree: XmlTree }
  | { type: "SET_VOLUME"; volume: number };

export type ModernDispatch = (action: ModernAction) => void;

export type ModernStore = {
  getState(): ModernAppState;
  subscribe(cb: () => void): () => void;
  dispatch: ModernDispatch;
};
