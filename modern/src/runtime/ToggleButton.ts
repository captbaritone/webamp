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

  ontoggle(onnoff) {
    unimplementedWarning("ontoggle");
  }

  getcurcfgval() {
    unimplementedWarning("getcurcfgval");
    return;
  }
}

export default ToggleButton;
