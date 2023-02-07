import { XmlElement } from "@rgrove/parse-xml";
import { UIRoot } from "../UIRoot";
import Bitmap from "./Bitmap";
import BitmapFont from "./BitmapFont";
import { FileExtractor } from "./FileExtractor";
import ImageManager from "./ImageManager";
import AnimatedLayer from "./makiClasses/AnimatedLayer";
import Button from "./makiClasses/Button";
import Container from "./makiClasses/Container";
import Group from "./makiClasses/Group";
import GuiObj from "./makiClasses/GuiObj";
import Layer from "./makiClasses/Layer";
import Layout from "./makiClasses/Layout";
import Text from "./makiClasses/Text";

/**
 * In the world that multiple MP3 player are loaded in webpage,
 * we support multiple skin-formats
 */
export class SkinEngine {
  _uiRoot: UIRoot;
  _imageManager: ImageManager;

  constructor(uiRoot: UIRoot) {
    this._uiRoot = uiRoot;
    this._imageManager = uiRoot.getImageManager();
  }

  /**
   * Useful for quick detect by file extension
   * @param filePath full file address or URL
   * @returns True if this skin engine can parse the skin
   */
  static canProcess = (filePath: string): boolean => {
    return false;
  };

  /**
   * In case the skin can't be detected by file extension,
   * let detect by whether one file name is found
   * @param filePath file name url
   * @returns file name or file extension
   */
  static identifyByFile = (filePath: string): string => {
    return "skin.xml";
  };

  /**
   * Expected ordered index of skinEngine to avoid missleading,
   * In case of several skinEngines support same skin file
   */
  static priority: number = 100;

  /**
   * Provide your custom (binary-file) skin format extractor.
   * * keep it to return null if your skin is zip-like file.
   * @returns An instance of custom FileExtractor
   */
  getFileExtractor(): FileExtractor {
    return null;
  }

  /**
   * The main method
   */
  async buildUI() {
    const uiRoot = this._uiRoot;
    this._uiRoot.logMessage("Parsing XML and initializing images...");
    // const parser = new SkinParser(this._uiRoot);

    // This is always the same as the global singleton.
    // const uiRoot = await parser.parse();
    await this.parseSkin();

    uiRoot.loadTrueTypeFonts();

    uiRoot.enableDefaultGammaSet();

    uiRoot.logMessage("Rendering skin for the first time...");
    uiRoot.draw();
    uiRoot.init();

    uiRoot.logMessage("");
  }

  /**
   * It is according to specific skin engine,
   * how to parse the skin file.
   */
  async parseSkin() {}

  // --- Some basic elements are: --------------------------------------------
  // bitmap, font, text, button, layer, animatedlayer, vis, slider,
  // group, layout, container

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
    if (parent != null) this.addToGroup(gui, parent);
    return gui;
  }

  async newGroup<Type>(
    Type,
    node: XmlElement,
    parent: any
  ): Promise<Awaited<Type>> {
    return await this.newGui(Type, node, parent);
  }

  async bitmap(node: XmlElement): Promise<Bitmap> {
    const bitmap = new Bitmap();
    bitmap.setXmlAttributes(node.attributes);

    this._uiRoot.addBitmap(bitmap);

    // if (this._phase == GROUP_PHASE) {
    await bitmap.ensureImageLoaded(this._imageManager);
    // }
    return bitmap;
  }

  async bitmapFont(node: XmlElement): Promise<BitmapFont> {
    const font = new BitmapFont(this._uiRoot);
    font.setXmlAttributes(node.attributes);

    this._uiRoot.addFont(font);
    await font.ensureImageLoaded(this._imageManager);
    return font;
  }

  async text(node: XmlElement, parent: any): Promise<Text> {
    return this.newGui(Text, node, parent);
  }

  async button(node: XmlElement, parent: any) {
    return await this.newGui(Button, node, parent);
  }

  async animatedLayer(node: XmlElement, parent: any) {
    return this.newGui(AnimatedLayer, node, parent);
  }

  async layer(node: XmlElement, parent: any) {
    return this.newGui(Layer, node, parent);
  }

  async group(node: XmlElement, parent: any): Promise<Group> {
    return await this.newGroup(Group, node, parent);
  }

  async layout(node: XmlElement, parent: any) {
    return this.newGroup(Layout, node, parent);
  }

  async container(node: XmlElement) {
    // const container = await this.newGroup(Container, node, null);
    // this._uiRoot.addContainers(container);
    // return container;
    const container = new Container(this._uiRoot);
    container.setXmlAttributes(node.attributes);
    this._uiRoot.addContainers(container);
    // await this.traverseChildren(node, container);
    return container;
  }
} // === eof SkinEngine class ================================================

export type SkinEngineClass = typeof SkinEngine;
const SKIN_ENGINES: SkinEngineClass[] = [];

export const registerSkinEngine = (Engine: SkinEngineClass) => {
  // if(SKIN_ENGINES.includes(Engine)){
  //   delete SKIN_ENGINES[Engine]
  // }
  SKIN_ENGINES.push(Engine);
};

/**
 * Pick a correct skinEngine clas that able to load skin by url
 * @param filePath file name url
 * @param uiRoot The instance used for check if the a file is available or not
 * @returns A class (not instance) that able to parse & load the skin
 */
export async function getSkinEngineClass(filePath: string): Promise<SkinEngineClass[]> {
  // const process = (Engine: SkinEngineClass) => {
  //   const engine = new Engine();
  // }
  const result: SkinEngineClass[] = [];

  SKIN_ENGINES.sort((a: SkinEngineClass, b: SkinEngineClass): number => {
    return a.priority - b.priority;
  });

  //? #1 take care of path/dirlist: ask if a file exists
  if (filePath.endsWith('/')) {
    for (const Engine of SKIN_ENGINES) {
      const aFileName = Engine.identifyByFile(filePath);
      if(aFileName){ //may return null
        const response = await fetch(filePath + aFileName);
        if (response.status == 200) {
          return [Engine]
        }
      }
    }
  }

  //? #2 ask by filename
  for (const Engine of SKIN_ENGINES) {
    if (Engine.canProcess(filePath)) {
      //return Engine;
      result.push(Engine);
    }
  }
  return result;
}

/**
 * Pick a correct skinEngine clas that able to load skin by url
 * @param filePath file name url
 * @param uiRoot The instance used for check if the a file is available or not
 * @returns A class (not instance) that able to parse & load the skin
 */
export async function getSkinEngineClassByContent(
  classes: SkinEngineClass[],
  filePath: string,
  uiRoot: UIRoot
): Promise<SkinEngineClass> {
  // const process = (Engine: SkinEngineClass) => {
  //   const engine = new Engine();
  // }

  // SKIN_ENGINES.sort((a: SkinEngineClass, b: SkinEngineClass): number => {
  //   return a.priority - b.priority;
  // });

  //? #2 ask by file is exists
  for (const Engine of classes) {
    const aFileName = Engine.identifyByFile(filePath);
    // if (uiRoot.getFileAsString(aFileName) != null) {
    const aFile = await uiRoot.getFileAsString(aFileName);
    if (aFile != null) {
      return Engine;
    }
  }
}
