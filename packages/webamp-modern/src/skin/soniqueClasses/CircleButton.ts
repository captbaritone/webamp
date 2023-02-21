import Bitmap from "../Bitmap";
import Button from "../makiClasses/Button";

export default class CircleButton extends Button {
  _iconimage: string;

  getElTag(): string {
    return "button";
  }

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "iconimage":
        this._iconimage = value;
        this._renderBackground();
        break;
      default:
        return false;
    }
    return true;
  }

  _renderBackground() {
    super._renderBackground();

    if (this._iconimage != null && this._uiRoot.hasBitmap(this._iconimage)) {
      const bitmap = this._uiRoot.getBitmap(this._iconimage);
      this.setIconImage(bitmap);
    } else {
      this.setIconImage(null);
    }
  }

  setIconImage(bitmap: Bitmap | null) {
    this._backgroundBitmap = bitmap;
    if (bitmap != null) {
      bitmap._setAsBackground(this._div, "icon-");
    } else {
      this._div.style.setProperty(`--icon-background-image`, "none");
    }
  }

  draw(): void {
    super.draw();
    this.getDiv().classList.add("circle"); //TODO: remove temporary
  }
}
