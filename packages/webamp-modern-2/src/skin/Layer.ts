import GuiObj from "./GuiObj";
import UI_ROOT from "../UIRoot";
import { px } from "../utils";

export default class Layer extends GuiObj {
  _image: string;

  setXmlAttr(key: string, value: string): boolean {
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "image":
        this._image = value;
      default:
        return false;
    }
    return true;
  }

  getDebugDom(): HTMLDivElement {
    const div = super.getDebugDom();
    if (this._image != null) {
      const bitmap = UI_ROOT.getBitmap(this._image);
      div.style.background = bitmap.getBackgrondCSSAttribute();
      if (div.style.width === "" && bitmap.getWidth()) {
        div.style.width = px(bitmap.getWidth());
      }
      if (div.style.height === "" && bitmap.getHeight()) {
        div.style.height = px(bitmap.getHeight());
      }
    }
    return div;
  }
}
