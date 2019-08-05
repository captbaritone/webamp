import {
  getCaseInsensitveFile,
  readUint8array,
  asyncTreeFlatMap,
} from "./utils";
import MakiObject from "./runtime/MakiObject";
import WinampAbstractionLayer from "./runtime/WinampAbstractionLayer";
import Layout from "./runtime/Layout";
import Layer from "./runtime/Layer";
import Container from "./runtime/Container";
import JsElements from "./runtime/JsElements";
import JsGammaSet from "./runtime/JsGammaSet";
import JsGroupDef from "./runtime/JsGroupDef";
import Group from "./runtime/Group";
import Button from "./runtime/Button";
import ToggleButton from "./runtime/ToggleButton";
import Text from "./runtime/Text";
import Status from "./runtime/Status";

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
  elements: [
    "color",
    "bitmap",
    "bitmapfont",
    "truetypefont",
    "cursor",
    "elementalias",
  ],
  skininfo: [
    "version",
    "name",
    "author",
    "comment",
    "email",
    "homepage",
    "screenshot",
  ],
  wasabixml: [
    "skininfo",
    "scripts",
    "elements",
    "groupdef",
    "container",
    "gammaset",
  ],
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
  groupdef: (node, parent) => new JsGroupDef(node, parent),
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
  gammaset: (node, parent) => new JsGammaSet(node, parent),
  color: noop,
  layer: (node, parent) => new Layer(node, parent),
  layoutstatus: noop,
  hideobject: noop,
  button: (node, parent) => new Button(node, parent),
  group: (node, parent) => new Group(node, parent),
  layout: (node, parent) => new Layout(node, parent),
  sendparams: noop,
  elements: (node, parent) => new JsElements(node, parent),
  bitmap: async (node, parent, zip) => {
    let { file, gammagroup, h, id, w, x, y } = node.attributes;
    // TODO: Escape file for regex
    const img = getCaseInsensitveFile(zip, file);
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

    return new MakiObject(node, parent, {
      id,
      file,
      gammagroup,
      h,
      w,
      x,
      y,
      imgUrl,
    });
  },
  eqvis: noop,
  slider: noop,
  gammagroup: noop,
  truetypefont: noop,
  component: noop,
  text: (node, parent) => new Text(node, parent),
  togglebutton: (node, parent) => new ToggleButton(node, parent),
  status: (node, parent) => new Status(node, parent),
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
  albumart: noop,
  playlistplus: noop,
  async script(node, parent, zip) {
    const script = await readUint8array(zip, node.attributes.file);
    return new MakiObject(node, parent, { script });
  },
};

async function parseChildren(node, zip) {
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
        throw new Error(
          `Invalid child of a ${node.xmlNode.name}: ${childName}`
        );
      }

      const childParser = parsers[childName];
      if (childParser == null) {
        throw new Error(`Missing parser for ${childName}`);
        return;
      }
      const parsedChild = await childParser(child, node, zip);
      if (
        parsedChild.xmlNode.children != null &&
        parsedChild.xmlNode.children.length > 0
      ) {
        await parseChildren(parsedChild, zip);
      }
      return parsedChild;
    })
  );
  // remove comments other trimmed nodes
  const filteredChildren = resolvedChildren.filter(item => item !== undefined);

  node.js_addChildren(filteredChildren);
}

async function applyGroupDefs(root) {
  await asyncTreeFlatMap(root, async node => {
    switch (node.xmlNode.name) {
      case "group": {
        if (!node.children || node.children.length === 0) {
          const groupdef = node.js_groupdefLookup(node.xmlNode.attributes.id);
          if (!groupdef) {
            console.warn(
              "Unable to find groupdef. Rendering null",
              node.xmlNode.attributes.id
            );
            return {};
          }
          node.children = groupdef.children;
          // Do we need to copy the items instead of just changing the parent?
          node.children.forEach(item => {
            item.parent = node;
          });
          node.xmlNode.attributes = {
            ...node.xmlNode.attributes,
            ...groupdef.xmlNode.attributes,
          };
        }
        return {};
      }
      default: {
        return node;
      }
    }
  });
}

async function initialize(zip, skinXml) {
  const root = new WinampAbstractionLayer(skinXml.children[0], null);
  await parseChildren(root, zip);
  await applyGroupDefs(root);
  return root;
}

export default initialize;
