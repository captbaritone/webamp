import Bitmap, { genCssVar } from "./skin/Bitmap";
import JSZip, { JSZipObject } from "jszip";
import { XmlElement } from "@rgrove/parse-xml";
import TrueTypeFont from "./skin/TrueTypeFont";
import {
  assert,
  assume,
  Emitter,
  findLast,
  getCaseInsensitiveFile,
  removeAllChildNodes,
} from "./utils";
import BitmapFont from "./skin/BitmapFont";
import Color from "./skin/Color";
import GammaGroup from "./skin/GammaGroup";
import Vm from "./skin/VM";
import AUDIO_PLAYER, { AudioPlayer, Track } from "./skin/AudioPlayer";
import PRIVATE_CONFIG from "./skin/PrivateConfig";
import ImageManager from "./skin/ImageManager";

import Container from "./skin/makiClasses/Container";
import BaseObject from "./skin/makiClasses/BaseObject";
import SystemObject from "./skin/makiClasses/SystemObject";
import ComponentBucket from "./skin/makiClasses/ComponentBucket";
import GroupXFade from "./skin/makiClasses/GroupXFade";
import { PlEdit } from "./skin/makiClasses/PlayList";
import Config from "./skin/makiClasses/Config";
import WinampConfig from "./skin/makiClasses/WinampConfig";
import Avs from "./skin/makiClasses/Avs";

import { SkinEngineClass } from "./skin/SkinEngine";
import { FileExtractor } from "./skin/FileExtractor";
import Application from "./skin/makiClasses/Application";

export class UIRoot {
  _id: string;
  _application: Application;
  _avss: Avs[] = [];
  _config: Config;
  _winampConfig: WinampConfig;

  _div: HTMLDivElement = document.createElement("div");
  _imageManager: ImageManager;
  // Just a temporary place to stash things
  _bitmaps: { [id: string]: Bitmap } = {};
  _fonts: (TrueTypeFont | BitmapFont)[] = [];
  _colors: Color[] = [];
  _elementAlias: { [id: string]: string } = {};
  _dimensions: { [id: string]: number } = {}; //css: width
  _groupDefs: { [id: string]: XmlElement } = {};
  _gammaSets: Map<string, GammaGroup[]> = new Map();
  _gammaNames = {};
  _dummyGammaGroup: GammaGroup = null;
  _activeGammaSetName: string = "";
  _xuiGroupDefs: { [xuitag: string]: /* groupdef_id */ string } = {};
  _activeGammaSet: GammaGroup[] = [];
  _containers: Container[] = [];
  _systemObjects: SystemObject[] = [];
  // _buckets: { [wndType: string]: ComponentBucket } = {};
  _buckets: ComponentBucket[] = [];
  _bucketEntries: { [wndType: string]: XmlElement[] } = {};
  _xFades: GroupXFade[] = [];
  _input: HTMLInputElement = document.createElement("input");
  _skinInfo: { [key: string]: string } = {};
  _skinEngineClass: SkinEngineClass;
  _eventListener: Emitter = new Emitter();
  _additionalCss: string[] = [];

  // A list of all objects created for this skin.
  _objects: BaseObject[] = [];

  //published
  vm: Vm;
  audio: AudioPlayer = AUDIO_PLAYER;
  playlist: PlEdit;

  constructor(id: string = "ui-root") {
    this._id = id;
    //"https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Auto-Pilot_-_03_-_Seventeen.mp3";
    this._input.type = "file";
    this._input.setAttribute("multiple", "true");
    // document.body.appendChild(this._input);
    // TODO: dispose
    this._input.onchange = this._inputChanged;

    this._imageManager = new ImageManager(this);
    this._config = new Config(this);
    this._application = new Application(this);
    this._winampConfig = new WinampConfig(this);
    this.playlist = new PlEdit(this); // must be after _config.
    this.vm = new Vm(this);
  }

  getId(): string {
    return this._id;
  }

  guid2alias(guid: string): string {
    const knownContainerGuids = {
      "{0000000a-000c-0010-ff7b-01014263450c}": "vis", // AVS {visualization}
      "{45f3f7c1-a6f3-4ee6-a15e-125e92fc3f8d}": "pl", // playlist editor
      "{6b0edf80-c9a5-11d3-9f26-00c04f39ffc6}": "ml", // media library
      "{7383a6fb-1d01-413b-a99a-7e6f655f4591}": "con", // config?
      "{7a8b2d76-9531-43b9-91a1-ac455a7c8242}": "lir", // lyric?
      "{a3ef47bd-39eb-435a-9fb3-a5d87f6f17a5}": "dl", // download??
      "{f0816d7b-fffc-4343-80f2-e8199aa15cc3}": "video", // independent video window
    };
    if (guid.includes(":")) {
      guid = guid.split(":")[1];
    }
    guid = guid.toLowerCase();
    return knownContainerGuids[guid] || guid;
  }

  // shortcut of this.Emitter
  on(event: string, callback: Function): Function {
    return this._eventListener.on(event, callback);
  }
  trigger(event: string, ...args: any[]) {
    this._eventListener.trigger(event, ...args);
  }
  off(event: string, callback: Function) {
    this._eventListener.off(event, callback);
  }

  reset() {
    this.deinitSkin();
    this.dispose();
    this._bitmaps = {};
    this._imageManager.dispose();
    this._imageManager = new ImageManager(this); //TODO: dispose first
    this._fonts = [];
    this._colors = [];
    this._groupDefs = {};
    this._gammaSets = new Map();
    this._xuiGroupDefs = {};
    this._activeGammaSet = [];
    this._containers = [];
    this._systemObjects = [];
    this._gammaNames = {};
    this._buckets = [];
    this._bucketEntries = {};
    this._xFades = [];
    this._additionalCss = [];
    removeAllChildNodes(this._div);

    // A list of all objects created for this skin.
    this._objects = [];
  }

  deinitSkin() {
    // skin is being switched to another skin
    for (const container of this._containers) {
      container.dispose();
    }
    for (const systemObj of this._systemObjects) {
      systemObj.dispose();
    }
  }

  getRootDiv() {
    return this._div;
  }

  getImageManager(): ImageManager {
    return this._imageManager;
  }
  setImageManager(imageManager: ImageManager) {
    this._imageManager = imageManager;
  }

  addObject(obj: BaseObject) {
    this._objects.push(obj);
  }

  addBitmap(bitmap: Bitmap) {
    const id = bitmap.getId().toLowerCase();
    this._bitmaps[id] = bitmap;
  }

  getBitmap(id: string): Bitmap {
    let lowercaseId = id.toLowerCase();
    if (!this.hasBitmap(lowercaseId)) {
      lowercaseId = this._elementAlias[lowercaseId];
    }
    const found = this._bitmaps[lowercaseId];

    assume(found != null, `Could not find bitmap with id ${id}.`);
    return found;
  }
  removeBitmap(id: string) {
    delete this._bitmaps[id.toLowerCase()];
  }
  getBitmaps(): { [id: string]: Bitmap } {
    return this._bitmaps;
  }
  hasBitmapFilepath(filePath: string): boolean {
    for (const bitmap of Object.values(this._bitmaps)) {
      if (bitmap.getFile() == filePath) {
        return true;
      }
    }
    return false;
  }

  /**
   * Purely search in _bitmaps, no alias
   * @param id
   * @returns
   */
  hasBitmap(id: string): boolean {
    const lowercaseId = id.toLowerCase();
    const found = this._bitmaps[lowercaseId];
    return found ? true : false;
  }

  addFont(font: TrueTypeFont | BitmapFont) {
    this._fonts.push(font);
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
  getFonts(): (TrueTypeFont | BitmapFont)[] {
    return this._fonts;
  }

  addColor(color: Color) {
    this._colors.push(color);
  }

  addAlias(id: string, target: string) {
    this._elementAlias[id.toLowerCase()] = target.toLowerCase();
  }
  getAlias(id: string): string {
    return this._elementAlias[id.toLowerCase()];
  }

  // to reduce polution of inline style.
  addDimension(id: string, size: number) {
    this._dimensions[id] = size;
  }
  addWidth(id: string, bitmapId: string) {
    const bitmap = this.getBitmap(bitmapId);
    if (bitmap) {
      this.addDimension(id, bitmap.getWidth());
    }
  }
  addHeight(id: string, bitmapId: string) {
    const bitmap = this.getBitmap(bitmapId);
    if (bitmap) {
      this.addDimension(id, bitmap.getHeight());
    }
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

  // addComponentBucket(windowType: string, bucket: ComponentBucket) {
  addComponentBucket(bucket: ComponentBucket) {
    // this._buckets[windowType] = bucket;
    this._buckets.push(bucket);
  }
  // getComponentBucket(windowType: string): ComponentBucket {
  //   return this._buckets[windowType];
  // }
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
    const groupdef_id = groupDef.attributes.id.toLowerCase();
    this._groupDefs[groupdef_id] = groupDef;
    if (groupDef.attributes.xuitag) {
      // this._xuiGroupDefs[groupDef.attributes.xuitag.toLowerCase()] =
      // groupdef_id;
      this.addXuitagGroupDefId(groupDef.attributes.xuitag, groupdef_id);
    }
  }
  addXuitagGroupDefId(xuitag: string, groupdef_id: string) {
    this._xuiGroupDefs[xuitag.toLowerCase()] = groupdef_id.toLowerCase();
  }

  getGroupDef(id: string): XmlElement | null {
    if (!id) return null;
    const groupdef_id = id.toLowerCase();
    return this._groupDefs[groupdef_id];
  }

  addContainers(container: Container): Container {
    this._containers.push(container);
    return container;
  }

  getContainers(): Container[] {
    return this._containers;
  }

  iterContainers(callback: (c: Container) => boolean): Container {
    for (const container of this._containers) {
      if (callback(container)) return container;
    }
  }

  findContainer(id: string): Container {
    // const container = findLast(this.getContainers(), (ct) => ct.hasId(id));
    // return container;
    return this.iterContainers((ct: Container) => {
      return ct.hasId(id);
    });
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
      this._activeGammaSet = found || [];
      PRIVATE_CONFIG.setPrivateString(this.getSkinName(), "_gammagroup_", id);
    }
    this.trigger("colorthemechanged", id || "");
    this._setCssVars();
  }

  enableDefaultGammaSet() {
    const start = performance.now();

    const gammaSetNames = Array.from(this._gammaSets.keys());
    const firstName = gammaSetNames[0] || "";
    const lastGamma = PRIVATE_CONFIG.getPrivateString(
      this.getSkinName(),
      "_gammagroup_",
      firstName
    );
    this.enableGammaSet(lastGamma);

    const end = performance.now();
    console.log(`Loading initial gamma took: ${(end - start) / 1000}s`);
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

  _getBitmapAliases(): { [key: string]: string[] } {
    // const swap = (obj:Object) => Object.entries(Object.entries(obj).map(a => a.reverse()))
    const aliases = {};
    for (const [aliasId, targetId] of Object.entries(this._elementAlias)) {
      if (this.hasBitmap(targetId)) {
        if (!aliases[targetId]) {
          aliases[targetId] = [];
        }
        aliases[targetId].push(aliasId);
      }
    }
    return aliases;
  }

  async _setCssVars() {
    const cssRules = [];

    // bitmap aliases; support multiple names (<elementalias/>)
    const bitmapAliases = this._getBitmapAliases();
    const maybeBitmapAliases = (bitmap: Bitmap): void => {
      const aliases: string[] = bitmapAliases[bitmap.getId().toLowerCase()];
      if (aliases != null) {
        for (const alias of aliases) {
          // vars.push(genCssVar(alias));
          cssRules.push(`${genCssVar(alias)}: var(${bitmap.getCSSVar()});`);
        }
      }
    };

    const bitmapFonts: BitmapFont[] = this._fonts.filter(
      (font) => font instanceof BitmapFont && !font.useExternalBitmap()
    ) as BitmapFont[];
    // css of bitmaps
    for (const bitmap of [...Object.values(this._bitmaps), ...bitmapFonts]) {
      // const img = bitmap.getImg();
      // if (!img) {
      //   console.warn(`Bitmap/font ${bitmap.getId()} has no img!`);
      //   continue;
      // }

      // const groupId = bitmap.getGammaGroup();
      // const gammaGroup = this._getGammaGroup(groupId);
      // const url = await gammaGroup.transformBitmap(bitmap);
      // cssRules.push(`  ${bitmap.getCSSVar()}: url(${url});`);
      // cssRules.push(await bitmap.getGammaTransformedUrl());
      cssRules.push(await bitmap.getGammaTransformedUrl(this));
      //support multiple names
      maybeBitmapAliases(bitmap);
    }
    // await Promise.all(
    //   [...Object.values(this._bitmaps), ...bitmapFonts].map(async (bitmap) => {
    //     cssRules.push(await bitmap.getGammaTransformedUrl(this));
    //     //support multiple names
    //     maybeBitmapAliases(bitmap);
    //   })
    // );
    // css of colors
    for (const color of this._colors) {
      const groupId = color.getGammaGroup();
      const gammaGroup = this._getGammaGroup(groupId);
      const url = gammaGroup.transformColor(color.getValue());
      cssRules.push(`  ${color.getCSSVar()}: ${url};`);
    }
    // css of dimensions
    for (const [dimension, size] of Object.entries(this._dimensions)) {
      cssRules.push(`  --dim-${dimension}: ${size}px;`);
    }
    for (const additionalRule of this._additionalCss) {
      cssRules.push(additionalRule);
    }
    const cssId = `${this._id}-bitmap-css`;
    // const head = document.getElementsByTagName("head")[0];
    // debugger;
    // const cssEl = document.getElementById();
    let cssEl = document.querySelector(`style#${cssId}`);
    if (!cssEl) {
      cssEl = document.createElement("style");
      cssEl.setAttribute("type", "text/css");
      cssEl.setAttribute("id", cssId);
      document.head.appendChild(cssEl);
    }
    cssEl.textContent = `#${this._id} {${cssRules.join("\n")}}`;
    // cssEl.textContent = `:root{${cssRules.join("\n")}}`;
  }
  addAdditionalCss(css: string) {
    this._additionalCss.push(css);
  }

  getXuiElement(xuitag: string): XmlElement | null {
    const lowercaseName = xuitag.toLowerCase();
    const groupdef_id = this._xuiGroupDefs[lowercaseName];
    return this.getGroupDef(groupdef_id);
  }

  loadTrueTypeFonts() {
    const cssRules = [];
    const truetypeFonts: TrueTypeFont[] = this._fonts.filter(
      (font) => font instanceof TrueTypeFont
    ) as TrueTypeFont[];
    for (const ttf of truetypeFonts) {
      if (!ttf.hasUrl()) {
        continue; // some dummy ttf (eg Arial) doesn't has url.
      }
      // src: url(data:font/truetype;charset=utf-8;base64,${ttf.getBase64()}) format('truetype');
      cssRules.push(`@font-face {
        font-family: '${ttf.getId()}';
        src: url(${ttf.getBase64()}) format('truetype');
        font-weight: normal;
        font-style: normal;
      }`);
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
        this.next();
        break;
      case "prev":
        this.previous();
        break;
      case "eject":
        this.eject();
        break;
      case "vis_next":
      case "vis_prev":
      case "vis_f5":
        if (this._avss.length) {
          for (const avs of this._avss) {
            avs.dispatchAction(action, param, actionTarget);
          }
        }
        break;
      case "eq_toggle":
        this.eq_toggle();
        this.trigger("eq_toggle");
        break;
      case "toggle":
        this.toggleContainer(param);
        this.trigger("toggle");
        break;
      case "close":
        this.closeContainer();
        break;
      default:
        assume(false, `Unknown global action: ${action}`);
    }
  }

  getActionState(action: string, param: string, actionTarget: string): boolean {
    if (action != null) {
      switch (action.toLowerCase()) {
        case "eq_toggle":
          return this.audio.getEqEnabled();
        case "toggle":
          return this.getContainerVisible(param);
      }
    }
    return null; //unknown
  }

  next() {
    const currentTrack = this.playlist.getcurrentindex();
    if (currentTrack < this.playlist.getnumtracks() - 1) {
      this.playlist.playtrack(currentTrack + 1);
    }
    this.audio.play();
    //TODO: check if "repeat" is take account
  }

  previous() {
    const currentTrack = this.playlist.getcurrentindex();
    if (currentTrack > 0) {
      this.playlist.playtrack(currentTrack - 1);
    }
    this.audio.play();
    //TODO: check if "repeat" is take account
  }

  eject() {
    // this will call _inputChanged()
    this._input.click();
  }

  eq_toggle() {
    this.audio.setEqEnabled(!this.audio.getEqEnabled());
  }

  _inputChanged = () => {
    this.playlist.clear();
    for (var i = 0; i < this._input.files.length; i++) {
      const newTrack: Track = {
        filename: this._input.files[i].name,
        file: this._input.files[i],
      };
      this.playlist.addTrack(newTrack);
    }

    this.audio.play();
  };

  toggleContainer(param: string) {
    const container = this.findContainer(param);
    assume(container != null, `Can not toggle on unknown container: ${param}`);
    container.toggle();
  }

  getContainerVisible(param: string): boolean {
    const container = this.findContainer(param);
    if (container != null) {
      return container.getVisible();
    }
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
    this._div.setAttribute("id", this._id);
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
  // in rare case, we load from both zip & path.
  // so `_preferZip` is used to decide which file-loader is used by default.
  _preferZip: boolean;

  setZip(zip: JSZip) {
    this._zip = zip;
    this._preferZip = zip != null;
  }
  getZip(): JSZip {
    return this._zip;
  }
  setPreferZip(prefer: boolean) {
    this._preferZip = prefer;
  }

  //? Path things ========================
  /* needed to avoid direct fetch to root path */
  _skinPath: string;

  setSkinDir(skinPath: string) {
    // required to end with slash/
    this._skinPath = skinPath;
  }
  getSkinDir(): string {
    return this._skinPath;
  }

  //? FileExtractor ========================
  _fileExtractor: FileExtractor;

  setFileExtractor(fe: FileExtractor) {
    this._fileExtractor = fe;
  }

  async getFileAsString(filePath: string): Promise<string> {
    return await this._fileExtractor.getFileAsString(filePath);
  }
  async getFileAsBytes(filePath: string): Promise<ArrayBuffer> {
    return await this._fileExtractor.getFileAsBytes(filePath);
  }
  async getFileAsBlob(filePath: string): Promise<Blob> {
    return await this._fileExtractor.getFileAsBlob(filePath);
  }

  // async getFileAsString(filePath: string): Promise<string> {
  //   if (this._preferZip) {
  //     return await this.getFileAsStringZip(filePath);
  //   } else {
  //     return await this.getFileAsStringPath(filePath);
  //   }
  // }
  // async getFileAsBytes(filePath: string): Promise<ArrayBuffer> {
  //   if (this._preferZip) {
  //     return await this.getFileAsBytesZip(filePath);
  //   } else {
  //     return await this.getFileAsBytesPath(filePath);
  //   }
  // }
  // async getFileAsBlob(filePath: string): Promise<Blob> {
  //   if (this._preferZip) {
  //     return await this.getFileAsBlobZip(filePath);
  //   } else {
  //     return await this.getFileAsBlobPath(filePath);
  //   }
  // }

  // async getFileAsStringZip(filePath: string): Promise<string> {
  //   if (!filePath) return null;
  //   const zipObj = getCaseInsensitiveFile(this._zip, filePath);
  //   if (!zipObj) return null;
  //   return await zipObj.async("text");
  // }

  // async getFileAsBytesZip(filePath: string): Promise<ArrayBuffer> {
  //   if (!filePath) return null;
  //   const zipObj = getCaseInsensitiveFile(this._zip, filePath);
  //   if (!zipObj) return null;
  //   return await zipObj.async("arraybuffer");
  // }

  // async getFileAsBlobZip(filePath: string): Promise<Blob> {
  //   if (!filePath) return null;
  //   const zipObj = getCaseInsensitiveFile(this._zip, filePath);
  //   if (!zipObj) return null;
  //   return await zipObj.async("blob");
  // }

  // async getFileAsStringPath(filePath: string): Promise<string> {
  //   const response = await fetch(this._skinPath + filePath);
  //   return await response.text();
  // }

  // async getFileAsBytesPath(filePath: string): Promise<ArrayBuffer> {
  //   const response = await fetch(this._skinPath + filePath);
  //   return await response.arrayBuffer();
  // }

  // async getFileAsBlobPath(filePath: string): Promise<Blob> {
  //   const response = await fetch(this._skinPath + filePath);
  //   return await response.blob();
  // }

  // getFileIsExist(filePath: string): boolean {
  //   const zipObj = getCaseInsensitiveFile(this._zip, filePath);
  //   return !!zipObj;
  // }

  //? System things ========================
  /* because maki need to be run if not inside any Group @init() */
  addSystemObject(systemObj: SystemObject) {
    this._systemObjects.push(systemObj);
  }
  init() {
    for (const systemObject of this._systemObjects) {
      systemObject.init();
    }

    this.logMessage("Initializing Maki...");
    for (const container of this.getContainers()) {
      container.init();
    }

    this.playlist.init();
  }

  setSkinInfo(skinInfo: { [key: string]: string }) {
    this._skinInfo = skinInfo;
  }
  getSkinInfo(): { [key: string]: string } {
    return this._skinInfo;
  }
  getSkinName(): string {
    return this.getSkinInfo()["name"];
  }

  set SkinEngineClass(Engine: SkinEngineClass) {
    this._skinEngineClass = Engine;
  }

  get SkinEngineClass(): SkinEngineClass {
    return this._skinEngineClass;
  }

  get APPLICATION(): Application {
    return this._application;
  }

  get CONFIG(): Config {
    return this._config;
  }

  get WINAMP_CONFIG(): WinampConfig {
    return this._winampConfig;
  }

  //? Logging things ========================
  /**
   * This is a replacement of setStatus('Parsing XML and initializing images...')
   * @param message string to be sent to application
   */
  logMessage(message: string) {
    this.trigger("onlogmessage", message);
  }
}
