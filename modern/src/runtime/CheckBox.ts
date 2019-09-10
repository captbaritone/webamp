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

  ontoggle(newstate: number): void {
    this.js_trigger("onToggle", newstate);
  }

  setchecked(checked: number) {
    unimplementedWarning("setchecked");
    return;
  }

  ischecked() {
    unimplementedWarning("ischecked");
    return;
  }

  settext(txt: string) {
    unimplementedWarning("settext");
    return;
  }

  gettext() {
    unimplementedWarning("gettext");
    return;
  }
}

export default CheckBox;
