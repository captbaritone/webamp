import GuiObj from "./GuiObj";
import UI_ROOT from "../UIRoot";
import { px } from "../utils";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Cbutton.2F.3E_.26_.3Ctogglebutton.2F.3E
export default class Button extends GuiObj {
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

  getactivated(): boolean {
    return true;
  }

  getDebugDom(): HTMLDivElement {
    const div = super.getDebugDom();
    div.setAttribute("data-obj-name", "Button");
    if (this._image != null) {
      const bitmap = UI_ROOT.getBitmap(this._image);
      div.style.backgroundImage = bitmap.getBackgrondImageCSSAttribute();
      div.style.backgroundPosition = bitmap.getBackgrondPositionCSSAttribute();
      if (div.style.width === "" && bitmap.getWidth()) {
        div.style.width = px(bitmap.getWidth());
      }
      if (div.style.height === "" && bitmap.getHeight()) {
        div.style.height = px(bitmap.getHeight());
      }
    }
    return div;
  }

  /*
  extern Button.onActivate(int activated);
  extern Button.onLeftClick();
  extern Button.onRightClick();
  extern Button.setActivated(Boolean onoff);
  extern Button.setActivatedNoCallback(Boolean onoff);
  extern Button.leftClick();
  extern Button.rightClick();e
  */
}
