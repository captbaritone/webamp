import Button from "./Button";
import { unimplementedWarning } from "../utils";

class ToggleButton extends Button {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "ToggleButton";
  }

  ontoggle(onnoff: boolean): void {
    this.js_trigger("onToggle", onnoff);
  }

  getcurcfgval(): number {
    return unimplementedWarning("getcurcfgval");
  }
}

export default ToggleButton;
