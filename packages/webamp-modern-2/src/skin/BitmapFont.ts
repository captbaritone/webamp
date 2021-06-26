import * as Utils from "../utils";
import ImageManager from "./ImageManager";

export default class BitmapFont {
  _file: string;
  _id: string;

  setXmlAttributes(attributes: { [attrName: string]: string }) {
    for (const [key, value] of Object.entries(attributes)) {
      this.setXmlAttr(key, value);
    }
  }

  setXmlAttr(key: string, value: string) {
    switch (key) {
      case "id":
        this._id = value;
        break;
      case "file":
        this._file = value;
      default:
        return false;
    }
    return true;
  }

  getId() {
    return this._id;
  }

  // TODO: Eventually this will need to be rewritten to use something other than fontfamily
  getFontFamily(): string {
    return "Ariel";
  }

  // Ensure we've loaded the font into our asset loader.
  async ensureFontLoaded(imageManager: ImageManager) {
    // TODOv
  }
}
