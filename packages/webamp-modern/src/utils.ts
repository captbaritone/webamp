import JSZip from "jszip";
import { xml2js } from "xml-js";
import { XmlNode } from "./types";
import MakiObject from "./runtime/MakiObject";
import GuiObject from "./runtime/GuiObject";

let nextId = 0;
export function getId(): number {
  return nextId++;
}

// Breadth-first tree map
// TODO: Type this so the return type is different than the initial type
// NOTE: This does not apply the callback to the root node. It probably should,
// but I'm too lazy to figure out how to write it.
export function mapTreeBreadth<T extends { children: T[] }>(
  node: T,
  cb: (node: T, parent: T) => T
): T {
  const children = node.children || [];
  const mappedChildren = children.map((child) => {
    const newChild = cb(child, node);
    return mapTreeBreadth(newChild, cb);
  });
  return { ...node, children: mappedChildren };
}

export function isPromise(obj: any): boolean {
  return obj && typeof obj.then === "function";
}

export function isString(obj: any): boolean {
  return typeof obj === "string";
}

export function isObject(obj: any): boolean {
  return obj === Object(obj);
}

// Convert windows filename slashes to forward slashes
function fixFilenameSlashes(filename: string): string {
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
export async function readXml(
  zip: JSZip,
  filepath: string
): Promise<XmlNode | null> {
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
): Promise<Uint8Array | null> {
  const file = await getCaseInsensitveFile(zip, filepath);
  if (file == null) {
    return null;
  }
  return file.async("uint8array");
}

// I any of the values in `arr` are themselves arrays, interpolate the nested
// array into the top level array.
function flatten<T>(arr: Array<T | T[]>): T[] {
  const newArr: T[] = [];
  arr.forEach((item) => {
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
  mapper: (value: T) => Promise<T[] | R>
): Promise<R[]> {
  const mapped = await Promise.all(arr.map(mapper));
  const childPromises = mapped.map(async (item) => {
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
export async function asyncTreeFlatMap<T extends { children: T[] }>(
  node: T,
  mapper: (node: T) => Promise<T[] | T>
): Promise<T> {
  const { children } = node;
  if (children == null) {
    return node;
  }

  const mappedChildren = await asyncFlatMap(children, mapper);

  const recursedChildren = await Promise.all(
    mappedChildren.map((child) =>
      asyncTreeFlatMap(
        // @ts-ignore FixMe
        child,
        mapper
      )
    )
  );

  return { ...node, children: recursedChildren };
}

// Given an XML file and a zip which it came from, replace all `<inline />` elements
// with the contents of the file to be included.
export async function inlineIncludes(
  xml: XmlNode,
  zip: JSZip
): Promise<XmlNode> {
  return asyncTreeFlatMap(xml, async (node) => {
    if (node.name !== "include") {
      return node;
    }
    if (node.attributes.file == null) {
      return node;
    }
    // TODO: Normalize file names so that they hit the same cache
    const includedFile = await readXml(zip, node.attributes.file);
    if (includedFile == null) {
      console.warn(
        `Tried to include a file that could not be found: ${node.attributes.file}`
      );
      return [];
    }
    return includedFile.children;
  });
}

export function unimplementedWarning(name: string): any {
  console.warn(`Executing unimplemented MAKI function: ${name}`);
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
export function findParentNodeOfType(
  node: MakiObject,
  type: Set<string>
): MakiObject | null {
  return findParent(node, (n) => type.has(n.name.toLowerCase()));
}

export function findParentOrCurrentNodeOfType(
  node: MakiObject,
  type: Set<string>
): MakiObject | null {
  if (type.has(node.name.toLowerCase())) {
    return node;
  }
  return findParentNodeOfType(node, type);
}

export function findDescendantByTypeAndId<
  T extends { children: T[]; name: string; attributes?: { id?: string } }
>(node: T, type: string | null, id: string): T | null {
  if (node.children.length === 0) {
    return null;
  }

  const lowerCaseId = id.toLowerCase();
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (
      (!type || child.name === type) &&
      child.attributes &&
      child.attributes.id !== undefined &&
      child.attributes.id.toLowerCase() === lowerCaseId
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

function findDirectDescendantById<
  T extends { children: T[]; attributes?: { id?: string } }
>(node: T, id: string): T | undefined {
  const lowerCaseId = id.toLowerCase();
  return node.children.find((item) =>
    Boolean(
      item.attributes &&
        item.attributes.id &&
        item.attributes.id.toLowerCase() === lowerCaseId
    )
  );
}

function* iterateLexicalScope(node: MakiObject): IterableIterator<MakiObject> {
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
function findInLexicalScope(
  node: MakiObject,
  predicate: (node: MakiObject) => boolean
): MakiObject | null {
  for (const child of iterateLexicalScope(node)) {
    if (predicate(child)) {
      return child;
    }
  }
  return null;
}

// Search up the tree for <Elements> nodes that are in node's lexical scope.
// return the first child of an <Elements> that matches id
export function findElementById(
  node: MakiObject,
  id: string
): MakiObject | null {
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
export function findGroupDefById(
  node: MakiObject,
  id: String
): MakiObject | null {
  return findInLexicalScope(node, (child) => {
    return (
      child.getclassname &&
      child.getclassname() === "GroupDef" &&
      // @ts-ignore We don't have good typing for attributes
      child.attributes.id === id
    );
  });
}

// Search down the tree for <Elements> nodes that are in node's lexical scope.
// return the first child of an <Elements> that matches id unless we find
// node first, in that case we didn't find the element
// TODO: this might be overly generous, including some definitions that
// shouldn't be accessible. But it's working for now :-X
export function findXmlElementById(
  node: XmlNode,
  id: string,
  root: XmlNode
): XmlNode | null {
  if (root.uid === node.uid) {
    // Search ends if we find the node that initiated the search, since it means we weren't able to
    // find the match in its scope
    // Return the node itself as a kind of sentinel value to look for, since finding the node is an
    // ending condition for the search
    return node;
  } else if (root.name === "elements") {
    const element = findDirectDescendantById(root, id);
    if (element) {
      return element;
    }
  } else {
    const children = root.children || [];
    for (const child of children) {
      const element = findXmlElementById(node, id, child);
      if (element) {
        if (element.uid === node.uid) {
          // This happens when we find the node before we find the declaration, which means it
          // either doesn't exist or it wouldn't be in scope
          return null;
        }
        return element;
      }
    }
  }
  return null;
}

// This is intentionally async since we may want to sub it out for an async
// function in a node environment
export async function getUrlFromBlob(blob: Blob): Promise<string> {
  // We initiallay used `URL.createObjectURL(blob)` here, but it had an issue
  // where, when used as a background imaged, they would take more than one
  // frame to load resulting in a white flash when switching background iamges.
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      // @ts-ignore This API is not very type-friendly.
      resolve(e.target.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function loadImage(
  imgUrl: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => {
      resolve(img);
    });
    img.addEventListener("error", (e) => {
      reject(e);
    });
    img.src = imgUrl;
  });
}

/* global FontFace */
// Types for FontFace provided by @types/css-font-loading-module
// TODO: Offer some way to clean this up
export async function loadFont(fontUrl: string, name: string) {
  // Note: Incompatible with non-chromium Edge (#901)
  const font = new FontFace(name, `url(${fontUrl})`);
  const loadedFont = await font.load();
  document.fonts.add(loadedFont);

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  function remove() {
    document.fonts.delete(loadedFont);
  }
}

export async function getSizeFromUrl(
  imgUrl: string
): Promise<{ width: number; height: number }> {
  const { width, height } = await loadImage(imgUrl);
  return { width, height };
}

let mousePosition = { x: 0, y: 0 };
function handleMouseMove(e: MouseEvent): void {
  mousePosition = { x: e.clientX, y: e.clientY };
}

// It's possible we are in a Node envionment
if (typeof document !== "undefined") {
  document.addEventListener("mousemove", handleMouseMove);
}

export function getMousePosition() {
  return mousePosition;
}

export function imageAttributesFromNode(node: XmlNode): Array<string> {
  if (!node.name) return [];
  switch (node.name.toLowerCase()) {
    case "layer":
    case "animatedlayer": {
      return ["image"];
    }
    case "layout": {
      return ["background"];
    }
    case "button":
    case "togglebutton": {
      return ["image", "downImage"];
    }
    default: {
      return [];
    }
  }
}

export function baseImageAttributeFromObject(obj: GuiObject): string | null {
  switch (obj.getclassname()) {
    case "Layer":
    case "AnimatedLayer": {
      return "image";
    }
    case "Layout": {
      return "background";
    }
    case "Button":
    case "ToggleButton": {
      return "image";
    }
    default: {
      return null;
    }
  }
}
