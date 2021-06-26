import GuiObj from "./GuiObj";
import UI_ROOT from "../UIRoot";
import { px } from "../utils";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Clayer.2F.3E
export default class Layer extends GuiObj {
  _image: string;

  setXmlAttr(key: string, value: string): boolean {
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "image":
        this._image = value;
        break;
      default:
        return false;
    }
    return true;
  }

  getDebugDom(): HTMLDivElement {
    const div = super.getDebugDom();
    div.setAttribute("data-obj-name", "Layer");
    if (this._image != null) {
      const bitmap = UI_ROOT.getBitmap(this._image);
      div.style.backgroundImage = bitmap.getBackgrondImageCSSAttribute();
      div.style.backgroundPosition = bitmap.getBackgrondPositionCSSAttribute();
      if (!div.style.width && bitmap.getWidth()) {
        div.style.width = px(bitmap.getWidth());
      }
      if (!div.style.height && bitmap.getHeight()) {
        div.style.height = px(bitmap.getHeight());
      }
    }
    return div;
  }
}
