import * as Utils from "./utils";
const MakiObject = require("./runtime/MakiObject");
const WinampAbstractionLayer = require("./runtime/WinampAbstractionLayer");
const Layout = require('./runtime/Layout');
const Container = require('./runtime/Container');
const Group = require("./runtime/Group");
const Button = require("./runtime/Button");

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

const noop = (node, parent) => new MakiObject(node, parent);

const parsers = {
  groupdef: (node, parent, registry) => {
    const attributeId = node.attributes.id;
    registry.groupdefs[attributeId] = node;

    return new MakiObject(node, parent);
  },
  skininfo: noop,
  version: noop,
  name: noop,
  comment: noop,
  author: noop,
  email: noop,
  homepage: noop,
  screenshot: noop,
  container: (node, parent) => new Container(node, parent),
  scripts: noop,
  gammaset: (node, parent, registry) => {
    const gammaId = node.attributes.id;
    if (!registry.gammasets.hasOwnProperty(gammaId)) {
      registry.gammasets[gammaId] = {};
    }

    return new MakiObject(node, parent);
  },
  color: noop,
  layer: noop,
  layoutstatus: noop,
  hideobject: noop,
  button: (node, parent) => new Button(node, parent),
  group: (node, parent, registry) => {
    if (!node.children || node.children.length === 0) {
      const groupdef = registry.groupdefs[node.attributes.id];
      if (groupdef) {
        const newNode = {
          ...node,
          ...groupdef,
          attributes: { ...node.attributes, ...groupdef.attributes },
          name: "group",
        };
        return new Group(newNode, parent);
      }
    }

    return new Group(node, parent);
  },
  layout: (node, parent) => new Layout(node, parent),
  sendparams: noop,
  elements: noop,
  bitmap: async (node, parent, registry, zip) => {
    let { file, gammagroup, h, id, w, x, y } = node.attributes;
    // TODO: Escape file for regex
    const img = Utils.getCaseInsensitveFile(zip, file);
    if (img === undefined) {
      return new MakiObject(node, parent);
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

    return new MakiObject(node, parent);
  },
  eqvis: noop,
  slider: noop,
  gammagroup: (node, parent, registry) => {
    const gammaId = parent.xmlNode.attributes.id;
    const attributeId = node.attributes.id;
    const attributeValues = splitValues(node.attributes.value);
    registry.gammasets[gammaId][attributeId] = attributeValues;

    return new MakiObject(node, parent);
  },
  truetypefont: noop,
  component: noop,
  text: noop,
  layer: noop,
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

    const newNode = { ...node, script, param, file };
    return new MakiObject(newNode, parent);
  },
};

async function parseChildren(node, registry, zip) {
  if (node.xmlNode.type === "comment") {
    return;
  }
  if (node.xmlNode.name == null) {
    console.error(node.xmlNode);
    throw new Error("Unknown node");
  }

  const validChildren = new Set(schema[node.xmlNode.name.toLowerCase()]);
  const resolvedChildren = await Promise.all(
    node.xmlNode.children.map(async child => {
      if (child.type === "comment") {
        return;
      }
      if (child.type === "text") {
        // TODO: Handle text
        return new MakiObject({ ...child }, node);
      }
      if (child.name == null) {
        console.error(child);
        throw new Error("Unknown node");
      }
      const childName = child.name.toLowerCase();
      if (childName == null) {
        console.error(node.xmlNode);
        throw new Error("Unknown node");
      }

      if (!validChildren.has(childName)) {
        throw new Error(`Invalid child of a ${node.xmlNode.name}: ${childName}`);
      }

      const childParser = parsers[childName];
      if (childParser == null) {
        throw new Error(`Missing parser for ${childName}`);
        return;
      }
      const parsedChild = await childParser(child, node, registry, zip);
      if (parsedChild.xmlNode.children != null && parsedChild.xmlNode.children.length > 0) {
        await parseChildren(parsedChild, registry, zip);
      }
      return parsedChild;
    })
  );
  // remove comments other trimmed nodes
  const filteredChildren = resolvedChildren.filter(item => item !== undefined);

  node.js_addChildren(filteredChildren);
}

async function initialize(zip, skinXml) {
  const registry = { scripts: [], gammasets: {}, images: {}, groupdefs: {} };
  const root = new WinampAbstractionLayer(skinXml.children[0], null);
  await parseChildren(root, registry, zip);
  return { root, registry };
}

export default initialize;
