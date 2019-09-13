import JSZip from "jszip";
import { xml2js } from "xml-js";
import { XmlNode } from "./types";

let nextId = 0;
export function getId() {
  return nextId++;
}

// Depth-first tree map
export function mapTree(node, cb) {
  const children = node.children || [];
  return cb({ ...node, children: children.map(child => mapTree(child, cb)) });
}

export function isPromise(obj) {
  return obj && typeof obj.then === "function";
}

// Convert windows filename slashes to forward slashes
function fixFilenameSlashes(filename) {
  return filename.replace(/\\/g, "/");
}

export function getCaseInsensitveFile(
  zip: JSZip,
  filename: string
): JSZip.JSZipObject {
  // TODO: Escape `file` for rejex characters
  return zip.file(new RegExp(fixFilenameSlashes(filename), "i"))[0];
}

// Read a
export async function readXml(zip: JSZip, filepath: string): Promise<XmlNode> {
  const file = await getCaseInsensitveFile(zip, filepath);
  if (file == null) {
    return null;
  }
  const text = await file.async("text");
  // @ts-ignore Due to the way it's config object interface works, xml2js is
  // bascially impossible to type. For example, you can specify what key to use
  // for `elements`. We choose `children` but the types assume the default
  // `elements`.
  return xml2js(text, { compact: false, elementsKey: "children" });
}

export async function readUint8array(
  zip: JSZip,
  filepath: string
): Promise<Uint8Array> {
  const file = await getCaseInsensitveFile(zip, filepath);
  if (file == null) {
    return null;
  }
  return file.async("uint8array");
}

// I any of the values in `arr` are themselves arrays, interpolate the nested
// array into the top level array.
function flatten<T>(arr: Array<T | Array<T>>): Array<T> {
  const newArr = [];
  arr.forEach(item => {
    if (Array.isArray(item)) {
      newArr.push(...item);
    } else {
      newArr.push(item);
    }
  });
  return newArr;
}

// Map an async function over an array. If the value returned from the mapper is
// an array, it recursively maps the function over that array's values, and then
// interpoates the resulting flat array into the top level array of results.
export async function asyncFlatMap<T, R>(
  arr: Array<T>,
  mapper: (value: T) => R | Array<T>
): Promise<Array<R>> {
  const mapped = await Promise.all(arr.map(mapper));
  const childPromises = mapped.map(async item => {
    if (Array.isArray(item)) {
      return asyncFlatMap(item, mapper);
    }
    return item;
  });
  return flatten(await Promise.all(childPromises));
}

// Apply a mapper function to all nodes in a tree using `asyncFlatMap`. This
// allows mapper to conditionally return either a single node, or an array of
// nodes.
//
// The tree should have the form of objects nodes, each of which may
// have a property `children` which is an array of nodes.
//
// Note: The root node will not be transformed by the mapper, since the mapper
// could potentially return multiple nodes.
export async function asyncTreeFlatMap(node, mapper) {
  const { children } = node;
  if (children == null) {
    return node;
  }

  const mappedChildren = await asyncFlatMap(children, mapper);

  const recursedChildren = await Promise.all(
    mappedChildren.map(child => asyncTreeFlatMap(child, mapper))
  );

  return { ...node, children: recursedChildren };
}

// Given an XML file and a zip which it came from, replace all `<inline />` elements
// with the contents of the file to be included.
export async function inlineIncludes(
  xml: XmlNode,
  zip: JSZip
): Promise<XmlNode> {
  return asyncTreeFlatMap(xml, async node => {
    if (node.name !== "include") {
      return node;
    }
    // TODO: Normalize file names so that they hit the same cache
    const includedFile = await readXml(zip, node.attributes.file);
    if (includedFile == null) {
      console.warn(
        `Tried to include a file that could not be found: ${
          node.attributes.file
        }`
      );
      return [];
    }
    return includedFile.children;
  });
}

export function unimplementedWarning(name: string): void {
  console.warn(`Executing unimplemented MAKI function: ${name}`);
}

// Bredth-first search in a tree that returns the path to the node
export function findPathToNode<T extends { children: T[] }>(
  node: T,
  predicate: (candidate: T) => boolean
): number[] {
  if (predicate(node)) {
    return [];
  }
  const children = node.children || [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    const found = findPathToNode(child, predicate);
    if (found != null) {
      return [i, ...found];
    }
  }
  return null;
}

// Bredth-first search in a tree
export function findInTree<T extends { children: T[] }>(
  node: T,
  predicate
): T | null {
  if (predicate(node)) {
    return node;
  }
  const children = node.children || [];
  for (const child of children) {
    const found = findInTree(child, predicate);
    if (found != null) {
      return found;
    }
  }
  return null;
}

export function findParent<T extends { parent: T | null }>(
  node: T,
  predicate: (node: T) => boolean
): T | null {
  let n = node;
  while (n.parent) {
    n = n.parent;
    if (predicate(n)) {
      return n;
    }
  }

  return null;
}

// Operations on trees
export function findParentNodeOfType(node, type: Set<string>) {
  return findParent(node, n => type.has(n.name));
}

export function findParentOrCurrentNodeOfType(node, type) {
  if (type.has(node.name)) {
    return node;
  }
  return findParentNodeOfType(node, type);
}

export function findDescendantByTypeAndId(node, type, id) {
  if (node.children.length === 0) {
    return null;
  }

  const lowerCaseId = id.toLowerCase();
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (
      (!type || child.name === type) &&
      (child.attributes.id !== undefined &&
        child.attributes.id.toLowerCase() === lowerCaseId)
    ) {
      return child;
    }
  }

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    const descendant = findDescendantByTypeAndId(child, type, id);
    if (descendant) {
      return descendant;
    }
  }

  return null;
}

function findDirectDescendantById(node, id) {
  return node.children.find(item => item.attributes.id === id);
}

function* iterateLexicalScope(node) {
  let currentNode = node;
  while (currentNode.parent) {
    const { parent } = currentNode;
    const { children } = parent;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child === currentNode) {
        break;
      }
      yield child;
    }
    currentNode = parent;
  }
}

// Search up the tree for a node that is in `node`'s lexical that matches `predicate`.
function findInLexicalScope(node, predicate) {
  for (const child of iterateLexicalScope(node)) {
    if (predicate(child)) {
      return child;
    }
  }
  return null;
}

// Search up the tree for <Elements> nodes that are in node's lexical scope.
// return the first child of an <Elements> that matches id
export function findElementById(node, id) {
  for (const child of iterateLexicalScope(node)) {
    if (child.getclassname && child.getclassname() === "Elements") {
      const element = findDirectDescendantById(child, id);
      if (element) {
        return element;
      }
    }
  }
  return null;
}

// Search up the tree for a <GroupDef> node that is in node's lexical scope and matches id.
export function findGroupDefById(node, id) {
  return findInLexicalScope(node, child => {
    return (
      child.getclassname &&
      child.getclassname() === "GroupDef" &&
      child.attributes.id === id
    );
  });
}

// This is intentionally async since we may want to sub it out for an async
// function in a node environment
export async function getUrlFromBlob(blob: Blob): Promise<string> {
  return URL.createObjectURL(blob);
}

async function loadImage(
  imgUrl: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => {
      resolve(img);
    });
    img.addEventListener("error", e => {
      reject(e);
    });
    img.src = imgUrl;
  });
}

export async function getSizeFromUrl(
  imgUrl: string
): Promise<{ width: number; height: number }> {
  const { width, height } = await loadImage(imgUrl);
  return { width, height };
}

let mousePosition = { x: 0, y: 0 };
function handleMouseMove(e) {
  mousePosition = { x: e.clientX, y: e.clientY };
}

document.addEventListener("mousemove", handleMouseMove);

export function getMousePosition() {
  return mousePosition;
}
