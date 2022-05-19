import UI_ROOT from "../../UIRoot";
import { toBool } from "../../utils";
import AudioEventedGui from "../AudioEventedGui";
import Button from "../makiClasses/Button";

export default class ButtonFace extends Button {
  _enabled: boolean = true;
  _disabledImage: string;

  getElTag(): string {
    return "button";
  }

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(_key, value)) {
      return true;
    }

    switch (key) {
      case "enabled":
        this._enabled = toBool(value);
        break;
        case "disabledimage":
        this._disabledImage = value;
        break;
        default:
        return false;
    }
    return true;
  }

  get enabled(): boolean {
    return this._enabled;
  }
  set enabled(value: boolean) {
    this._enabled = value;
    this._renderDisabled();
  }

  _renderDisabled() {
    if (this._enabled) {
      this._div.classList.remove("disabled");
    } else {
      this._div.classList.add("disabled");
    }
  }

  _renderBackground() {
    super._renderBackground();
    
    if (this._disabledImage != null) {
      const disabledImage = UI_ROOT.getBitmap(this._disabledImage);
      this.setDisabledBackgroundImage(disabledImage);
    } else {
      this.setDisabledBackgroundImage(null);
    }
  }

  draw() {
    super.draw();
    this._div.classList.add("webamp--img");
    this._renderBackground();
    this._renderDisabled()
  }
}
