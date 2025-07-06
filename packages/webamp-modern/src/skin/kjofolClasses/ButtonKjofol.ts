import { px } from "../../utils";
import Button from "../makiClasses/Button";

export default class ButtonKjofol extends Button {
  //

  getElTag(): string {
    return "button";
  }

  _renderX() {
    super._renderX();
    this._div.style.setProperty("--left", px(-this._x));
  }

  _renderY() {
    super._renderY();
    this._div.style.setProperty("--top", px(-this._y));
  }
}
