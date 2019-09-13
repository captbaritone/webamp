import * as Utils from "./utils";
import { ModernAppState } from "./types";

function findNodeByUid(uid) {
  // TODO: Do some clever caching here.
  return (state: ModernAppState) => {
    return Utils.findInTree(state.modernSkin.xmlTree, node => {
      return node.uid === uid;
    });
  };
}

export function getTop(uid) {
  const findNodeInState = findNodeByUid(uid);
  return (state: ModernAppState) => {
    const node = findNodeInState(state);
    return Number(node.attributes.y) || 0;
  };
}

export function getPathToUid(uid: number) {
  return (state: ModernAppState) => {
    return Utils.findPathToNode(
      state.modernSkin.xmlTree,
      node => node.uid === uid
    );
  };
}

export function getNodeAtPath(path: number[]) {
  return (state: ModernAppState) => {
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
