import parseXml, { XmlDocument, XmlElement } from "@rgrove/parse-xml";
import { assert, getCaseInsensitiveFile, assume } from "../utils";
import UI_ROOT from "../UIRoot";
import JSZip, { JSZipObject } from "jszip";
import Bitmap from "./Bitmap";
import ImageManager from "./ImageManager";
import Layout from "./Layout";
import Group from "./Group";
import Container from "./Container";
import Layer from "./Layer";
import Slider from "./Slider";
import Button from "./Button";
import Text from "./Text";
import Status from "./Status";
import { parse as parseMaki } from "../maki/parser";
import SystemObject from "./SystemObject";
import ToggleButton from "./ToggleButton";
import TrueTypeFont from "./TrueTypeFont";

class ParserContext {
  container: Container | null = null;
  layout: Layout | null = null;
  parentGroup: Group | null = null;
}

export default class SkinParser {
  _zip: JSZip;
  _imageManager: ImageManager;
  _path: string[] = [];
  _context: ParserContext = new ParserContext();
  _containers: Container[] = [];

  constructor(zip: JSZip) {
    this._zip = zip;
    this._imageManager = new ImageManager(zip);
  }
  async parse() {
    const includedXml = await this.getCaseInsensitiveFile("skin.xml").async(
      "string"
    );

    // Note: Included files don't have a single root node, so we add a synthetic one.
    // A different XML parser library might make this unnessesary.
    const parsed = parseXml(includedXml);

    await this.traverseChildren(parsed);
  }
  async traverseChildren(parent: XmlElement | XmlDocument) {
    for (const child of parent.children) {
      if (child instanceof XmlElement) {
        await this.traverseChild(child);
      }
    }
  }
  async traverseChild(node: XmlElement) {
    switch (node.name.toLowerCase()) {
      case "wasabixml":
        return this.wasabiXml(node);
      case "winampabstractionlayer":
        return this.winampAbstractionLayer(node);
      case "include":
        return this.include(node);
      case "skininfo":
        return this.skininfo(node);
      case "elements":
        return this.elements(node);
      case "bitmap":
        return this.bitmap(node);
      case "bitmapfont":
        return this.bitmapFont(node);
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

  async winampAbstractionLayer(node: XmlElement) {
    await this.traverseChildren(node);
  }

  async elements(node: XmlElement) {
    await this.traverseChildren(node);
  }

  async group(node: XmlElement) {
    const group = new Group();
    group.setXmlAttributes(node.attributes);
    this._context.parentGroup = group;
    await this.traverseChildren(node);
  }

  async bitmap(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <bitmap> XML node."
    );
    const bitmap = new Bitmap();
    bitmap.setXmlAttributes(node.attributes);
    await bitmap.ensureImageLoaded(this._imageManager);

    UI_ROOT.addBitmap(bitmap);
  }

  async bitmapFont(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <bitmapFont> XML node."
    );
    console.log(node);
  }

  async text(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <text> XML node."
    );

    const text = new Text();
    text.setXmlAttributes(node.attributes);
    const { parentGroup } = this._context;
    if (parentGroup == null) {
      console.warn(
        `FIXME: Expected <Text id="${text._id}"> to be within a <Layout> | <Group>`
      );
      return;
    }
    parentGroup.addChild(text);
  }

  async script(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <script> XML node."
    );

    const { file, id } = node.attributes;
    assert(file != null, "Script element missing `file` attribute");
    assert(id != null, "Script element missing `id` attribute");

    const scriptFile = this.getCaseInsensitiveFile(file);
    assert(scriptFile != null, `ScriptFile file not found at path ${file}`);
    const scriptContents = await scriptFile.async("arraybuffer");
    // TODO: Try catch?
    const parsedScript = parseMaki(scriptContents);

    const systemObj = new SystemObject(parsedScript);

    assert(
      this._context.parentGroup != null,
      "Expected scripts to only live within a parent group."
    );

    this._context.parentGroup.addSystemObject(systemObj);
  }

  async scripts(node: XmlElement) {
    await this.traverseChildren(node);
  }

  async sendparams(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <sendparams> XML node."
    );

    // TODO: Parse sendparams
  }

  async button(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <button> XML node."
    );

    const button = new Button();
    button.setXmlAttributes(node.attributes);
    const { parentGroup } = this._context;
    if (parentGroup == null) {
      console.warn(
        `FIXME: Expected <Button id="${button._id}"> to be within a <Layout> | <Group>`
      );
      return;
    }
    parentGroup.addChild(button);
  }

  async wasabiButton(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <button> XML node."
    );

    // TODO: Parse buttons
  }

  async toggleButton(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <button> XML node."
    );

    const button = new ToggleButton();
    button.setXmlAttributes(node.attributes);
    const { parentGroup } = this._context;
    if (parentGroup == null) {
      console.warn(
        `FIXME: Expected <ToggleButton id="${button._id}"> to be within a <Layout> | <Group>`
      );
      return;
    }
    parentGroup.addChild(button);
  }

  async color(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <color> XML node."
    );

    // TODO: Parse colors
  }

  async slider(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <slider> XML node."
    );

    const slider = new Slider();
    slider.setXmlAttributes(node.attributes);
    const { parentGroup } = this._context;
    if (parentGroup == null) {
      console.warn(
        `FIXME: Expected <Slider id="${slider._id}"> to be within a <Layout> | <Group>`
      );
      return;
    }
    parentGroup.addChild(slider);
  }

  async groupdef(node: XmlElement) {
    // await this.traverseChildren(node);
  }

  async layer(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <layer> XML node."
    );

    const layer = new Layer();
    layer.setXmlAttributes(node.attributes);
    const { parentGroup } = this._context;
    if (parentGroup == null) {
      console.warn(
        `FIXME: Expected <Layer id="${layer._id}"> to be within a <Layout> | <Group>`
      );
      return;
    }
    parentGroup.addChild(layer);
  }

  async layout(node: XmlElement) {
    const layout = new Layout();
    layout.setXmlAttributes(node.attributes);
    const { container } = this._context;
    assume(container != null, "Expected <Layout> to be in a <container>");
    container.addLayout(layout);

    this._context.layout = layout;
    this._context.parentGroup = layout;
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
    const container = new Container();
    container.setXmlAttributes(node.attributes);
    this._context.container = container;
    this._containers.push(container);
    await this.traverseChildren(node);
  }

  async colorThemesList(node: XmlElement) {
    await this.traverseChildren(node);
  }

  async layoutStatus(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <layoutStatus> XML node."
    );
  }
  async wasabiStandardframeStatus(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <wasabiStandardframeStatus> XML node."
    );
  }
  async wasabiStandardframeNoStatus(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <wasabiStandardframeNoStatus> XML node."
    );
  }
  async status(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <status> XML node."
    );

    const status = new Status();
    status.setXmlAttributes(node.attributes);
    const { parentGroup } = this._context;
    if (parentGroup == null) {
      console.warn(
        `FIXME: Expected <Status id="${status._id}"> to be within a <Layout> | <Group>`
      );
      return;
    }
    parentGroup.addChild(status);
  }
  async eqvis(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <eqvis> XML node."
    );
  }

  async hideobject(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <hideobject> XML node."
    );
  }

  async wasabiTitleBar(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <wasabiTitleBar> XML node."
    );
  }

  async trueTypeFont(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <truetypefont> XML node."
    );
    const font = new TrueTypeFont();
    font.setXmlAttributes(node.attributes);
    await font.ensureFontLoaded(this._imageManager);

    UI_ROOT.addTrueTypeFont(font);
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
    if (zipFile == null) {
      console.warn(`Zip file not found: ${file}`);
      return;
    }
    const includedXml = await zipFile.async("string");

    // Note: Included files don't have a single root node, so we add a synthetic one.
    // A different XML parser library might make this unnessesary.
    const parsed = parseXml(`<wrapper>${includedXml}</wrapper>`);

    await this.traverseChildren(parsed);

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
