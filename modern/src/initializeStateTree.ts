import { XmlTree } from "./types";
import * as Utils from "./utils";

function mapTree(node, cb) {
  const children = node.children || [];
  return cb({ ...node, children: children.map(child => mapTree(child, cb)) });
}

export default async function initializeStateTree(
  xmlTree: XmlTree
): Promise<XmlTree> {
  return mapTree(xmlTree, node => {
    return { ...node, uid: Utils.getId() };
  });
}
