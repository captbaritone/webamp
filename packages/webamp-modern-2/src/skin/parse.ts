import parseXml, { XmlElement } from "@rgrove/parse-xml";
import { assert, num, getCaseInsensitiveFile, px } from "../utils";
import UIRoot from "../UIRoot";
import JSZip, { JSZipObject } from "jszip";
import Bitmap from "./Bitmap";
import ImageManager from "./ImageManager";

export default class SkinParser {
  _zip: JSZip;
  _imageManager: ImageManager;
  _path: string[];
  _root: UIRoot;

  constructor(zip: JSZip) {
    this._zip = zip;
    this._path = [];
    this._root = new UIRoot();
    this._imageManager = new ImageManager(zip);
  }
  async parse() {
    const includedXml = await this.getCaseInsensitiveFile("skin.xml").async(
      "string"
    );

    // Note: Included files don't have a single root node, so we add a synthetic one.
    // A different XML parser library might make this unnessesary.
    const parsed = parseXml(includedXml);

    this.traverseChildren(parsed);
  }
  async traverseChildren(parent) {
    for (const child of parent.children) {
      if (child instanceof XmlElement) {
        await this.traverseChild(child);
      }
    }
  }
  async traverseChild(node) {
    switch (node.name.toLowerCase()) {
      case "wasabixml":
        return this.wasabiXml(node);
      case "include":
        return this.include(node);
      case "skininfo":
        return this.skininfo(node);
      case "elements":
        return this.elements(node);
      case "bitmap":
        return this.bitmap(node);
      case "color":
        return this.color(node);
      case "groupdef":
        return this.groupdef(node);
      case "layer":
        return this.layer(node);
      case "container":
        return this.container(node);
      case "layoutstatus":
        return this.layoutStatus(node);
      case "hideobject":
        return this.hideobject(node);
      case "button":
        return this.button(node);
      case "togglebutton":
        return this.toggleButton(node);
      case "group":
        return this.group(node);
      case "layout":
        return this.layout(node);
      case "component":
        return this.component(node);
      case "gammaset":
        return this.gammaset(node);
      case "gammagroup":
        return this.gammagroup(node);
      case "slider":
        return this.slider(node);
      case "script":
        return this.script(node);
      case "scripts":
        return this.scripts(node);
      case "text":
        return this.text(node);
      case "sendparams":
        return this.sendparams(node);
      case "wasabi:titlebar":
        return this.wasabiTitleBar(node);
      case "wasabi:button":
        return this.wasabiButton(node);
      case "truetypefont":
        return this.trueTypeFont(node);
      case "wasabi:standardframe:status":
        return this.wasabiStandardframeStatus(node);
      case "wasabi:standardframe:nostatus":
        return this.wasabiStandardframeNoStatus(node);
      case "eqvis":
        return this.eqvis(node);
      case "colorthemes:list":
        return this.colorThemesList(node);
      case "status":
        return this.status(node);
      // Note: Included files don't have a single root node, so we add a synthetic one.
      // A different XML parser library might make this unnessesary.
      case "wrapper":
        return this.traverseChildren(node);
      default:
        throw new Error(`Unhandled XML node type: ${node.name}`);
    }
  }

  /* Individual Element Parsers */

  async wasabiXml(node: XmlElement) {
    await this.traverseChildren(node);
  }

  async elements(node: XmlElement) {
    await this.traverseChildren(node);
  }

  async group(node: XmlElement) {
    await this.traverseChildren(node);
  }

  async bitmap(node: XmlElement) {
    assert(
      node.children.length === 0,
      "Unexpected children in <bitmap> XML node."
    );
    const { file } = node.attributes;
    assert(file != null, "Expected bitmap node to have a `file` attribute");

    const imgUrl = await this._imageManager.getUrl(file);

    const id = node.attributes.id;
    const x = num(node.attributes.x) ?? 0;
    const y = num(node.attributes.y) ?? 0;
    let width = num(node.attributes.w);
    let height = num(node.attributes.h);

    if (width == null || height == null) {
      assert(
        x != null && y != null,
        "Expected images with unknown size to not have offsets."
      );
      assert(
        width == null && height == null,
        "Expected both dimensions to be missing."
      );
      const size = await this._imageManager.getSize(imgUrl);
      width = size.width;
      height = size.height;
    }

    const bitmap = new Bitmap({
      url: imgUrl,
      id,
      x,
      y,
      width,
      height,
    });

    // TODO: Store this somewhere. For now, we can just show it.
    const div = document.createElement("div");
    div.style.height = px(bitmap._height);
    div.style.width = px(bitmap._width);
    div.style.backgroundImage = `url(${bitmap._url})`;
    div.style.backgroundPositionX = px(-bitmap._x);
    div.style.backgroundPositionY = px(-bitmap._y);
    div.style.display = "inline-block";
    div.style.imageRendering = "pixelated";

    document.body.appendChild(div);
  }

  async text(node: XmlElement) {
    assert(
      node.children.length === 0,
      "Unexpected children in <text> XML node."
    );

    // TODO: Parse text
  }

  async script(node: XmlElement) {
    assert(
      node.children.length === 0,
      "Unexpected children in <script> XML node."
    );

    // TODO: Parse bitmaps
  }

  async scripts(node: XmlElement) {
    await this.traverseChildren(node);
  }

  async sendparams(node: XmlElement) {
    assert(
      node.children.length === 0,
      "Unexpected children in <sendparams> XML node."
    );

    // TODO: Parse sendparams
  }

  async button(node: XmlElement) {
    assert(
      node.children.length === 0,
      "Unexpected children in <button> XML node."
    );

    // TODO: Parse buttons
  }

  async wasabiButton(node: XmlElement) {
    assert(
      node.children.length === 0,
      "Unexpected children in <button> XML node."
    );

    // TODO: Parse buttons
  }

  async toggleButton(node: XmlElement) {
    assert(
      node.children.length === 0,
      "Unexpected children in <button> XML node."
    );

    // TODO: Parse buttons
  }

  async color(node: XmlElement) {
    assert(
      node.children.length === 0,
      "Unexpected children in <color> XML node."
    );

    // TODO: Parse colors
  }

  async slider(node: XmlElement) {
    assert(
      node.children.length === 0,
      "Unexpected children in <slider> XML node."
    );

    // TODO: Parse slider
  }

  async groupdef(node: XmlElement) {
    await this.traverseChildren(node);
  }

  async layer(node: XmlElement) {
    await this.traverseChildren(node);
  }

  async layout(node: XmlElement) {
    await this.traverseChildren(node);
  }

  async gammaset(node: XmlElement) {
    await this.traverseChildren(node);
  }

  async gammagroup(node: XmlElement) {
    await this.traverseChildren(node);
  }

  async component(node: XmlElement) {
    await this.traverseChildren(node);
  }

  async container(node: XmlElement) {
    await this.traverseChildren(node);
  }

  async colorThemesList(node: XmlElement) {
    await this.traverseChildren(node);
  }

  async layoutStatus(node: XmlElement) {
    assert(
      node.children.length === 0,
      "Unexpected children in <layoutStatus> XML node."
    );
  }
  async wasabiStandardframeStatus(node: XmlElement) {
    assert(
      node.children.length === 0,
      "Unexpected children in <wasabiStandardframeStatus> XML node."
    );
  }
  async wasabiStandardframeNoStatus(node: XmlElement) {
    assert(
      node.children.length === 0,
      "Unexpected children in <wasabiStandardframeNoStatus> XML node."
    );
  }
  async status(node: XmlElement) {
    assert(
      node.children.length === 0,
      "Unexpected children in <status> XML node."
    );
  }
  async eqvis(node: XmlElement) {
    assert(
      node.children.length === 0,
      "Unexpected children in <eqvis> XML node."
    );
  }

  async hideobject(node: XmlElement) {
    assert(
      node.children.length === 0,
      "Unexpected children in <hideobject> XML node."
    );
  }

  async wasabiTitleBar(node: XmlElement) {
    assert(
      node.children.length === 0,
      "Unexpected children in <wasabiTitleBar> XML node."
    );
  }

  async trueTypeFont(node: XmlElement) {
    assert(
      node.children.length === 0,
      "Unexpected children in <truetypefont> XML node."
    );
  }

  async include(node: XmlElement) {
    const { file } = node.attributes;
    assert(file != null, "Include element missing `file` attribute");

    const directories = file.split("/");
    const fileName = directories.pop();

    for (const dir of directories) {
      this._path.push(dir);
    }

    const path = [...this._path, fileName].join("/");
    const zipFile = this.getCaseInsensitiveFile(path);
    assert(zipFile != null, `Zip file not found for ${file}`);
    const includedXml = await zipFile.async("string");

    // Note: Included files don't have a single root node, so we add a synthetic one.
    // A different XML parser library might make this unnessesary.
    const parsed = parseXml(`<wrapper>${includedXml}</wrapper>`);

    this.traverseChildren(parsed);

    for (const _dir of directories) {
      this._path.pop();
    }
  }

  skininfo(node: XmlElement) {
    // Ignore this metadata for now
  }

  getCaseInsensitiveFile(filePath: string): JSZipObject {
    return getCaseInsensitiveFile(this._zip, filePath);
  }
}
