import { UIRoot } from "../../UIRoot";
import MakiText from "../makiClasses/Text";
import { solvePendingProps } from "./util";

// https://docs.microsoft.com/en-us/windows/win32/wmp/text-element
export default class TextZ extends MakiText {
  _pendingProps: { [key: string]: string } = {};
  _background: string;
  _foregroundColor: string;

  getElTag(): string {
    return "text";
  }

  constructor(uiRoot: UIRoot) {
    super(uiRoot);
    this.setXmlAttr("font", "arial");
  }

  setXmlAttr(_key: string, _value: string): boolean {
    let key = _key.toLowerCase();
    const value = _value.toLowerCase();
    if (value.startsWith("jscript:")) {
      this._pendingProps[key] = value;
      return true;
    } else if (key == "value") {
      key = "text";
      if (value == "wmpprop:player.currentmedia.name") {
        this.setXmlAttr("display", "songname");
        this.setXmlAttr("ticker", "1");
        // return;
      }
      // } else if(key == 'fonttype') {
      //   key = 'font'
    }
    if (super.setXmlAttr(key, _value)) {
      //   //? wmz has no action/param
      //   if (key == "id") {
      //     if (value.startsWith("eq")) {
      //       const index = value.substring(2);
      //       this.setxmlparam("action", "eq_band");
      //       this.setxmlparam("param", index);
      //     } else if(value =='balance'){
      //       this.setxmlparam("action", "pan");

      //     } else if(value =='volume'){
      //       this.setxmlparam("action", "volume");

      //     }
      //   }
      return true;
    }

    switch (key) {
      case "foregroundcolor":
        this._foregroundColor = value;
        this._div.style.color = value;
        break;
      default:
        return false;
    }
    return true;
  }

  draw() {
    solvePendingProps(this, this._pendingProps);
    super.draw();
    this._div.classList.add("textz");
    if (!this._w) {
      this._div.style.setProperty("--full-width", "auto");
    }
    if (this.getwidth() == 0) {
      //   this._div.style.removeProperty("width");
      this._div.style.width = "auto";
    }
    if (this.getheight() == 0) {
      this._div.style.removeProperty("height");
    }
    if (!this._background) {
      this._div.classList.remove("webamp--img");
    }
  }
}
