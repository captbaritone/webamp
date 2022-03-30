import { V } from "../../maki/v";
import UI_ROOT from "../../UIRoot";
import Button from "./Button";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Cbutton.2F.3E_.26_.3Ctogglebutton.2F.3E
export default class ToggleButton extends Button {
  static GUID = "b4dccfff4bcc81fe0f721b96ff0fbed5";

  getElTag(): string {
    return "button";
  }

  getcurcfgval(): number{
    return this._active? 1 : 0;
  }

  /**
   * This method is called by Button
   */
  _handleMouseDown(e: MouseEvent) {
    // don't send to parent to start move/resizing
    e.stopPropagation();
    // implementation of standard mouse down
    this.setactivated(!this._active);
  }

  ontoggle(onoff: boolean){
    UI_ROOT.vm.dispatch(this, "ontoggle", [V.newBool(onoff)]);
  }

  draw() {
    super.draw();
    this._div.setAttribute("data-obj-name", "ToggleButton");
  }

  /*
  extern ToggleButton.onToggle(Boolean onoff);
  extern int TOggleButton.getCurCfgVal()
  */
}
