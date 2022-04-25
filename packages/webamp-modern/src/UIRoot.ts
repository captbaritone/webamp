import Bitmap from "./skin/Bitmap";
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
import Container from "./skin/makiClasses/Container";
import Vm from "./skin/VM";
import BaseObject from "./skin/makiClasses/BaseObject";
import AUDIO_PLAYER, { AudioPlayer } from "./skin/AudioPlayer";
import SystemObject from "./skin/makiClasses/SystemObject";
import ComponentBucket from "./skin/makiClasses/ComponentBucket";
import GroupXFade from "./skin/makiClasses/GroupXFade";
import { PlEdit, Track } from "./skin/makiClasses/PlayList";
import PRIVATE_CONFIG from "./skin/PrivateConfig";

export class UIRoot {
  _div: HTMLDivElement = document.createElement("div");
  // Just a temporary place to stash things
  _bitmaps: { [id: string]: Bitmap } = {};
  _fonts: (TrueTypeFont | BitmapFont)[] = [];
  _colors: Color[] = [];
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
  _buckets: { [wndType: string]: ComponentBucket } = {};
  _bucketEntries: { [wndType: string]: XmlElement[] } = {};
  _xFades: GroupXFade[] = [];
  _input: HTMLInputElement = document.createElement("input");
  _skinInfo: { [key: string]: string } = {};
  _eventListener: Emitter = new Emitter();

  // A list of all objects created for this skin.
  _objects: BaseObject[] = [];

  //published
  vm: Vm = new Vm();
  audio: AudioPlayer = AUDIO_PLAYER;
  playlist: PlEdit = new PlEdit();

  constructor() {
    //"https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Auto-Pilot_-_03_-_Seventeen.mp3";
    this._input.type = "file";
    this._input.setAttribute("multiple", "true");
    // document.body.appendChild(this._input);
    // TODO: dispose
    this._input.onchange = this._inputChanged;
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

  getFileAsString: (filePath: string) => Promise<string>;
  getFileAsBytes: (filePath: string) => Promise<ArrayBuffer>;
  getFileAsBlob: (filePath: string) => Promise<Blob>;

  reset() {
    this.deinitSkin();
    this.dispose();
    this._bitmaps = {};
    this._fonts = [];
    this._colors = [];
    this._groupDefs = {};
    this._gammaSets = new Map();
    this._xuiGroupDefs = {};
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

  deinitSkin() {
    // skin is being switched to another skin
    for (const container of this._containers) {
      container.deinit();
    }
    for (const systemObj of this._systemObjects) {
      systemObj.deinit();
    }
  }

  getRootDiv() {
    return this._div;
  }

  addObject(obj: BaseObject) {
    this._objects.push(obj);
  }

  addBitmap(bitmap: Bitmap) {
    const id = bitmap.getId().toLowerCase();
    this._bitmaps[id] = bitmap;
  }

  // TODO: Maybe return a default bitmap?
  getBitmap(id: string): Bitmap {
    const lowercaseId = id.toLowerCase();
    // const found = findLast(
    //   this._bitmaps,
    //   (bitmap) => bitmap._id.toLowerCase() === lowercaseId
    // );
    const found = this._bitmaps[lowercaseId];

    assume(found != null, `Could not find bitmap with id ${id}.`);
    return found;
  }
  getBitmaps(): { [id: string]: Bitmap } {
    // return Object.values(this._bitmaps)
    return this._bitmaps;
  }

  hasBitmap(id: string): boolean {
    const lowercaseId = id.toLowerCase();
    // const found = findLast(
    //   this._bitmaps,
    //   (bitmap) => bitmap._id.toLowerCase() === lowercaseId
    // );
    const found = this._bitmaps[lowercaseId];
    return found ? true : false;
  }

  addFont(font: TrueTypeFont | BitmapFont) {
    this._fonts.push(font);
  }

  addColor(color: Color) {
    this._colors.push(color);
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
    const groupdef_id = groupDef.attributes.id.toLowerCase();
    this._groupDefs[groupdef_id] = groupDef;
    if (groupDef.attributes.xuitag) {
      // this._xuiGroupDefs[groupDef.attributes.xuitag.toLowerCase()] =
      // groupdef_id;
      this.addXuitagGroupDefId(groupDef.attributes.xuitag, groupdef_id)
    }
  }
  addXuitagGroupDefId(xuitag:string, groupdef_id: string) {
    this._xuiGroupDefs[xuitag.toLowerCase()] = groupdef_id.toLowerCase()
  }

  getGroupDef(id: string): XmlElement | null {
    if (!id) return null;
    const groupdef_id = id.toLowerCase();
    return this._groupDefs[groupdef_id];
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
      this._activeGammaSet = found || [];
      PRIVATE_CONFIG.setPrivateString(this.getSkinName(), "_gammagroup_", id);
    }
    this.trigger("colorthemechanged", id || "");
    this._setCssVars();
  }

  enableDefaultGammaSet() {
    // TODO: restore the latest gammaSet picked by user for this skin
    const gammaSetNames = Array.from(this._gammaSets.keys());
    const firstName = gammaSetNames[0] || "";
    const antiBoring = gammaSetNames[1];
    const lastGamma = PRIVATE_CONFIG.getPrivateString(
      this.getSkinName(),
      "_gammagroup_",
      firstName
    );
    this.enableGammaSet(lastGamma);
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
    // css of bitmaps
    for (const bitmap of [...Object.values(this._bitmaps), ...bitmapFonts]) {
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
    // cssRules.unshift(":root{");
    // cssRules.push("}");
    const cssEl = document.getElementById("bitmap-css");
    cssEl.textContent = `:root{${cssRules.join("\n")}}`;
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
  getZip(): JSZip {
    return this._zip;
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

  async getFileAsStringZip(filePath: string): Promise<string> {
    if (!filePath) return null;
    const zipObj = getCaseInsensitiveFile(this._zip, filePath);
    if (!zipObj) return null;
    return await zipObj.async("text");
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

  setSkinInfo(skinInfo: { [key: string]: string }) {
    this._skinInfo = skinInfo;
  }
  getSkinInfo(): { [key: string]: string } {
    return this._skinInfo;
  }
  getSkinName(): string {
    return this.getSkinInfo()["name"];
  }
}

// Global Singleton for now
let UI_ROOT = new UIRoot();
export default UI_ROOT;
