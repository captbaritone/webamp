import { px } from "../../utils";
import ToggleButton from "../makiClasses/ToggleButton";

export default class ToggleButtonKjofol extends ToggleButton {
  //

  getElTag(): string {
    return "button";
  }

  _renderX() {
    super._renderX();
    this._div.style.setProperty("--left", px(-this._x ?? 0));
  }

  _renderY() {
    super._renderY();
    this._div.style.setProperty("--top", px(-this._y ?? 0));
  }
}
