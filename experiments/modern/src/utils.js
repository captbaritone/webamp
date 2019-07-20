import { xml2js } from "xml-js";

export function getCaseInsensitveFile(zip, filename) {
  // TODO: Escape `file` for rejex characters
  return zip.file(new RegExp(filename, "i"))[0];
}

// Read a
export async function readXml(zip, filepath) {
  const file = await getCaseInsensitveFile(zip, filepath);
  if (file == null) {
    return null;
  }
  const text = await file.async("text");
  return xml2js(text, { compact: false, elementsKey: "children" });
}

export async function readUint8array(zip, filepath) {
  const file = await getCaseInsensitveFile(zip, filepath);
  if (file == null) {
    return null;
  }
  return file.async("uint8array");
}

function flatten(arr) {
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

// Note: Bad things will happen if the root node you pass returns an array. In
// our use case, the root node never returns an array.
// Note: Because children are processed in parallel, the order in which nodes
// are processed can be a bit confusing. The only guarantee we make is that
// children will be processed before their parent.
export async function asyncDepthFirstFlatMap(node, mapper) {
  const { children } = node;
  if (children == null) {
    return mapper(node);
  }

  const promisedChildren = children.map(child =>
    asyncDepthFirstFlatMap(child, mapper)
  );
  const mappedChildren = await Promise.all(promisedChildren);
  const flatChildren = flatten(mappedChildren);

  return mapper({ ...node, children: flatChildren });
}

// Transform an tree structure by mapping over each node breadth first
// Parents are mapped before their children
// Children are mapped in parallel
export async function asyncTreeMap(node, mapper) {
  const mapped = await mapper(node);
  if (mapped.children == null) {
    return mapped;
  }
  const promises = mapped.children.map(child => {
    return asyncTreeMap(child, mapper);
  });
  const children = await Promise.all(promises);

  return { ...mapped, children };
}

export async function inlineIncludes(xml, zip) {
  return asyncTreeMap(xml, async node => {
    if (node.name !== "include") {
      return node;
    }
    // TODO: Normalize file names so that they hit the same cache
    // TODO: Ensure this node does not already have children for some reason
    const includedFile = await readXml(zip, node.attributes.file);
    if (includedFile == null) {
      console.warn(
        `Tried to include a file that could not be found: ${
          node.attributes.file
        }`
      );
      return node;
    }
    return { ...node, children: includedFile.children };
  });
}
