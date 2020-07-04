import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

class Edit extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Edit";
  }

  onenter(): void {
    this.js_trigger("onEnter");
  }

  onabort(): void {
    this.js_trigger("onAbort");
  }

  onidleeditupdate(): void {
    this.js_trigger("onIdleEditUpdate");
  }

  oneditupdate(): void {
    this.js_trigger("onEditUpdate");
  }

  settext(txt: string): void {
    return unimplementedWarning("settext");
  }

  setautoenter(onoff: boolean): void {
    return unimplementedWarning("setautoenter");
  }

  getautoenter(): number {
    return unimplementedWarning("getautoenter");
  }

  gettext(): string {
    return unimplementedWarning("gettext");
  }

  selectall(): void {
    return unimplementedWarning("selectall");
  }

  enter(): void {
    return unimplementedWarning("enter");
  }

  setidleenabled(onoff: boolean): void {
    return unimplementedWarning("setidleenabled");
  }

  getidleenabled(): number {
    return unimplementedWarning("getidleenabled");
  }
}

export default Edit;
