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

  setchecked(checked: number): void {
    return unimplementedWarning("setchecked");
  }

  ischecked(): number {
    return unimplementedWarning("ischecked");
  }

  settext(txt: string): void {
    return unimplementedWarning("settext");
  }

  gettext(): string {
    return unimplementedWarning("gettext");
  }
}

export default CheckBox;
