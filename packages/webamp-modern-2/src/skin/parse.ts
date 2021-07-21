import parseXml, { XmlDocument, XmlElement } from "@rgrove/parse-xml";
import { assert, getCaseInsensitiveFile, assume } from "../utils";
import JSZip, { JSZipObject } from "jszip";
import Bitmap from "./Bitmap";
import ImageManager from "./ImageManager";
import Layout from "./makiClasses/Layout";
import Group from "./makiClasses/Group";
import Container from "./makiClasses/Container";
import Layer from "./makiClasses/Layer";
import Slider from "./makiClasses/Slider";
import Button from "./makiClasses/Button";
import Text from "./makiClasses/Text";
import Status from "./makiClasses/Status";
import { parse as parseMaki } from "../maki/parser";
import SystemObject from "./makiClasses/SystemObject";
import ToggleButton from "./makiClasses/ToggleButton";
import TrueTypeFont from "./TrueTypeFont";
import GuiObj from "./makiClasses/GuiObj";
import AnimatedLayer from "./makiClasses/AnimatedLayer";
import Vis from "./makiClasses/Vis";
import BitmapFont from "./BitmapFont";
import Color from "./Color";
import GammaGroup from "./GammaGroup";
import ColorThemesList from "./ColorThemesList";
import { UIRoot } from "../UIRoot";

class ParserContext {
  container: Container | null = null;
  parentGroup: Group | /* Group includes Layout | */ null = null;
}

export default class SkinParser {
  _zip: JSZip;
  _imageManager: ImageManager;
  _path: string[] = [];
  _context: ParserContext = new ParserContext();
  _gammaSet: GammaGroup[] = [];
  _uiRoot: UIRoot;

  constructor(
    zip: JSZip,
    uiRoot: UIRoot /* Once UI_ROOT is not a singleton, we can create that objet in the constructor */
  ) {
    this._zip = zip;
    this._imageManager = new ImageManager(zip);
    this._uiRoot = uiRoot;
  }
  async parse(): Promise<UIRoot> {
    // Load built-in xui elements
    // await this.parseFromUrl("assets/xml/xui/standardframe.xml");
    const includedXml = await this.getCaseInsensitiveFile("skin.xml").async(
      "string"
    );

    // Note: Included files don't have a single root node, so we add a synthetic one.
    // A different XML parser library might make this unnessesary.
    const parsed = parseXml(includedXml);

    await this.traverseChildren(parsed);

    return this._uiRoot;
  }

  // Some XML files are built-in, so we want to be able to
  async parseFromUrl(url: string): Promise<void> {
    const response = await fetch(url);
    const xml = await response.text();
    const parsed = parseXmlFragment(xml);
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
      case "animatedlayer":
        return this.animatedLayer(node);
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
      case "eqvis":
        return this.eqvis(node);
      case "colorthemes:list":
        return this.colorThemesList(node);
      case "status":
        return this.status(node);
      case "wasabi:standardframe:nostatus":
      case "wasabi:mainframe:nostatus":
      case "nstatesbutton":
      case "componentbucket":
      case "playlisteditor":
      case "wasabi:tabsheet":
      case "wasabi:standardframe:status":
      case "snappoint":
      case "accelerators":
      case "elementalias":
      case "browser":
      case "grid":
      case "syscmds":
        // TODO
        return;
      // TODO: This should be the default fall through
      // return this.xuiElement(node);
      case "vis":
        return this.vis(node);
      // Note: Included files don't have a single root node, so we add a synthetic one.
      // A different XML parser library might make this unnessesary.
      case "wrapper":
        return this.traverseChildren(node);
      default:
        console.warn(`Unhandled XML node type: ${node.name}`);
        return;
    }
  }

  addToGroup(obj: GuiObj) {
    this._context.parentGroup.addChild(obj);
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
    const previousParent = this._context.parentGroup;
    await this.maybeApplyGroupDef(group, node);
    group.setXmlAttributes(node.attributes);
    this._context.parentGroup = group;
    await this.traverseChildren(node);
    this._context.parentGroup = previousParent;
    this.addToGroup(group);
  }

  async bitmap(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <bitmap> XML node."
    );
    const bitmap = new Bitmap();
    bitmap.setXmlAttributes(node.attributes);
    await bitmap.ensureImageLoaded(this._imageManager);

    this._uiRoot.addBitmap(bitmap);
  }

  async bitmapFont(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <bitmapFont> XML node."
    );
    const font = new BitmapFont();
    font.setXmlAttributes(node.attributes);
    await font.ensureFontLoaded(this._imageManager);

    this._uiRoot.addFont(font);
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
    // assert(id != null, "Script element missing `id` attribute");

    let scriptContents: ArrayBuffer;
    const scriptFile = this.getCaseInsensitiveFile(file);
    assert(scriptFile != null, `ScriptFile file not found at path ${file}`);
    scriptContents = await scriptFile.async("arraybuffer");

    // TODO: Try catch?
    const parsedScript = parseMaki(scriptContents);

    const systemObj = new SystemObject(parsedScript);

    // TODO: Need to investigate how scripts find their group. In corneramp, the
    // script itself is not in any group. `xml/player.xml:8
    if (this._context.parentGroup instanceof Group) {
      this._context.parentGroup.addSystemObject(systemObj);
    } else {
      // Script archives can also live in <groupdef /> but we don't know how to do that.
    }
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

    const color = new Color();
    color.setXmlAttributes(node.attributes);

    this._uiRoot.addColor(color);
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
    this._uiRoot.addGroupDef(node);
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

  async animatedLayer(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <animatedlayer> XML node."
    );

    const layer = new AnimatedLayer();
    layer.setXmlAttributes(node.attributes);
    const { parentGroup } = this._context;
    if (parentGroup == null) {
      console.warn(
        `FIXME: Expected <animatedlayer id="${layer._id}"> to be within a <Layout> | <Group>`
      );
      return;
    }
    parentGroup.addChild(layer);
  }

  async maybeApplyGroupDef(group: Group, node: XmlElement) {
    const id = node.attributes.id;
    const groupDef = this._uiRoot.getGroupDef(id);
    if (groupDef != null) {
      group.setXmlAttributes(groupDef.attributes);
      const previousParentGroup = this._context.parentGroup;
      this._context.parentGroup = group;
      await this.traverseChildren(groupDef);
      this._context.parentGroup = previousParentGroup;
      // TODO: Maybe traverse groupDef's children?
    }
  }

  async layout(node: XmlElement) {
    const layout = new Layout();
    await this.maybeApplyGroupDef(layout, node);
    layout.setXmlAttributes(node.attributes);

    const { container } = this._context;
    assume(container != null, "Expected <Layout> to be in a <container>");
    container.addLayout(layout);

    this._context.parentGroup = layout;
    await this.traverseChildren(node);
  }

  async gammaset(node: XmlElement) {
    this._gammaSet = [];
    await this.traverseChildren(node);
    this._uiRoot.addGammaSet(node.attributes.id, this._gammaSet);
  }

  async gammagroup(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <gammagroup> XML node."
    );
    const gammaGroup = new GammaGroup();
    gammaGroup.setXmlAttributes(node.attributes);
    this._gammaSet.push(gammaGroup);
  }

  async component(node: XmlElement) {
    await this.traverseChildren(node);
  }

  async container(node: XmlElement) {
    const container = new Container();
    container.setXmlAttributes(node.attributes);
    this._context.container = container;
    this._uiRoot.addContainers(container);
    await this.traverseChildren(node);
  }

  async colorThemesList(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <ColorThemes:List> XML node."
    );

    const list = new ColorThemesList();
    list.setXmlAttributes(node.attributes);
    const { parentGroup } = this._context;
    if (parentGroup == null) {
      console.warn(
        `FIXME: Expected <ColorThemes:List id="${list.getId()}"> to be within a <Layout> | <Group>`
      );
      return;
    }
    parentGroup.addChild(list);
  }

  async layoutStatus(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <layoutStatus> XML node."
    );
  }

  async xuiElement(node: XmlElement) {
    assume(node.children.length === 0, "Unexpected children in XUI XML node.");
    const xuiElement = this._uiRoot.getXuiElement(node.name);
    assume(
      xuiElement != null,
      `Expected to find xui element with name "${node.name}".`
    );

    const group = new Group();
    group.setXmlAttributes(xuiElement.attributes);
    const previousParentGroup = this._context.parentGroup;
    this._context.parentGroup = group;

    await this.traverseChildren(xuiElement);
    group.setXmlAttributes(node.attributes);
    await this.traverseChildren(node);

    this._context.parentGroup = previousParentGroup;

    this._context.parentGroup.addChild(group);
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

  async vis(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <vis> XML node."
    );

    const vis = new Vis();
    vis.setXmlAttributes(node.attributes);
    const { parentGroup } = this._context;
    if (parentGroup == null) {
      console.warn(
        `FIXME: Expected <Vis id="${vis._id}"> to be within a <Layout> | <Group>`
      );
      return;
    }
    parentGroup.addChild(vis);
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

    this._uiRoot.addFont(font);
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
      console.warn(`Zip file not found: ${path} out of: `);
      return;
    }
    const includedXml = await zipFile.async("string");

    // Note: Included files don't have a single root node, so we add a synthetic one.
    // A different XML parser library might make this unnessesary.
    const parsed = parseXmlFragment(includedXml);

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

function parseXmlFragment(xml: string): XmlDocument {
  // Note: Included files don't have a single root node, so we add a synthetic one.
  // A different XML parser library might make this unnessesary.
  return parseXml(`<wrapper>${xml}</wrapper>`);
}
