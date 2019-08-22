import * as Utils from "./utils";

function findNodeByUid(state, uid) {
  return Utils.findInTree(state.xmlTree, node => {
    return node.uid === uid;
  });
}

export function getTop(uid) {
  return state => {
    const node = findNodeByUid(state, uid);
    return Number(node.attributes.y) || 0;
  };
}
