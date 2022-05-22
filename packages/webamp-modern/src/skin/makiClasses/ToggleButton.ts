import { V } from "../../maki/v";
import Button from "./Button";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Cbutton.2F.3E_.26_.3Ctogglebutton.2F.3E
export default class ToggleButton extends Button {
  static GUID = "b4dccfff4bcc81fe0f721b96ff0fbed5";

  getElTag(): string {
    return "button";
  }

  getcurcfgval(): number {
    return this._active ? 1 : 0;
  }

  _cfgAttribChanged(newValue: string) {
    //do something when configAttrib broadcast message `datachanged` by other object
    this.setactivated(newValue != "0");
    this.ontoggle(this._active);
  }

  /**
   * This method is called by Button
   */
  _handleMouseDown(e: MouseEvent) {
    // don't send to parent to start move/resizing
    e.stopPropagation();
    // implementation of standard mouse down
    this.setactivated(!this._active);
    this.updateCfgAttib(this._active ? "1" : "0");
    this.ontoggle(this._active);
  }

  ontoggle(onoff: boolean) {
    this._uiRoot.vm.dispatch(this, "ontoggle", [V.newBool(onoff)]);
  }

  onactivate(activated: number) {
    this._uiRoot.vm.dispatch(this, "onactivate", [
      { type: "INT", value: activated },
    ]);
  }

  draw() {
    super.draw();
    this._div.setAttribute("data-obj-name", "ToggleButton");
  }
}
