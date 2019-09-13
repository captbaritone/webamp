// TODO: Type the state tree
export type MakiTree = any;

export type XmlNode = {
  children: XmlNode[];
  attributes: Object;
  name: string;
};

export interface ResolvedXmlNode extends XmlNode {
  uid: number;
}

// What is a tree, but a single root node?
export type XmlTree = XmlNode;

export type ModernSkinState = {
  makiTree: MakiTree | null;
  xmlTree: XmlTree | null;
  volume: number;
  rightVUMeter: number;
  leftVUMeter: number;
  skinLoaded: boolean;
};

export type ModernAppState = {
  modernSkin: ModernSkinState;
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
