import * as Utils from "./utils";
import { ModernAppState, XmlNode } from "./types";

function findNodeByUid(uid: number) {
  // TODO: Do some clever caching here.
  return (state: ModernAppState): XmlNode => {
    return Utils.findInTree(
      state.modernSkin.xmlTree,
      (node: XmlNode): boolean => {
        return node.uid === uid;
      }
    );
  };
}

export function getTop(uid: number) {
  const findNodeInState = findNodeByUid(uid);
  return (state: ModernAppState): number => {
    const node = findNodeInState(state);
    return Number(node.attributes.y) || 0;
  };
}

export function getPathToUid(uid: number) {
  return (state: ModernAppState): number[] | null => {
    return Utils.findPathToNode(
      state.modernSkin.xmlTree,
      node => node.uid === uid
    );
  };
}

export function getNodeAtPath(path: number[]) {
  return (state: ModernAppState): XmlNode | null => {
    let node = state.modernSkin.xmlTree;
    path.forEach(offset => {
      if (node == null) {
        return null;
      }
      node = node.children[offset];
    });
    return node;
  };
}
