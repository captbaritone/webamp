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

const noop = (node, parent) => new MakiObject(node, parent);

const parsers = {
  groupdef: (node, parent) => new JsGroupDef(node, parent),
  skininfo: noop,
  guiobject: noop,
  version: noop,
  name: noop,
  comment: noop,
  syscmds: noop,
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
    let { h, w, x, y } = node.attributes;
    const { file, gammagroup, id } = node.attributes;
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

async function parseChildren(node, children, zip) {
  if (node.type === "comment") {
    return;
  }
  if (node.name == null) {
    console.error(node);
    throw new Error("Unknown node");
  }

  const resolvedChildren = await Promise.all(
    children.map(async child => {
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
        console.error(node);
        throw new Error("Unknown node");
      }

      let childParser = parsers[childName];
      if (childParser == null) {
        console.warn(`Missing parser in initialize for ${childName}`);
        childParser = noop;
      }
      const parsedChild = await childParser(child, node, zip);
      if (child.children != null && child.children.length > 0) {
        await parseChildren(parsedChild, child.children, zip);
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
    switch (node.name) {
      case "group": {
        if (!node.children || node.children.length === 0) {
          const groupdef = node.js_groupdefLookup(node.attributes.id);
          if (!groupdef) {
            console.warn(
              "Unable to find groupdef. Rendering null",
              node.attributes.id
            );
            return {};
          }
          node.children = groupdef.children;
          // Do we need to copy the items instead of just changing the parent?
          node.children.forEach(item => {
            item.parent = node;
          });
          node.attributes = {
            ...node.attributes,
            ...groupdef.attributes,
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
  const xmlRoot = skinXml.children[0];
  const root = new WinampAbstractionLayer(skinXml.children[0], null);
  await parseChildren(root, xmlRoot.children, zip);
  await applyGroupDefs(root);
  return root;
}

export default initialize;
