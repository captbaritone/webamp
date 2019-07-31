import * as Utils from "./utils";
import JSZip from "jszip";

const schema = {
  groupdef: [
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
  ],
  container: ["groupdef", "layout", "scripts"],
  scripts: ["script"],
  elements: ["color", "bitmap", "bitmapfont", "truetypefont"],
  skininfo: [
    "version",
    "name",
    "author",
    "comment",
    "email",
    "homepage",
    "screenshot",
  ],
  wasabixml: ["skininfo", "scripts", "elements", "groupdef", "container"],
  // same as above, wa3 vs wa5
  winampabstractionlayer: [
    "skininfo",
    "scripts",
    "elements",
    "groupdef",
    "container",
  ],
  gammaset: ["gammagroup"],
};

const parsers = {
  groupdef(node, parent, registry, zip) {},
  skininfo: () => {},
  version: () => {},
  name: () => {},
  comment: () => {},
  author: () => {},
  email: () => {},
  homepage: () => {},
  screenshot: () => {},
  container: () => {},
  scripts: () => {},
  gammaset: () => {},
  color: () => {},
  layer: () => {},
  layoutstatus: () => {},
  hideobject: () => {},
  button: () => {},
  group: () => {},
  layout: () => {},
  sendparams: () => {},
  elements: () => {},
  bitmap: () => {},
  eqvis: () => {},
  slider: () => {},
  gammagroup: () => {},
  truetypefont: () => {},
  component: () => {},
  text: () => {},
  layer: () => {},
  button: () => {},
  togglebutton: () => {},
  status: () => {},
  slider: () => {},
  bitmapfont: () => {},
  vis: () => {},
  "wasabi:titlebar": () => {},
  "colorthemes:list": () => {},
  "wasabi:standardframe:status": () => {},
  "wasabi:standardframe:nostatus": () => {},
  "wasabi:button": () => {},
  async script(node, parent, registry, zip) {
    const { id, file, param } = node.attributes;
    const script = await Utils.readUint8array(zip, file);
    registry.scripts.push({ parent, id, param, script });
  },
};

async function parseChildren(node, parsedParent, registry, zip) {
  if (node.type === "comment") {
    return;
  }
  if (node.name == null) {
    console.error(node);
    throw new Error("Unknown node");
  }

  const validChildren = new Set(schema[node.name.toLowerCase()]);
  await Promise.all(
    node.children.map(async child => {
      if (child.type === "comment") {
        return;
      }
      if (child.type === "text") {
        // TODO: Handle text
        return;
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
        debugger;
        throw new Error(`Invalid child of a ${node.name}: ${childName}`);
      }

      const childParser = parsers[childName];
      if (childParser == null) {
        throw new Error(`Missing parser for ${childName}`);
        return;
      }
      const parsedChild = await childParser(child, node, registry, zip);
      if (child.children != null) {
        await parseChildren(child, parsedChild, registry, zip);
      }
    })
  );
}

async function initialize(registry, skinBlob) {
  const zip = await JSZip.loadAsync(skinBlob);
  const skinXml = await Utils.inlineIncludes(
    await Utils.readXml(zip, "skin.xml"),
    zip
  );

  await parseChildren(skinXml.children[0], null, registry, zip);
}

export default initialize;
