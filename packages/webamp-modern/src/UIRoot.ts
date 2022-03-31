import Bitmap from "./skin/Bitmap";
import JSZip, { JSZipObject } from "jszip";
import { XmlElement } from "@rgrove/parse-xml";
import TrueTypeFont from "./skin/TrueTypeFont";
import {
  assert,
  assume,
  findLast,
  getCaseInsensitiveFile,
  removeAllChildNodes,
} from "./utils";
import BitmapFont from "./skin/BitmapFont";
import Color from "./skin/Color";
import GammaGroup from "./skin/GammaGroup";
import Container from "./skin/makiClasses/Container";
import Vm from "./skin/VM";
import BaseObject from "./skin/makiClasses/BaseObject";
import AUDIO_PLAYER, { AudioPlayer } from "./skin/AudioPlayer";
import SystemObject from "./skin/makiClasses/SystemObject";
import ComponentBucket from "./skin/makiClasses/ComponentBucket";
import GroupXFade from "./skin/makiClasses/GroupXFade";

export class UIRoot {
  _div: HTMLDivElement = document.createElement("div");
  // Just a temporary place to stash things
  _bitmaps: Bitmap[] = [];
  _fonts: (TrueTypeFont | BitmapFont)[] = [];
  _colors: Color[] = [];
  _groupDefs: XmlElement[] = [];
  _gammaSets: Map<string, GammaGroup[]> = new Map();
  _gammaNames = {};
  _dummyGammaGroup: GammaGroup = null;
  _activeGammaSetName: string = "";
  _xuiElements: XmlElement[] = [];
  _activeGammaSet: GammaGroup[] = [];
  _containers: Container[] = [];
  _systemObjects: SystemObject[] = [];
  _buckets: { [wndType: string]: ComponentBucket } = {};
  _bucketEntries: { [wndType: string]: XmlElement[] } = {};
  _xFades: GroupXFade[] = [];

  // A list of all objects created for this skin.
  _objects: BaseObject[] = [];

  vm: Vm = new Vm();
  audio: AudioPlayer = AUDIO_PLAYER;
  getFileAsString: (filePath: string) => Promise<string>;
  getFileAsBytes: (filePath: string) => Promise<ArrayBuffer>;
  getFileAsBlob: (filePath: string) => Promise<Blob>;

  reset() {
    this.dispose();
    this._bitmaps = [];
    this._fonts = [];
    this._colors = [];
    this._groupDefs = [];
    this._gammaSets = new Map();
    this._xuiElements = [];
    this._activeGammaSet = [];
    this._containers = [];
    this._systemObjects = [];
    this._gammaNames = {};
    this._buckets = {};
    this._bucketEntries = {};
    this._xFades = [];
    removeAllChildNodes(this._div);

    // A list of all objects created for this skin.
    this._objects = [];
  }

  getRootDiv() {
    return this._div;
  }

  addObject(obj: BaseObject) {
    this._objects.push(obj);
  }

  addBitmap(bitmap: Bitmap) {
    this._bitmaps.push(bitmap);
  }

  // TODO: Maybe return a default bitmap?
  getBitmap(id: string): Bitmap {
    const lowercaseId = id.toLowerCase();
    const found = findLast(
      this._bitmaps,
      (bitmap) => bitmap._id.toLowerCase() === lowercaseId
    );

    assume(found != null, `Could not find bitmap with id ${id}.`);
    return found;
  }

  addFont(font: TrueTypeFont | BitmapFont) {
    this._fonts.push(font);
  }

  addColor(color: Color) {
    this._colors.push(color);
  }

  getColor(id: string): Color {
    const lowercaseId = id.toLowerCase();
    const found = findLast(
      this._colors,
      (color) => color._id.toLowerCase() === lowercaseId
    );

    assume(found != null, `Could not find color with id ${id}.`);
    return found;
  }

  getFont(id: string): TrueTypeFont | BitmapFont | null {
    const found = findLast(
      this._fonts,
      (font) => font.getId().toLowerCase() === id.toLowerCase()
    );

    if (found == null) {
      console.warn(`Could not find true type font with id ${id}.`);
    }
    return found ?? null;
  }

  addComponentBucket(windowType: string, bucket: ComponentBucket) {
    this._buckets[windowType] = bucket;
  }
  getComponentBucket(windowType: string): ComponentBucket {
    return this._buckets[windowType];
  }
  addBucketEntry(windowType: string, entry: XmlElement) {
    if (!this._bucketEntries[windowType]) {
      this._bucketEntries[windowType] = [];
    }
    this._bucketEntries[windowType].push(entry);
  }
  getBucketEntries(windowType: string): XmlElement[] {
    return this._bucketEntries[windowType] || [];
  }

  addXFade(xfade: GroupXFade) {
    this._xFades.push(xfade);
  }
  getXFades(): GroupXFade[] {
    return this._xFades;
  }

  addGroupDef(groupDef: XmlElement) {
    this._groupDefs.push(groupDef);
    if (groupDef.attributes.xuitag) {
      this._xuiElements.push(groupDef);
    }
  }

  getGroupDef(id: string): XmlElement | null {
    if (!id) return null;
    const lowercaseId = id.toLowerCase();
    const found = findLast(
      this._groupDefs,
      (def) => def.attributes.id.toLowerCase() === lowercaseId
    );

    return found ?? null;
  }

  addContainers(container: Container) {
    this._containers.push(container);
  }

  getContainers(): Container[] {
    return this._containers;
  }

  findContainer(id: string): Container {
    const container = findLast(this.getContainers(), (ct) => ct.hasId(id));
    return container;
  }

  addGammaSet(id: string, gammaSet: GammaGroup[]) {
    const lower = id.toLowerCase();
    this._gammaNames[lower] = id;
    this._gammaSets.set(lower, gammaSet);
  }

  enableGammaSet(id: string | null) {
    if (id) {
      console.log(`Enabling gammaset: '${id}'`);
      const found = this._gammaSets.get(id.toLowerCase());
      assume(
        found != null,
        `Could not find gammaset for id "${id}" from set of ${Array.from(
          this._gammaSets.keys()
        ).join(", ")}`
      );
      this._activeGammaSetName = id;
      this._activeGammaSet = found;
    }
    this._setCssVars();
  }

  enableDefaultGammaSet() {
    // TODO: restore the latest gammaSet picked by user for this skin
    const gammaSetNames = Array.from(this._gammaSets.keys());
    const firstName = gammaSetNames[0];
    const antiBoring = gammaSetNames[1];
    this.enableGammaSet(antiBoring || firstName || null);
  }

  _getGammaGroup(id: string): GammaGroup | null {
    if (!id) {
      return this._getGammaGroupDummy();
    }
    const lower = id.toLowerCase();
    const found = findLast(this._activeGammaSet, (gammaGroup) => {
      return gammaGroup.getId().toLowerCase() === lower;
    });
    return found ?? this._getGammaGroupDummy();
  }

  _getGammaGroupDummy() {
    if (!this._dummyGammaGroup) {
      //lazy create
      this._dummyGammaGroup = new GammaGroup();
      this._dummyGammaGroup.setXmlAttributes({
        id: "dummy",
        value: "0,0,0",
      });
    }
    return this._dummyGammaGroup;
  }

  _setCssVars() {
    const cssRules = [];
    const bitmapFonts: BitmapFont[] = this._fonts.filter(
      (font) => font instanceof BitmapFont && !font.useExternalBitmap()
    ) as BitmapFont[];
    for (const bitmap of [...this._bitmaps, ...bitmapFonts]) {
      const img = bitmap.getImg();
      if (!img) {
        console.warn(`Bitmap/font ${bitmap.getId()} has no img!`);
        continue;
      }
      const groupId = bitmap.getGammaGroup();
      const gammaGroup = this._getGammaGroup(groupId);
      const url = gammaGroup.transformImage(
        img,
        bitmap._x,
        bitmap._y,
        bitmap._width,
        bitmap._height
      );
      cssRules.push(`  ${bitmap.getCSSVar()}: url(${url});`);
    }
    for (const color of this._colors) {
      const groupId = color.getGammaGroup();
      const gammaGroup = this._getGammaGroup(groupId);
      const url = gammaGroup.transformColor(color.getValue());
      cssRules.push(`  ${color.getCSSVar()}: ${url};`);
    }
    cssRules.unshift(":root{");
    cssRules.push("}");
    const cssEl = document.getElementById("bitmap-css");
    cssEl.textContent = cssRules.join("\n");
  }

  getXuiElement(name: string): XmlElement | null {
    const lowercaseName = name.toLowerCase();
    const found = findLast(
      this._xuiElements,
      (def) => def.attributes.xuitag.toLowerCase() === lowercaseName
    );

    return found ?? null;
  }

  loadTrueTypeFonts() {
    const cssRules = [];
    const truetypeFonts: TrueTypeFont[] = this._fonts.filter(
      (font) => font instanceof TrueTypeFont
    ) as TrueTypeFont[];
    for (const ttf of truetypeFonts) {
      if(!ttf.hasUrl()) {
        continue; // some dummy ttf (eg Arial) doesn't has url.
      }
      // src: url(data:font/truetype;charset=utf-8;base64,${ttf.getBase64()}) format('truetype');
      cssRules.push(`@font-face {
        font-family: '${ttf.getId()}';
        src: url(${ttf.getBase64()}) format('truetype');
        font-weight: normal;
        font-style: normal;
      }`)
    }
    const cssEl = document.getElementById("truetypefont-css");
    cssEl.textContent = cssRules.join("\n");
  }

  dispatch(action: string, param: string | null, actionTarget: string | null) {
    switch (action.toLowerCase()) {
      case "play":
        this.audio.play();
        break;
      case "pause":
        this.audio.pause();
        break;
      case "stop":
        this.audio.stop();
        break;
      case "next":
        this.audio.next();
        break;
      case "prev":
        this.audio.previous();
        break;
      case "eject":
        this.audio.eject();
        break;
      case "toggle":
        this.toggleContainer(param);
        break;
      case "close":
        this.closeContainer();
        break;
      default:
        assume(false, `Unknown global action: ${action}`);
    }
  }

  toggleContainer(param: string) {
    const container = this.findContainer(param);
    assume(container != null, `Can not toggle on unknown container: ${param}`);
    container.toggle();
  }

  closeContainer() {
    const btn = document.activeElement;
    const containerEl = btn.closest("container");
    const container_id = containerEl.getAttribute("id").toLowerCase();
    for (const container of this._containers) {
      if (container._id.toLowerCase() == container_id) {
        container.close();
      }
    }
  }

  draw() {
    this._div.setAttribute("id", "ui-root");
    this._div.style.imageRendering = "pixelated";
    for (const container of this.getContainers()) {
      container.draw();
      this._div.appendChild(container.getDiv());
    }
  }

  dispose() {
    this._div.remove();
    for (const obj of this._objects) {
      obj.dispose();
    }
  }

  //? Zip things ========================
  /* because maki need to load a groupdef outside init() */
  _zip: JSZip;

  setZip(zip: JSZip) {
    this._zip = zip;
    if (zip != null) {
      this.getFileAsString = this.getFileAsStringZip;
      this.getFileAsBytes = this.getFileAsBytesZip;
      this.getFileAsBlob = this.getFileAsBlobZip;
    } else {
      this.getFileAsString = this.getFileAsStringPath;
      this.getFileAsBytes = this.getFileAsBytesPath;
      this.getFileAsBlob = this.getFileAsBlobPath;
    }
  }

  //? Path things ========================
  /* needed to avoid direct fetch to root path */
  _skinPath: string;

  setSkinDir(skinPath: string) {
    // required to end with slash/
    this._skinPath = skinPath;
  }

  async getFileAsStringZip(filePath: string): Promise<string> {
    if (!filePath) return null;
    const zipObj = getCaseInsensitiveFile(this._zip, filePath);
    if (!zipObj) return null;
    return await zipObj.async("string");
  }

  async getFileAsBytesZip(filePath: string): Promise<ArrayBuffer> {
    if (!filePath) return null;
    const zipObj = getCaseInsensitiveFile(this._zip, filePath);
    if (!zipObj) return null;
    return await zipObj.async("arraybuffer");
  }

  async getFileAsBlobZip(filePath: string): Promise<Blob> {
    if (!filePath) return null;
    const zipObj = getCaseInsensitiveFile(this._zip, filePath);
    if (!zipObj) return null;
    return await zipObj.async("blob");
  }

  async getFileAsStringPath(filePath: string): Promise<string> {
    const response = await fetch(this._skinPath + filePath);
    return await response.text();
  }

  async getFileAsBytesPath(filePath: string): Promise<ArrayBuffer> {
    const response = await fetch(this._skinPath + filePath);
    return await response.arrayBuffer();
  }

  async getFileAsBlobPath(filePath: string): Promise<Blob> {
    const response = await fetch(this._skinPath + filePath);
    return await response.blob();
  }

  getFileIsExist(filePath: string): boolean {
    const zipObj = getCaseInsensitiveFile(this._zip, filePath);
    return !!zipObj;
  }

  //? System things ========================
  /* because maki need to be run if not inside any Group @init() */
  addSystemObject(systemObj: SystemObject) {
    this._systemObjects.push(systemObj);
  }
  init() {
    for (const systemObject of this._systemObjects) {
      systemObject.init();
    }
  }
  getId() {
    return "UIROOT";
  }
}

// Global Singleton for now
let UI_ROOT = new UIRoot();
export default UI_ROOT;
