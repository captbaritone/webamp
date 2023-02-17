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
import Menu from "./makiClasses/Menu";
import Frame from "./makiClasses/Frame";
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
import AlbumArt from "./makiClasses/AlbumArt";
import WindowHolder from "./makiClasses/WindowHolder";
import Grid from "./makiClasses/Grid";
import ProgressGrid from "./makiClasses/ProgressGrid";
import WasabiTitle from "./makiClasses/WasabiTitle";
import ComponentBucket from "./makiClasses/ComponentBucket";
import GroupXFade from "./makiClasses/GroupXFade";
// import { classResolver } from "./resolver";
import WasabiButton from "./makiClasses/WasabiButton";
import PlayListGui from "./makiClasses/PlayListGui";
import XuiElement from "./makiClasses/XuiElement";
import NStateButton from "./makiClasses/NStateButton";
import EqVis from "./makiClasses/EqVis";
import Images from "./makiClasses/Images";
import { registerSkinEngine, SkinEngine } from "./SkinEngine";
import { FileExtractor, PathFileExtractor } from "./FileExtractor";

export const RESOURCE_PHASE = 1; //full async + Promise.all()
const ResourcesTag = [
  // below are some resource that immediatelly popped (removed) from xml structure.
  // so wouldn't be parsed twice.
  "color",
  "bitmap",
  "bitmapfont",
  "truetypefont",
  "skininfo",
  "accelerators",
  // other resource not listed here are also parsed/loaded first in RESOURCE_PHASE (eg script)
  // but will be kept in xml (unremoved).
];

export const GROUP_PHASE = 2; //full sync mode, because of inheritance

export default class SkinEngineWAL extends SkinEngine {
  _imageManager: ImageManager;
  _path: string[] = [];
  _includedXml = {}; // {file:xmlelement}
  _scripts = {}; // {file:SystemObject}
  _uiRoot: UIRoot;
  _phase: number = 0;
  _res = {
    bitmaps: {
      // 'studio.basetexture': false,
      "studio.button": false,
      "studio.button.pressed": false,
      "studio.scrollbar.vertical.background": false,
      "studio.scrollbar.vertical.left": false,
      "studio.scrollbar.vertical.right": false,
      "studio.scrollbar.vertical.button": false,
      "studio.scrollbar.horizontal.background": false,
      "studio.scrollbar.horizontal.left": false,
      "studio.scrollbar.horizontal.right": false,
      "studio.scrollbar.horizontal.button": false,
    },
    colors: {},
  }; //requested by skin, later compared with UiRoot._bitmaps

  static canProcess = (filePath: string): boolean => {
    return filePath.endsWith(".wal") || filePath.endsWith(".zip") || filePath.endsWith("/");
  };

  static identifyByFile = (filePath: string): string => {
    return "skin.xml";
  };

  static priority: number = 1;

  // bad name, okay I know
  async prepareArial() {
    const node: XmlElement = new XmlElement("truetypefont", {
      id: "Arial",
      family: "Arial",
    });
    await this.trueTypeFont(node, null);
  }

  /**
   * Process
   */
  async parseSkin() {
    // async parse(): Promise<UIRoot> {
    console.log("RESOURCE_PHASE #################");
    this._phase = RESOURCE_PHASE;

    await this.prepareArial();
    this.prepareXuiTags();

    const includedXml = await this._uiRoot.getFileAsString("skin.xml");

    // Note: Included files don't have a single root node, so we add a synthetic one.
    // A different XML parser library might make this unnessesary.
    const parsed = parseXml(includedXml) as unknown as XmlElement;

    await this.traverseChildren(parsed);

    await this._loadBitmaps();

    console.log("GROUP_PHASE #################");
    this._phase = GROUP_PHASE;
    await this.traverseChildren(parsed);

    console.log("BUCKET_PHASE #################");
    await this.rebuildBuckets();

    // return this._uiRoot;
  }

  prepareXuiTags() {
    this._uiRoot.addXuitagGroupDefId(
      "wasabi:mainframe:nostatus",
      "wasabi.mainframe.nostatusbar"
    );
    this._uiRoot.addXuitagGroupDefId(
      "wasabi:medialibraryframe:nostatus",
      "wasabi.medialibraryframe.nostatusbar"
    );
    this._uiRoot.addXuitagGroupDefId(
      "wasabi:playlistframe:nostatus",
      "wasabi.playlistframe.nostatusbar"
    );
    this._uiRoot.addXuitagGroupDefId(
      "wasabi:standardframe:modal",
      "wasabi.standardframe.modal"
    );
    this._uiRoot.addXuitagGroupDefId(
      "wasabi:standardframe:nostatus",
      "wasabi.standardframe.nostatusbar"
    );
    this._uiRoot.addXuitagGroupDefId(
      "wasabi:standardframe:static",
      "wasabi.standardframe.static"
    );
    this._uiRoot.addXuitagGroupDefId(
      "wasabi:standardframe:status",
      "wasabi.standardframe.statusbar"
    );
    this._uiRoot.addXuitagGroupDefId(
      "wasabi:visframe:nostatus",
      "wasabi.visframe.nostatusbar"
    );
  }

  /**
   * Actual bitmap loading
   */
  async _loadBitmaps() {
    await this._solveMissingBitmaps();
    await this._imageManager.ensureBitmapsLoaded();
  }

  // Some XML files are built-in, so we want to be able to
  async parseFromUrl(url: string): Promise<void> {
    const response = await fetch(url);
    const xml = await response.text();
    const parsed = this.parseXmlFragment(xml);
    await this.traverseChildren(parsed);
  }

  _scanRes(node: XmlElement) {
    if (node.attributes.background) {
      this._res.bitmaps[node.attributes.background.toLowerCase()] = false; // just add, dont need to check
    }
  }

  /**
   * Some bitmap al called by group/layer
   * but has no explicit declaration in a loaded skin  */
  async _solveMissingBitmaps() {
    //? checkmark the already availble
    for (const id of Object.keys(this._uiRoot.getBitmaps())) {
      this._res.bitmaps[id] = true;
    }
    //? build not available bitmap
    // ------- ONLY APPLICABLE ONCE WE ABLE TO LOAD FROM FILEPATH -------
    // for (const [key, available] of Object.entries<boolean>(this._res.bitmaps)) {
    //   if (!available) {
    //     const lowercaseId = key.toLowerCase();
    //     const dict = getBitmap_system_elements(lowercaseId);
    //     if(dict!=null){
    //       const bitmapEl = new XmlElement('bitmap', {...dict})
    //       await this.bitmap(bitmapEl);
    //       console.log('solving bitmap:', lowercaseId)
    //     }
    //   }
    // }
  }

  async traverseChildren(node: XmlElement, parent: any = null) {
    //? NOTE: I am considering to speedup resource loading by Promise.all
    //? But in the same time we need to reduce code complexity
    //? So, we do Promise.all only on resource loading phase.

    if (this._phase == RESOURCE_PHASE) {
      return await Promise.all(
        node.children.map((child) => {
          if (child instanceof XmlElement) {
            // console.log('traverse->', parent.name, child.name)
            this._scanRes(child);
            return this.traverseChild(child, parent);
          }
        })
      );
    } else {
      for (const child of node.children) {
        if (child instanceof XmlElement) {
          this._scanRes(child);
          await this.traverseChild(child, parent);
        }
      }
    }
  }

  async traverseChild(node: XmlElement, parent: any) {
    const tag = node.name.toLowerCase();
    switch (tag) {
      case "albumart":
        return this.albumart(node, parent);
      case "wasabixml":
        return this.wasabiXml(node, parent);
      case "winampabstractionlayer":
        return this.winampAbstractionLayer(node, parent);
      case "include":
        return this.include(node, parent);
      case "skininfo":
        return this.skininfo(node, parent);
      case "elements":
        return this.elements(node, parent);
      case "bitmap":
        return this.bitmap(node);
      case "bitmapfont":
        return await this.bitmapFont(node);
      case "color":
        return await this.color(node, parent);
      case "groupdef":
        return this.groupdef(node, parent);
      case "animatedlayer":
        return this.animatedLayer(node, parent);
      case "images":
        return this.images(node, parent);
      case "layer":
        return this.layer(node, parent);
      case "container":
        return this.container(node);
      case "layoutstatus":
        return this.layoutStatus(node, parent);
      case "grid":
        return this.grid(node, parent);
      case "progressgrid":
        return this.progressGrid(node, parent);
      case "button":
        return this.button(node, parent);
      case "togglebutton":
        return this.toggleButton(node, parent);
      case "nstatesbutton":
        return this.nStateButton(node, parent);
      case "rect":
      case "group":
        return this.group(node, parent);
      case "groupxfade":
        return this.groupXFade(node, parent);
      case "layout":
        return this.layout(node, parent);
      case "windowholder":
        return this.windowholder(node, parent);
      case "component":
        return this.component(node, parent);
      case "gammaset":
        return this.gammaset(node, parent);
      case "gammagroup":
        return this.gammagroup(node, parent);
      case "slider":
        return this.slider(node, parent);
      case "script":
        return this.script(node, parent);
      case "scripts":
        return this.scripts(node, parent);
      case "text":
        return this.text(node, parent);
      case "menu":
        return this.menu(node, parent);
      case "wasabi:frame":
      case "frame":
        return this.frame(node, parent);
      case "songticker":
        return this.songticker(node, parent);
      case "hideobject":
      case "sendparams":
        return this.sendparams(node, parent);
      case "wasabi:titlebar":
        return this.wasabiTitleBar(node, parent);
      case "wasabi:button":
        return this.wasabiButton(node, parent);
      case "truetypefont":
        return this.trueTypeFont(node, parent);
      case "eqvis":
        return this.eqvis(node, parent);
      case "colorthemes:mgr":
      case "colorthemes:list":
        return this.colorThemesList(node, parent);
      case "status":
        return this.status(node, parent);
      //? uncomment line below to localize error with XuiElement
      // case "wasabi:mainframe:nostatus":
      // case "wasabi:medialibraryframe:nostatus":
      // case "buttonled":
      // case "fadebutton":
      // case "fadetogglebutton":
      // case "configcheckbox":
      // case "configradio":
      //   return this.dynamicXuiElement(node, parent);
      case "elementalias":
        return this.elementalias(node);
      case "componentbucket":
        return this.componentBucket(node, parent);
      case "playlisteditor":
      case "wasabi:tabsheet":
      case "snappoint":
      case "accelerators":
      case "browser":
      case "syscmds":
        // TODO
        return;
      case "vis":
        return this.vis(node, parent);
      // Note: Included files don't have a single root node, so we add a synthetic one.
      // A different XML parser library might make this unnessesary.
      case "wrapper":
        return this.traverseChildren(node, parent);
      default:
        // TODO: This should be the default fall through
        if (this._uiRoot.getXuiElement(tag)) {
          return this.dynamicXuiElement(node, parent);
        } else if (this._predefinedXuiNode(tag)) {
          return this.dynamicXuiElement(node, parent);
        }
        console.warn(`Unhandled XML node type: ${node.name}`);
        return;
    }
  }

  /**
   * Lazy load xml from freeform
   * @param tag string
   * @returns
   */
  async _predefinedXuiNode(tag: string): Promise<boolean> {
    let xmlRootPath: string = "assets/freeform/xml/";
    let xmlFilePath: string = null;
    switch (tag) {
      case "wasabi:text":
        xmlRootPath += "wasabi/";
        xmlFilePath = "xml/xui/text/text.xml";
        break;
      case "wasabi:standardframe:status":
      case "wasabi:standardframe:nostatus":
      case "wasabi:standardframe:modal":
      case "wasabi:standardframe:static":
        xmlRootPath += "wasabi/";
        xmlFilePath = "xml/xui/standardframe/standardframe.xml";
        break;
      default:
        return false;
    }
    console.log("handling _predefinedXuiNode", tag);
    // push
    const oldZip = this._uiRoot.getZip();
    const oldSkinDir = this._uiRoot.getSkinDir();

    // set
    this._uiRoot.setZip(null);
    this._uiRoot.setSkinDir(xmlRootPath);

    const node = new XmlElement("include", { file: xmlFilePath });
    await this.include(node, null);

    // pop
    this._uiRoot.setSkinDir(oldSkinDir);
    this._uiRoot.setZip(oldZip);
    return true;
  }

  addToGroup(obj: GuiObj, parent: Group) {
    try {
      parent.addChild(obj);
    } catch (err) {
      console.warn("addToGroup failed. child:", obj, "pareng:", parent);
    }
  }

  async newGui<Type>(
    Type,
    node: XmlElement,
    parent: any
  ): Promise<Awaited<Type>> {
    const gui = new Type(this._uiRoot);
    gui.setXmlAttributes(node.attributes);
    this.addToGroup(gui, parent);
    return gui;
  }

  async newGroup<Type>(
    Type,
    node: XmlElement,
    parent: any
  ): Promise<Awaited<Type>> {
    const group = new Type(this._uiRoot);
    await this.maybeApplyGroupDef(group, node);
    group.setXmlAttributes(node.attributes);
    await this.traverseChildren(node, group);
    this.addToGroup(group, parent);
    if (node.attributes.instanceid)
      group.setxmlparam("id", node.attributes.instanceid);
    return group;
  }

  /* Individual Element Parsers */

  async wasabiXml(node: XmlElement, parent: any) {
    await this.traverseChildren(node, parent);
  }

  async winampAbstractionLayer(node: XmlElement, parent: any) {
    await this.traverseChildren(node, parent);
  }

  async elements(node: XmlElement, parent: any) {
    await this.traverseChildren(node, parent);
  }

  async group(node: XmlElement, parent: any): Promise<Group> {
    return await this.newGroup(Group, node, parent);
  }

  async groupXFade(node: XmlElement, parent: any) {
    const xFade: GroupXFade = await this.newGroup(GroupXFade, node, parent);
    this._uiRoot.addXFade(xFade);
  }

  async componentBucket(node: XmlElement, parent: any) {
    const bucket: ComponentBucket = await this.newGroup(
      ComponentBucket,
      node,
      parent
    );
    // if (!bucket.getWindowType()){
    //   await this._loadThinger(bucket);
    // }
    // this._uiRoot.addComponentBucket(bucket.getWindowType(), bucket);
    this._uiRoot.addComponentBucket( bucket);
  }

  async _loadThinger(bucket: ComponentBucket) {
    const ifileExtractor: FileExtractor = this._uiRoot._fileExtractor;
    const fileExtractor: FileExtractor = new PathFileExtractor();
    this._uiRoot.setFileExtractor(fileExtractor);
  }

  async dynamicXuiElement(node: XmlElement, parent: any) {
    const xuitag: string = node.name; // eg. Wasabi:MainFrame:NoStatus
    const xuiEl: XmlElement = this._uiRoot.getXuiElement(xuitag);
    if (xuiEl) {
      const xuiFrame = new XmlElement("dummy", { id: xuiEl.attributes.id });
      const Element: XuiElement = await this.newGroup(
        XuiElement,
        xuiFrame,
        parent
      );
      Element.setXmlAttributes(node.attributes);
      // await this.maybeApplyGroupDef(frame, xuiFrame);

      //?content
      if (node.attributes.content) {
        const content = await this.group(
          new XmlElement("group", {
            id: node.attributes.content,
            w: "0",
            h: "0",
            relatw: "1",
            relath: "1",
          }),
          Element
        );
        Element.addChild(content);
      }
    }
  }

  async bitmap(node: XmlElement): Promise<Bitmap> {
    assume(
      node.children.length === 0,
      "Unexpected children in <bitmap> XML node."
    );
    const bitmap = new Bitmap();
    bitmap.setXmlAttributes(node.attributes);
    //this._imageManager.addBitmap(bitmap);

    this._uiRoot.addBitmap(bitmap);
    this._res.bitmaps[node.attributes.id] = true;

    // if (this._phase == GROUP_PHASE) {
    // this._imageManager.setBimapImg(bitmap);
    await bitmap.ensureImageLoaded(this._imageManager);
    // }
    return bitmap;
  }

  async bitmapFont(node: XmlElement): Promise<BitmapFont> {
    assume(
      node.children.length === 0,
      "Unexpected children in <bitmapFont> XML node."
    );
    const font = new BitmapFont(this._uiRoot);
    font.setXmlAttributes(node.attributes);

    const externalBitmap = this._isExternalBitmapFont(font);
    if (externalBitmap) {
      font.setExternalBitmap(true);
    } else {
      // this._imageManager.addBitmap(font);
    }

    this._uiRoot.addFont(font);
    return font;
  }

  _isExternalBitmapFont(font: BitmapFont) {
    return font._file.indexOf("/") < 0;
  }

  async text(node: XmlElement, parent: any): Promise<Text> {
    return this.newGui(Text, node, parent);
  }

  async menu(node: XmlElement, parent: any): Promise<Menu> {
    return this.newGui(Menu, node, parent);
  }
  async frame(node: XmlElement, parent: any): Promise<Frame> {
    const frame = (await this.newGui(Frame, node, parent)) as Frame;
    let i = 0;
    for(const direction of ['left', 'top', 'right', 'bottom']){
      const group_id = node.attributes[direction];
      if (group_id != null){
        const pair = await this.group(
          new XmlElement("group", {
            id: group_id,
            // x: `${400*i}`,
            // y: "26",
            // w: '390',
            // h: "0",
            // // relatw: "1",
            // relath: "1",
          }),
          // parent
          frame
        );
        i ++;
        // Element.addChild(content);
      }
    }

    return frame;
  }

  async songticker(node: XmlElement, parent: any): Promise<Text> {
    const text = await this.text(node, parent);
    text.setxmlparam("display", "songtitle");
    text.setxmlparam("ticker", "1");
    return text;
  }

  async wasabiTitleBar(node: XmlElement, parent: any) {
    const group = (await this.newGroup(WasabiTitle, node, parent)) as Group;
    let text = null;

    //? Search Wasabi Inheritace
    const xuitag: string = node.name; // eg "Wasabi:Titlebar"
    const xuiEl: XmlElement = this._uiRoot.getXuiElement(xuitag);
    if (xuiEl && node.attributes.id != xuiEl.attributes.id) {
      const xuiFrame = new XmlElement("groupdev", { id: xuiEl.attributes.id });
      await this.maybeApplyGroupDef(group, xuiFrame);
      text = group.findobject(xuiEl.attributes.embed_xui);
    } else {
      text = group.findobject("window.titlebar.title");
    }

    if (text) {
      text.setxmlparam("text", ":componentname"); // or display:componentname?
    }

    return text;
  }

  async script(node: XmlElement, parent: any) {
    assume(
      node.children.length === 0,
      "Unexpected children in <script> XML node."
    );

    let { file, id, param } = node.attributes;
    assert(file != null, "Script element missing `file` attribute");
    if (file.startsWith("../Winamp Modern/")) {
      file = file.replace("../Winamp Modern/", "");
      node.attributes.file = file;
    }
    // assert(id != null, "Script element missing `id` attribute");

    let maki = this._scripts[file];

    if (!maki) {
      this._scripts[file] = true; //just a signal to not load it twice.

      const scriptContents: ArrayBuffer = await this._uiRoot.getFileAsBytes(
        file
      );
      assert(
        scriptContents != null,
        `ScriptFile file not found at path ${file}`
      );

      this._scripts[file] = scriptContents;
      return;
    }

    if (this._phase == RESOURCE_PHASE) {
      //some maki may included in several place.
      //ignore for now
      return;
    }

    const maki_id = `${file} (id=${id||"''"})`;
    console.log("parsing.maki:", maki_id);
    const parsedScript = parseMaki(maki, maki_id);

    const systemObj = new SystemObject(this._uiRoot, parsedScript, param, maki_id);

    // TODO: Need to investigate how scripts find their group. In corneramp, the
    // script itself is not in any group. `xml/player.xml:8
    if (parent instanceof Group) {
      parent.addSystemObject(systemObj);
    } else {
      // Script archives can also live in <groupdef /> Lets UI_ROOT handle that.
      console.log(">>ScriptLoad at non group: ", `@${file}`, typeof parent);
      this._uiRoot.addSystemObject(systemObj);
    }
  }

  async scripts(node: XmlElement, parent: any) {
    await this.traverseChildren(node, parent);
  }

  async sendparams(node: XmlElement, parent: GuiObj) {
    assume(
      node.children.length === 0,
      "Unexpected children in <sendparams> XML node."
    );

    // TODO: Parse sendparams
    if (parent instanceof GuiObj) {
      parent._metaCommands.push(node);
    }
  }

  async button(node: XmlElement, parent: any): Promise<Button> {
    return await this.newGui(Button, node, parent);
  }

  async wasabiButton(node: XmlElement, parent: any) {
    // assure backgrounds are loaded:
    this._res.bitmaps["studio.button"] = false;
    this._res.bitmaps["studio.button.pressed"] = false;

    this._res.bitmaps["studio.button.upperLeft"] = false;
    this._res.bitmaps["studio.button.top"] = false;
    this._res.bitmaps["studio.button.upperRight"] = false;
    this._res.bitmaps["studio.button.left"] = false;
    this._res.bitmaps["studio.button.middle"] = false;
    this._res.bitmaps["studio.button.right"] = false;
    this._res.bitmaps["studio.button.lowerLeft"] = false;
    this._res.bitmaps["studio.button.bottom"] = false;
    this._res.bitmaps["studio.button.lowerRight"] = false;

    this._res.bitmaps["studio.button.pressed.upperLeft"] = false;
    this._res.bitmaps["studio.button.pressed.top"] = false;
    this._res.bitmaps["studio.button.pressed.upperRight"] = false;
    this._res.bitmaps["studio.button.pressed.left"] = false;
    this._res.bitmaps["studio.button.pressed.middle"] = false;
    this._res.bitmaps["studio.button.pressed.right"] = false;
    this._res.bitmaps["studio.button.pressed.lowerLeft"] = false;
    this._res.bitmaps["studio.button.pressed.bottom"] = false;
    this._res.bitmaps["studio.button.pressed.lowerRight"] = false;

    await this.buildWasabiButtonFace();

    return this.newGui(WasabiButton, node, parent);
  }

  async buildWasabiButtonFace() {
    const face = this._uiRoot.getBitmap("studio.button");
    if (!face) {
      let upperLeft = this._uiRoot.getBitmap("studio.button.upperLeft");
      if (upperLeft) {
        //? default
        let bottomRight = this._uiRoot.getBitmap("studio.button.lowerRight");
        let dict: {
          [attrName: string]: string;
        } = {
          id: "studio.button",
          file: upperLeft.getFile(),
          x: String(upperLeft.getLeft()),
          y: String(upperLeft.getTop()),
          w: String(
            bottomRight.getLeft() - upperLeft.getLeft() + bottomRight.getWidth()
          ),
          h: String(
            bottomRight.getTop() - upperLeft.getTop() + bottomRight.getHeight()
          ),
        };
        const btnFace = new XmlElement("bitmap", { ...dict });
        await this.bitmap(btnFace);

        //? pressed
        upperLeft = this._uiRoot.getBitmap("studio.button.pressed.upperLeft");
        bottomRight = this._uiRoot.getBitmap(
          "studio.button.pressed.lowerRight"
        );
        dict = {
          id: "studio.button.pressed",
          file: upperLeft.getFile(),
          x: String(upperLeft.getLeft()),
          y: String(upperLeft.getTop()),
          w: String(
            bottomRight.getLeft() - upperLeft.getLeft() + bottomRight.getWidth()
          ),
          h: String(
            bottomRight.getTop() - upperLeft.getTop() + bottomRight.getHeight()
          ),
        };
        const btnPressedFace = new XmlElement("bitmap", { ...dict });
        await this.bitmap(btnPressedFace);
      } else {
        // we can't find ingredient, lets search the raw material
        if (!this._uiRoot.hasBitmapFilepath("window/window-elements.png"))
          return;

        //? default
        let dict: {
          [attrName: string]: string;
        } = {
          id: "studio.button",
          file: "window/window-elements.png",
          x: "1",
          y: "135",
          w: "31",
          h: "31",
        };
        const btnFace = new XmlElement("bitmap", { ...dict });
        await this.bitmap(btnFace);

        //? pressed
        dict = {
          id: "studio.button.pressed",
          file: "window/window-elements.png",
          x: "67",
          y: "135",
          w: "31",
          h: "31",
        };
        const btnPressedFace = new XmlElement("bitmap", { ...dict });
        await this.bitmap(btnPressedFace);
      }

      //TODO: why this new created bitmap doesn't loaded?
      // await this._imageManager.loadUniquePaths();
      await this._imageManager.ensureBitmapsLoaded();
    }
  }

  async toggleButton(node: XmlElement, parent: any) {
    return this.newGui(ToggleButton, node, parent);
  }

  async nStateButton(node: XmlElement, parent: any) {
    return this.newGui(NStateButton, node, parent);
  }

  async color(node: XmlElement, parent: any) {
    assume(
      node.children.length === 0,
      "Unexpected children in <color> XML node."
    );

    const color = new Color();
    color.setXmlAttributes(node.attributes);

    this._uiRoot.addColor(color);
  }

  async elementalias(node: XmlElement) {
    assume(
      node.children.length === 0,
      "Unexpected children in <elementalias> XML node."
    );

    //sample: <elementalias id="studio.button" target="playlist.scroll.thumb"/>
    this._uiRoot.addAlias(node.attributes.id, node.attributes.target);
  }

  async slider(node: XmlElement, parent: any) {
    return this.newGui(Slider, node, parent);
  }

  async groupdef(node: XmlElement, parent: any) {
    this._uiRoot.addGroupDef(node);
    //check if it is a bucket.entry, then auto create here
    if (node.attributes.windowtype) {
      await this.appendToBucket(node);
    }
  }

  async appendToBucket(groupDef: XmlElement) {
    const windowType = groupDef.attributes.windowtype;
    // in async mode, bucket may not already loaded.
    // so we register entry here, will excuted later in end of parse()
    groupDef.attributes.attached = "0";
    this._uiRoot.addBucketEntry(windowType, groupDef);

    // in synchronouse mode, bucket may already exists
    // const bucket = this._uiRoot.getComponentBucket(windowType);
    // if (bucket) {
    //   // custom signal to be not attached to bucket twice
    //   groupDef.attributes.attached = "1";
    //   const dummyNode = new XmlElement("dummy", {
    //     id: groupDef.attributes.id,
    //   });
    //   await this.group(dummyNode, bucket);
    // }
  }

  async rebuildBuckets() {
    for (const bucket of this._uiRoot._buckets) {
      const wndType = bucket._wndType;
      console.log(`rebuild Bucket "${wndType}"`, bucket)
      for (const entry of this._uiRoot.getBucketEntries(wndType)) {
        // if (entry.attributes.attached == "0") {
          const dummyNode = new XmlElement("dummy", {
            id: entry.attributes.id,
          });
          await this.group(dummyNode, bucket);
        // }
      }
    }
  }


  // assure that bucket entries are attached
  async rebuildBuckets0() {
    for (const [wndType, bucket] of Object.entries<ComponentBucket>(
      this._uiRoot._buckets
    )) {
      console.log(`rebuild Bucket "${wndType}"`, bucket)
      for (const entry of this._uiRoot.getBucketEntries(wndType)) {
        if (entry.attributes.attached == "0") {
          const dummyNode = new XmlElement("dummy", {
            id: entry.attributes.id,
          });
          await this.group(dummyNode, bucket);
        }
      }
    }
  }

  async albumart(node: XmlElement, parent: any) {
    return this.newGui(AlbumArt, node, parent);
  }

  async layer(node: XmlElement, parent: any) {
    return this.newGui(Layer, node, parent);
  }

  async grid(node: XmlElement, parent: any) {
    return this.newGui(Grid, node, parent);
  }

  async progressGrid(node: XmlElement, parent: any) {
    return this.newGui(ProgressGrid, node, parent);
  }

  async animatedLayer(node: XmlElement, parent: any) {
    return this.newGui(AnimatedLayer, node, parent);
  }

  async images(node: XmlElement, parent: any) {
    return this.newGui(Images, node, parent);
  }

  async maybeApplyGroupDef(group: GuiObj, node: XmlElement) {
    const id = node.attributes.id;
    await this.maybeApplyGroupDefId(group, id);
  }

  async maybeApplyGroupDefId(group: GuiObj, groupdef_id: string) {
    const groupDef = this._uiRoot.getGroupDef(groupdef_id);
    if (groupDef != null) {
      group.setXmlAttributes(groupDef.attributes);
      if (groupDef.attributes.inherit_group) {
        await this.maybeApplyGroupDefId(
          group,
          groupDef.attributes.inherit_group
        );
      }
      await this.traverseChildren(groupDef, group);
      // TODO: Maybe traverse groupDef's children?
    }
  }

  async layout(node: XmlElement, parent: any) {
    return this.newGroup(Layout, node, parent);
  }

  async gammaset(node: XmlElement, parent: any) {
    const gammaSet = [];
    await this.traverseChildren(node, gammaSet);
    this._uiRoot.addGammaSet(node.attributes.id, gammaSet);
  }

  async gammagroup(node: XmlElement, parent: any) {
    assume(
      node.children.length === 0,
      "Unexpected children in <gammagroup> XML node."
    );
    const gammaGroup = new GammaGroup();
    gammaGroup.setXmlAttributes(node.attributes);
    parent.push(gammaGroup);
  }

  async component(node: XmlElement, parent: any) {
    //TODO: parse dynamic element by guid value
    if (
      node.attributes.param == "guid:{45F3F7C1-A6F3-4ee6-A15E-125E92FC3F8D}"
    ) {
      await this.buildWasabiButtonFace();
      return this.newGui(PlayListGui, node, parent);
    }
    await this.traverseChildren(node, parent);
  }
  async windowholder(node: XmlElement, parent: any): Promise<Frame> {
    const frame = (await this.newGroup(WindowHolder, node, parent) as Frame);
    //TODO: parse dynamic element by guid value
    const hold = node.attributes.hold;
    // console.log('window-holder'); debugger;
    if (hold && hold.toLowerCase() == "guid:{45f3f7c1-a6f3-4ee6-a15e-125e92fc3f8d}") {
      await this.buildWasabiButtonFace();
      const node2 = new XmlElement("component", {
        fitparent: "1",
      })
      await this.newGui(PlayListGui, node2, frame);
    }

    return frame;
  }


  async container(node: XmlElement): Promise<Container> {
    const container = new Container(this._uiRoot);
    container.setXmlAttributes(node.attributes);
    this._uiRoot.addContainers(container);
    await this.traverseChildren(node, container);
    return container;
  }

  async colorThemesList(node: XmlElement, parent: any) {
    this.buildWasabiScrollbarDimension();
    return this.newGui(ColorThemesList, node, parent);
  }

  buildWasabiScrollbarDimension() {
    this._uiRoot.addWidth("vscrollbar-width", "wasabi.scrollbar.vertical.left");
    this._uiRoot.addHeight(
      "vscrollbar-btn-height",
      "wasabi.scrollbar.vertical.left"
    );
    this._uiRoot.addHeight(
      "vscrollbar-thumb-height",
      "wasabi.scrollbar.vertical.button"
    );
    this._uiRoot.addHeight(
      "vscrollbar-thumb-height2",
      "studio.scrollbar.vertical.button"
    );

    this._uiRoot.addHeight(
      "hscrollbar-height",
      "wasabi.scrollbar.horizontal.left"
    );
    this._uiRoot.addWidth(
      "hscrollbar-btn-width",
      "wasabi.scrollbar.horizontal.left"
    );
    this._uiRoot.addWidth(
      "hscrollbar-thumb-width",
      "wasabi.scrollbar.horizontal.button"
    );
    this._uiRoot.addWidth(
      "hscrollbar-thumb-width2",
      "studio.scrollbar.horizontal.button"
    );
  }

  async layoutStatus(node: XmlElement, parent: any) {
    assume(
      node.children.length === 0,
      "Unexpected children in <layoutStatus> XML node."
    );
  }

  async xuiElement(node: XmlElement, parent: any) {
    assume(node.children.length === 0, "Unexpected children in XUI XML node.");
  }

  async status(node: XmlElement, parent: any) {
    return this.newGui(Status, node, parent);
  }

  async eqvis(node: XmlElement, parent: any): Promise<EqVis> {
    assume(
      node.children.length === 0,
      "Unexpected children in <eqvis> XML node."
    );
    return await this.newGui(EqVis, node, parent);
  }

  async vis(node: XmlElement, parent: any): Promise<Vis> {
    return this.newGui(Vis, node, parent);
  }

  async trueTypeFont(node: XmlElement, parent: any) {
    assume(
      node.children.length === 0,
      "Unexpected children in <truetypefont> XML node."
    );
    const font = new TrueTypeFont();
    font.setXmlAttributes(node.attributes);
    await font.ensureFontLoaded(this._imageManager);

    this._uiRoot.addFont(font);
  }

  async include(node: XmlElement, parent: any) {
    const { file, parent_path } = node.attributes;
    assert(file != null, "Include element missing `file` attribute");
    const promises = [];
    const includes = [];

    let savedDocument = this._includedXml[file];
    if (!savedDocument) {
      this._includedXml[file] = true; //just immediatelly

      const parent_dir = parent_path ? parent_path.split("/") : [];

      const directories = file.replace("@DEFAULTSKINPATH@", "").split("/");
      const fileName = directories.pop();

      const path = [...parent_dir, ...directories, fileName].join("/");

      let includedXml: string;
      try {
        includedXml = await this._uiRoot.getFileAsString(path);
      } catch (err) {
        console.warn(`botFailed to load: ${path}. par:${parent_path}`);
      }
      if (includedXml == null) {
        console.warn(`Zip file not found: ${path} out of: `);
        return;
      }

      const current_dir = [...parent_dir, ...directories].join("/");

      var self = this;
      const recursiveScanChildren = (mother: XmlElement) => {
        var nonGroupDefs = [];
        for (const element of mother.children) {
          if (element instanceof XmlElement) {
            const lower = element.name.toLowerCase();
            if (lower == "groupdef") {
              recursiveScanChildren(element);
              self.groupdef(element, null);
              continue;
            } else if (ResourcesTag.indexOf(lower) >= 0) {
              promises.push(self.traverseChild(element, parent));
              continue;
            } else if (lower == "script") {
              promises.push(self.script(element, parent));
            } else if (lower == "include") {
              element.attributes.parent_path = current_dir;
              element.attributes["parent_path"] = current_dir;
              includes.push(element); //recursive soon
            }
            recursiveScanChildren(element);
            nonGroupDefs.push(element);
          }
        }
        //replace children
        mother.children.splice(0, mother.children.length, ...nonGroupDefs);
      }; //eof function

      // Note: Included files don't have a single root node, so we add a synthetic one.
      // A different XML parser library might make this unnessesary.
      savedDocument = this.parseXmlFragment(includedXml);
      recursiveScanChildren(savedDocument);

      this._includedXml[file] = savedDocument;

      for (const element of includes) {
        promises.push(self.include(element, parent));
      }
      return Promise.all(promises);
    }

    if (this._phase == RESOURCE_PHASE) {
      //some maki may included in several place.
      //ignore for now
      return;
    }
    if (
      savedDocument instanceof XmlElement ||
      savedDocument instanceof XmlDocument
    ) {
      await this.traverseChildren(savedDocument as XmlElement, parent);
    }
  }

  async scanIncludes(node: XmlElement, parent: any) {
    return await Promise.all(
      node.children.map((child) => {
        if (
          child instanceof XmlElement &&
          child.name.toLowerCase() == "include"
        ) {
          return this.include(child, parent);
        }
      })
    );
  }


  skininfo(node: XmlElement, parent: any) {
    const skinInfo = {};
    for (const child of node.children) {
      if (child instanceof XmlElement) {
        const tag = child.name.toLowerCase();
        skinInfo[tag] = child.text;
      }
    }
    this._uiRoot.setSkinInfo(skinInfo);
  }

  /**
   * inheritable
   * @param xml string in valid xml tags.
   * @returns xmlElement object
   */
  parseXmlFragment(xml: string): XmlElement {
    // Note: Included files don't have a single root node, so we add a synthetic one.
    // A different XML parser library might make this unnessesary.
    return parseXml(`<wrapper>${xml}</wrapper>`) as unknown as XmlElement;
  }
}

registerSkinEngine(SkinEngineWAL);
