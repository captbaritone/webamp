import * as Utils from "./utils";
import MakiObject from "./runtime/MakiObject";
import GuiObject from "./runtime/GuiObject";
import JsWinampAbstractionLayer from "./runtime/JsWinampAbstractionLayer";
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
import Slider from "./runtime/Slider";
import Vis from "./runtime/Vis";
import EqVis from "./runtime/EqVis";
import AnimatedLayer from "./runtime/AnimatedLayer";
import Component from "./runtime/Component";

const noop = (node, parent, zip, store) =>
  new GuiObject(node, parent, undefined, store);

const parsers = {
  groupdef: (node, parent, zip, store) =>
    new JsGroupDef(node, parent, undefined, store),
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
  container: (node, parent, zip, store) =>
    new Container(node, parent, undefined, store),
  scripts: noop,
  gammaset: (node, parent, zip, store) =>
    new JsGammaSet(node, parent, undefined, store),
  color: noop,
  layer: (node, parent, zip, store) =>
    new Layer(node, parent, undefined, store),
  layoutstatus: noop,
  hideobject: noop,
  button: (node, parent, zip, store) =>
    new Button(node, parent, undefined, store),
  group: (node, parent, zip, store) =>
    new Group(node, parent, undefined, store),
  layout: (node, parent, zip, store) =>
    new Layout(node, parent, undefined, store),
  sendparams: noop,
  elements: (node, parent, zip, store) =>
    new JsElements(node, parent, undefined, store),
  bitmap: async (node, parent, zip, store) => {
    let { h, w, x, y } = node.attributes;
    const { file, gammagroup, id } = node.attributes;
    // TODO: Escape file for regex
    const img = Utils.getCaseInsensitveFile(zip, file);
    if (img === undefined) {
      return new MakiObject(node, parent);
    }
    const imgBlob = await img.async("blob");
    const imgUrl = await Utils.getUrlFromBlob(imgBlob);
    if (w === undefined || h === undefined) {
      const { width, height } = await Utils.getSizeFromUrl(imgUrl);
      w = width;
      h = height;
      x = x !== undefined ? x : 0;
      y = y !== undefined ? y : 0;
    }

    return new MakiObject(
      node,
      parent,
      {
        id,
        file,
        gammagroup,
        h,
        w,
        x,
        y,
        imgUrl,
      },
      store
    );
  },
  eqvis: (node, parent, zip, store) =>
    new EqVis(node, parent, undefined, store),
  slider: (node, parent, zip, store) =>
    new Slider(node, parent, undefined, store),
  gammagroup: noop,
  truetypefont: noop,
  component: (node, parent, zip, store) =>
    new Component(node, parent, undefined, store),
  text: (node, parent, zip, store) => new Text(node, parent, undefined, store),
  togglebutton: (node, parent, zip, store) =>
    new ToggleButton(node, parent, undefined, store),
  status: (node, parent, zip, store) =>
    new Status(node, parent, undefined, store),
  bitmapfont: noop,
  vis: (node, parent, zip, store) => new Vis(node, parent, undefined, store),
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
  animatedlayer: (node, parent, zip, store) =>
    new AnimatedLayer(node, parent, undefined, store),
  nstatesbutton: noop,
  songticker: noop,
  menu: noop,
  albumart: noop,
  playlistplus: noop,
  script: noop,
};

async function parseChildren(node, children, zip, store) {
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
        return new MakiObject({ ...child }, node, undefined, store);
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
      const parsedChild = await childParser(child, node, zip, store);
      if (child.children != null && child.children.length > 0) {
        await parseChildren(parsedChild, child.children, zip, store);
      }
      return parsedChild;
    })
  );
  // remove comments other trimmed nodes
  const filteredChildren = resolvedChildren.filter(item => item !== undefined);

  node.js_addChildren(filteredChildren);
}

async function applyGroupDefs(root) {
  await Utils.asyncTreeFlatMap(root, async node => {
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

async function initialize(zip, skinXml, store) {
  const xmlRoot = skinXml.children[0];
  const root = new JsWinampAbstractionLayer(
    skinXml.children[0],
    null,
    undefined,
    store
  );
  await parseChildren(root, xmlRoot.children, zip, store);
  await applyGroupDefs(root);
  return root;
}

export default initialize;
