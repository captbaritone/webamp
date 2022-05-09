import * as Utils from "../utils";
import ImageManager from "./ImageManager";

export default class TrueTypeFont {
  _file: string;
  _id: string;
  _fontFace: FontFace;
  _inlineFamily: string;
  _imageManager: ImageManager;

  setXmlAttributes(attributes: { [attrName: string]: string }) {
    for (const [key, value] of Object.entries(attributes)) {
      this.setXmlAttr(key, value);
    }
  }

  setXmlAttr(key: string, value: string) {
    switch (key.toLowerCase()) {
      case "id":
        this._id = value;
        break;
      case "family":
        this._inlineFamily = value;
        break;
      case "file":
        this._file = value;
        break;
      default:
        return false;
    }
    return true;
  }

  getId() {
    return this._id || "";
  }

  getFontFamily() {
    return `'${this._inlineFamily || this._fontFace.family || this.getId()}'`;
  }

  dispose() {
    document.fonts.delete(this._fontFace);
  }

  getBase64() {
    console.log("getting Base64. me:", this.getId());
    return this._imageManager.getCachedUrl(this._file);
  }

  // dummy ttf has no url, such as Arial
  hasUrl(): boolean {
    return this._imageManager != null;
  }

  // Ensure we've loaded the font into our asset loader.
  async ensureFontLoaded(imageManager: ImageManager) {
    if (!this._file) return;
    Utils.assert(
      this._fontFace == null,
      "Tried to ensure a TrueTypeFont was laoded more than once."
    );
    this._imageManager = imageManager;
    const fontUrl = await imageManager.getUrl(this._file);

    const sanitizedFile = this._file.replace(/\./, "_");
    const fontFamily = `font-${Utils.getId()}-${this.getId()}-${sanitizedFile}`;

    const font = new FontFace(fontFamily, `url(${fontUrl})`);
    this._fontFace = await font.load();
    document.fonts.add(this._fontFace);
  }
}
