import * as Utils from "./utils";

function findNodeByUid(uid) {
  // TODO: Do some clever caching here.
  return state => {
    return Utils.findInTree(state.xmlTree, node => {
      return node.uid === uid;
    });
  };
}

export function getTop(uid) {
  const findNodeInState = findNodeByUid(uid);
  return state => {
    const node = findNodeInState(state);
    return Number(node.attributes.y) || 0;
  };
}

export function getPathToUid(uid: number) {
  return state => {
    return Utils.findPathToNode(state.xmlTree, node => node.uid === uid);
  };
}

export function getNodeAtPath(path: number[]) {
  return state => {
    let node = state.xmlTree;
    path.forEach(offset => {
      if (node == null) {
        return null;
      }
      node = node.children[offset];
    });
    return node;
  };
}
