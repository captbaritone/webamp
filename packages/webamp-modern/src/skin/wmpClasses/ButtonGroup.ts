import Group from "../makiClasses/Group";

// https://docs.microsoft.com/en-us/windows/win32/wmp/buttongroup-element
export default class ButtonGroup extends Group {
  _mappingImage: string;
  _image: string;
  _hoverImage: string;
  _downImage: string;
  _hoverDownImage: string;
  _disabledImage: string;

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }

    switch (key) {
      case "mappingimage":
        this._mappingImage = value;
        break;
      case "image":
        this._image = value;
        break;
      case "hoverimage":
        this._hoverImage = value;
        break;
      case "downimage":
        this._downImage = value;
        break;
      case "hoverdownimage":
        this._hoverDownImage = value;
        break;
      case "disabledimage":
        this._disabledImage = value;
        break;
      default:
        return false;
    }
    return true;
  }

  _renderBackground() {
    const setCssVar = (bitmapId: string, bitmapMethod: string) => {
      if (bitmapId != null) {
        const bitmap = this._uiRoot.getBitmap(bitmapId);
        if (bitmap != null) {
          bitmap[bitmapMethod](this._div);
        }
      }
    };

    setCssVar(this._image, "setAsBackground");
    setCssVar(this._hoverImage, "setAsHoverBackground");
    setCssVar(this._downImage, "setAsDownBackground");
    setCssVar(this._hoverDownImage, "setAsHoverDownBackground");
    setCssVar(this._disabledImage, "setAsDisabledBackground");
  }

  // This shadows `getheight()` on GuiObj
  getheight(): number {
    const h = super.getheight();
    if (!h && this._mappingImage != null) {
      const bitmap = this._uiRoot.getBitmap(this._mappingImage);
      if (bitmap) return bitmap.getHeight();
    }
    return h ?? 0;
  }

  // This shadows `getwidth()` on GuiObj
  getwidth(): number {
    const w = super.getwidth();
    if (!w && this._mappingImage != null) {
      const bitmap = this._uiRoot.getBitmap(this._mappingImage);
      if (bitmap) return bitmap.getWidth();
    }
    return w || 0;
  }

  draw() {
    super.draw();
    if (!this._background /* &&!this._image */) {
      this._div.classList.remove("webamp--img");
    }
    if (this._image != null) {
      this._div.classList.add("has-image");
    }
  }
}
