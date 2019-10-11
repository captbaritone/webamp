import * as Utils from "./utils";
import MakiObject from "./runtime/MakiObject";
import GuiObject from "./runtime/GuiObject";
import JsWinampAbstractionLayer from "./runtime/JsWinampAbstractionLayer";
import Layout from "./runtime/Layout";
import Layer from "./runtime/Layer";
import Container from "./runtime/Container";
import JsScript from "./runtime/JsScript";
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
import WindowHolder from "./runtime/WindowHolder";

async function prepareMakiImage(node, zip, file) {
  let { h, w } = node.attributes;
  // TODO: Escape file for regex
  const img = Utils.getCaseInsensitveFile(zip, file);
  if (img === undefined) {
    return {};
  }
  const imgBlob = await img.async("blob");
  const imgUrl = await Utils.getUrlFromBlob(imgBlob);
  if (w === undefined || h === undefined) {
    const { width, height } = await Utils.getSizeFromUrl(imgUrl);
    w = width;
    h = height;
  }

  return {
    h,
    w,
    imgUrl,
  };
}

function imageAttributesFromNode(node) {
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

const noop = (node, parent) => new GuiObject(node, parent, undefined);

const parsers = {
  groupdef: (node, parent) => new JsGroupDef(node, parent, undefined),
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
  container: (node, parent) => new Container(node, parent, undefined),
  scripts: noop,
  gammaset: (node, parent) => new JsGammaSet(node, parent, undefined),
  color: noop,
  layer: (node, parent) => new Layer(node, parent, undefined),
  layoutstatus: noop,
  hideobject: noop,
  button: (node, parent) => new Button(node, parent, undefined),
  group: (node, parent) => new Group(node, parent, undefined),
  layout: (node, parent) => new Layout(node, parent, undefined),
  sendparams: noop,
  elements: (node, parent) => new JsElements(node, parent, undefined),
  bitmap: noop,
  eqvis: (node, parent) => new EqVis(node, parent, undefined),
  slider: (node, parent) => new Slider(node, parent, undefined),
  gammagroup: noop,
  truetypefont: async (node, parent, zip) => {
    const { file } = node.attributes;
    const font = Utils.getCaseInsensitveFile(zip, file);
    const fontBlob = await font.async("blob");
    const fontUrl = await Utils.getUrlFromBlob(fontBlob);
    const fontFamily = `font-${Utils.getId()}-${file.replace(/\./, "_")}`;
    try {
      await Utils.loadFont(fontUrl, fontFamily);
    } catch {
      console.warn(`Failed to load font ${fontFamily}`);
      return new MakiObject(node, parent);
    }
    return new MakiObject(node, parent, { fontFamily });
  },
  component: (node, parent) => new WindowHolder(node, parent, undefined),
  text: (node, parent) => new Text(node, parent, undefined),
  togglebutton: (node, parent) => new ToggleButton(node, parent, undefined),
  status: (node, parent) => new Status(node, parent, undefined),
  bitmapfont: noop,
  vis: (node, parent) => new Vis(node, parent, undefined),
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
  animatedlayer: (node, parent) => new AnimatedLayer(node, parent, undefined),
  nstatesbutton: noop,
  songticker: noop,
  menu: noop,
  albumart: noop,
  playlistplus: noop,
  script: (node, parent) => new JsScript(node, parent, undefined),
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
        return new MakiObject({ ...child }, node, undefined);
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
      child.maki = parsedChild;
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

async function nodeImageLookup(node, root, zip) {
  const imageAttributes = imageAttributesFromNode(node);
  if (!imageAttributes || imageAttributes.length === 0) {
    return;
  }
  if (!node.attributes.js_assets) {
    node.attributes.js_assets = {};
  }
  await Promise.all(
    imageAttributes.map(async attribute => {
      const image = node.attributes[attribute];
      if (!image || !Utils.isString(image)) {
        return;
      }
      let img;
      if (image.endsWith(".png")) {
        img = await prepareMakiImage(node, zip, image);
      } else {
        const elementNode = Utils.findXmlElementById(node, image, root);
        if (elementNode) {
          img = await prepareMakiImage(
            elementNode,
            zip,
            elementNode.attributes.file
          );

          const { x, y } = elementNode.attributes;
          img.x = x !== undefined ? x : 0;
          img.y = y !== undefined ? y : 0;
        } else {
          console.warn("Unable to find image:", image);
        }
      }
      node.attributes.js_assets[attribute.toLowerCase()] = img;
    })
  );
}

async function applyImageLookups(root, zip) {
  await Utils.asyncTreeFlatMap(root, async node => {
    await nodeImageLookup(node, root, zip);
    return node;
  });
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

async function initialize(zip, skinXml) {
  const xmlRoot = skinXml.children[0];
  await applyImageLookups(xmlRoot, zip);
  const root = new JsWinampAbstractionLayer(xmlRoot, null, undefined);
  await parseChildren(root, xmlRoot.children, zip);
  await applyGroupDefs(root);
  return root;
}

export default initialize;
