import * as Utils from "./utils";

function splitValues(str) {
  return str.split(",").map(parseFloat);
}

async function loadImage(imgUrl) {
  return await new Promise(resolve => {
    const img = new Image();
    img.addEventListener("load", function() {
      resolve(img);
    });
    img.src = imgUrl;
  });
}

let idCount = 0;
function getId() {
  return '_' + idCount++;
}

const schema = {
  groupdef: [
    "scripts",
    "layer",
    "layoutstatus",
    "hideobject",
    "button",
    "wasabi:titlebar",
    "group",
    "script",
    "sendparams",
    "eqvis",
    "slider",
    "component",
    "colorthemes:list",
    "wasabi:button",
    "text",
    "vis",
    "grid",
    "rect",
    "animatedlayer",
    "nstatesbutton",
    "togglebutton",
    "songticker",
    "menu",
    "status",
    "albumart",
    "playlistplus",
  ],
  group: [
    "button",
    "layer",
    "text",
    "vis",
    "group",
    "scripts",
    "layoutstatus",
    "hideobject",
    "wasabi:titlebar",
    "menu",
    "nstatesbutton",
    "status",
    "script",
    "songticker",
    "grid",
    "animatedlayer",
    "togglebutton",
    "slider",
    "rect",
    "eqvis",
    "playlistplus",
  ],
  layout: [
    "wasabi:standardframe:status",
    "text",
    "wasabi:standardframe:nostatus",
    "layer",
    "button",
    "togglebutton",
    "status",
    "slider",
    "group",
    "sendparams",
    "script",
    "grid",
    "vis",
    "rect",
    "component",
  ],
  container: ["groupdef", "layout", "scripts"],
  scripts: ["script"],
  elements: ["color", "bitmap", "bitmapfont", "truetypefont", "cursor", "elementalias"],
  skininfo: [
    "version",
    "name",
    "author",
    "comment",
    "email",
    "homepage",
    "screenshot",
  ],
  wasabixml: ["skininfo", "scripts", "elements", "groupdef", "container", "gammaset"],
  // same as above, wa3 vs wa5
  winampabstractionlayer: [
    "skininfo",
    "scripts",
    "elements",
    "groupdef",
    "container",
    "gammaset",
    "accelerators",
  ],
  gammaset: ["gammagroup"],
  accelerators: ["accelerator"],
};

const noop = (node) => node;

const parsers = {
  groupdef: (node, parent, registry) => {
    const attributeId = node.attributes.id;
    registry.groupdefs[attributeId] = node;

    return node;
  },
  skininfo: noop,
  version: noop,
  name: noop,
  comment: noop,
  author: noop,
  email: noop,
  homepage: noop,
  screenshot: noop,
  container: noop,
  scripts: noop,
  gammaset: (node, parent, registry) => {
    const gammaId = node.attributes.id;
    if (!registry.gammasets.hasOwnProperty(gammaId)) {
      registry.gammasets[gammaId] = {};
    }

    return node;
  },
  color: noop,
  layer: noop,
  layoutstatus: noop,
  hideobject: noop,
  button: noop,
  group: (node, parent, registry) => {
    if (!node.children || node.children.length === 0) {
      const groupdef = registry.groupdefs[node.attributes.id];
      if (groupdef) {
        return {
          ...node,
          ...groupdef,
          attributes: { ...node.attributes, ...groupdef.attributes },
          name: "group",
        };
      }
    }

    return node;
  },
  layout: noop,
  sendparams: noop,
  elements: noop,
  bitmap: async (node, parent, registry, zip) => {
    let { file, gammagroup, h, id, w, x, y } = node.attributes;
    // TODO: Escape file for regex
    const img = Utils.getCaseInsensitveFile(zip, file);
    if (img === undefined) {
      return node;
    }
    const imgBlob = await img.async("blob");
    const imgUrl = URL.createObjectURL(imgBlob);
    if (w === undefined || h === undefined) {
      const image = await loadImage(imgUrl);
      w = image.width;
      h = image.height;
      x = x !== undefined ? x : 0;
      y = y !== undefined ? y : 0;
    }
    registry.images[id.toLowerCase()] = { file, gammagroup, h, w, x, y, imgUrl };

    return node;
  },
  eqvis: noop,
  slider: noop,
  gammagroup: (node, parent, registry) => {
    const gammaId = parent.attributes.id;
    const attributeId = node.attributes.id;
    const attributeValues = splitValues(node.attributes.value);
    registry.gammasets[gammaId][attributeId] = attributeValues;

    return node;
  },
  truetypefont: noop,
  component: noop,
  text: noop,
  layer: noop,
  button: noop,
  togglebutton: noop,
  status: noop,
  slider: noop,
  bitmapfont: noop,
  vis: noop,
  "wasabi:titlebar": noop,
  "colorthemes:list": noop,
  "wasabi:standardframe:status": noop,
  "wasabi:standardframe:nostatus": noop,
  "wasabi:button": noop,
  accelerators: noop,
  accelerator: noop,
  cursor: noop,
  elementalias: noop,
  grid: noop,
  rect: noop,
  animatedlayer: noop,
  nstatesbutton: noop,
  songticker: noop,
  menu: noop,
  status: noop,
  albumart: noop,
  playlistplus: noop,
  async script(node, parent, registry, zip) {
    const { id, file, param } = node.attributes;
    const script = await Utils.readUint8array(zip, file);
    registry.scripts.push({ parent, id, param, script });

    return { ...node, script, param };
  },
};

async function parseChildren(node, registry, zip) {
  if (node.type === "comment") {
    return;
  }
  if (node.name == null) {
    console.error(node);
    throw new Error("Unknown node");
  }

  const validChildren = new Set(schema[node.name.toLowerCase()]);
  const resolvedChildren = await Promise.all(
    node.children.map(async child => {
      if (child.type === "comment") {
        return;
      }
      if (child.type === "text") {
        // TODO: Handle text
        return { ...child, id: getId() };
      }
      if (child.name == null) {
        console.error(child);
        throw new Error("Unknown node");
      }
      const childName = child.name.toLowerCase();
      if (childName == null) {
        console.error(node);
        throw new Error("Unknown node");
      }

      if (!validChildren.has(childName)) {
        throw new Error(`Invalid child of a ${node.name}: ${childName}`);
      }

      const childParser = parsers[childName];
      if (childParser == null) {
        throw new Error(`Missing parser for ${childName}`);
        return;
      }
      const parsedChild = await childParser(child, node, registry, zip);
      const returnNode = { ...parsedChild, id: getId() };
      if (parsedChild.children != null) {
        const parsedChildren = await parseChildren(parsedChild, registry, zip);
        returnNode.children = parsedChildren.children;
      }
      return returnNode;
    })
  );
  // remove comments other trimmed nodes
  const filteredChildren = resolvedChildren.filter(item => item !== undefined);

  return {
    ...node,
    children: filteredChildren
  };
}

async function initialize(zip, skinXml) {
  const registry = { scripts: [], gammasets: {}, images: {}, groupdefs: {} };
  const nodes = await parseChildren(skinXml.children[0], registry, zip);
  nodes.id = getId();
  return { nodes, registry };
}

export default initialize;
