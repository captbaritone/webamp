import Bitmap from "./skin/Bitmap";
import { XmlElement } from "@rgrove/parse-xml";
import TrueTypeFont from "./skin/TrueTypeFont";
import { assert, assume } from "./utils";
import BitmapFont from "./skin/BitmapFont";
import Color from "./skin/Color";
import AUDIO_PLAYER from "./skin/AudioPlayer";
import GammaGroup from "./skin/GammaGroup";

class UIRoot {
  // Just a temporary place to stash things
  _bitmaps: Bitmap[] = [];
  _bitmapImages: Map<string, HTMLImageElement> = new Map();
  _fonts: (TrueTypeFont | BitmapFont)[] = [];
  _colors: Color[] = [];
  _groupDefs: XmlElement[] = [];
  _gammaSets: Map<string, GammaGroup[]> = new Map();
  _xuiElements: XmlElement[] = [];

  addBitmap(bitmap: Bitmap) {
    this._bitmaps.push(bitmap);
  }

  // TODO: Maybe return a default bitmap?
  getBitmap(id: string): Bitmap {
    const lowercaseId = id.toLowerCase();
    const found = this._bitmaps.find(
      (bitmap) => bitmap._id.toLowerCase() === lowercaseId
    );

    assert(found != null, `Could not find bitmap with id ${id}.`);
    return found;
  }

  addBitmapImage(id: string, image: HTMLImageElement) {
    this._bitmapImages.set(id, image);
  }

  addFont(font: TrueTypeFont | BitmapFont) {
    this._fonts.push(font);
  }

  addColor(color: Color) {
    this._colors.push(color);
  }

  getColor(id: string): Color {
    const lowercaseId = id.toLowerCase();
    const found = this._colors.find(
      (color) => color._id.toLowerCase() === lowercaseId
    );

    assert(found != null, `Could not find color with id ${id}.`);
    return found;
  }

  getFont(id: string): TrueTypeFont | BitmapFont | null {
    const found = this._fonts.find(
      (font) => font.getId().toLowerCase() === id.toLowerCase()
    );

    if (found == null) {
      console.warn(`Could not find true type font with id ${id}.`);
    }
    return found ?? null;
  }

  addGroupDef(groupDef: XmlElement) {
    this._groupDefs.push(groupDef);
    if (groupDef.attributes.xuitag) {
      this._xuiElements.push(groupDef);
    }
  }

  getGroupDef(id: string): XmlElement | null {
    const lowercaseId = id.toLowerCase();
    const found = this._groupDefs.find(
      (def) => def.attributes.id.toLowerCase() === lowercaseId
    );

    return found ?? null;
  }

  addGammaSet(id: string, gammaSet: GammaGroup[]) {
    this._gammaSets.set(id.toLowerCase(), gammaSet);
  }

  getGammaSet(id: string): GammaGroup[] {
    const found = this._gammaSets.get(id.toLowerCase());
    assume(
      found != null,
      `Could not find gammaset for id "${id}" from set of ${Array.from(
        this._gammaSets.keys()
      ).join(", ")}`
    );
    return found;
  }

  getDefaultGammaSet(): GammaGroup[] {
    const found = Array.from(this._gammaSets.values())[0];
    assume(
      found != null,
      `Could not find default gammaset from set of ${Array.from(
        this._gammaSets.keys()
      ).join(", ")}`
    );
    return found;
  }

  getXuiElement(name: string): XmlElement | null {
    const lowercaseName = name.toLowerCase();
    const found = this._xuiElements.find(
      (def) => def.attributes.xuitag.toLowerCase() === lowercaseName
    );

    return found ?? null;
  }

  dispatch(action: string) {
    switch (action) {
      case "PLAY":
        AUDIO_PLAYER.play();
        break;
      case "PAUSE":
        AUDIO_PLAYER.pause();
        break;
      case "STOP":
        AUDIO_PLAYER.stop();
        break;
      case "NEXT":
        AUDIO_PLAYER.next();
        break;
      case "PREV":
        AUDIO_PLAYER.previous();
        break;
      case "EJECT":
        AUDIO_PLAYER.eject();
        break;
      default:
        assume(false, `Unknown global action: ${action}`);
    }
  }
}

// Global Singleton for now
const UI_ROOT = new UIRoot();
export default UI_ROOT;
