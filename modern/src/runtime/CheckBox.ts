import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

class CheckBox extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "CheckBox";
  }

  ontoggle(newstate) {
    unimplementedWarning("ontoggle");
    return;
  }

  setchecked(checked) {
    unimplementedWarning("setchecked");
    return;
  }

  ischecked() {
    unimplementedWarning("ischecked");
    return;
  }

  settext(txt) {
    unimplementedWarning("settext");
    return;
  }

  gettext() {
    unimplementedWarning("gettext");
    return;
  }
}

export default CheckBox;
