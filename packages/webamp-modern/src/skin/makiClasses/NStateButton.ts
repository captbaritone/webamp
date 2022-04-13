// import { V } from "../../maki/v";
// import UI_ROOT from "../../UIRoot";
import UI_ROOT from "../../UIRoot";
import { num } from "../../utils";
import ToggleButton from "./ToggleButton";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Cnstatesbutton.2F.3E
export default class NStateButton extends ToggleButton {
  //   static GUID = "b4dccfff4bcc81fe0f721b96ff0fbed5";
  _statesCount: number = 2;
  _states: number[] = [0, 1];
  _stateIndex: number = 0;
  _plainImages = {}; //neutral of state image

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (key.endsWith("image")) {
      this._plainImages[key] = value.toLowerCase();
    }
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "nstates":
        // (int) The number of discrete states in which the object may exist.
        this._statesCount = num(value);
        break;
      case "cfgvals":
        // (str) A semicolon delimited list of values to represent custom config values for the multiple states. Default is the current state number.
        this._states = value.split(";").map((numStr) => num(numStr));
        break;
      default:
        return false;
    }
    return true;
  }

  getcurcfgval(): number {
    return this._states[this._stateIndex];
  }

  /**
   * This method is called by Button
   */
  _handleMouseDown(e: MouseEvent) {
    // don't send to parent to start move/resizing
    e.stopPropagation();
    // implementation of standard mouse down
    // this.setactivated(!this._active);
    this._cycleState();
  }

  _cycleState() {
    this._stateIndex++;
    if (this._stateIndex >= this._statesCount) {
      this._stateIndex = 0;
    }
    //debug:
    this._div.style.setProperty('--state', String(this._stateIndex))
    this._updateBitmaps();
  }

  init() {
    super.init();
    this._updateBitmaps();
  }

  /**
   * NStateButton has special value to 4 bitmap (normal, hover, down, active)
   * according to current state.
   * Also, when currrent state == -1, the state doesn't apply to those bitamps;
   * see WinampModern.wal #RepeatDisplay --> cfgvals="0;1;-1"
   */
  _updateBitmaps() {
    const bitmapSuffix = this._states[this._stateIndex] >= 0 ? String(this._states[this._stateIndex]) : "";
    ["image", "downimage", "hoverimage", "activeimage"].forEach((att) => {
      //this button has xml attribute?
      if (this._plainImages[att]) {
        if (UI_ROOT.hasBitmap(this._plainImages[att] + bitmapSuffix)) {
          super.setXmlAttr(att, this._plainImages[att] + bitmapSuffix);
        } else {
          super.setXmlAttr(att, this._plainImages[att]);
        }
      }
    });
  }

  ontoggle(onoff: boolean) {
    // UI_ROOT.vm.dispatch(this, "ontoggle", [V.newBool(onoff)]);
  }

  onactivate(activated: number) {
    // UI_ROOT.vm.dispatch(this, "onactivate", [
    //   { type: "INT", value: activated },
    // ]);
  }

  draw() {
    super.draw();
    this._div.setAttribute("data-obj-name", "NStateButton");
  }

  /*
  extern ToggleButton.onToggle(Boolean onoff);
  extern int TOggleButton.getCurCfgVal()
  */
}
