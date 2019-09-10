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

  settext(txt: string) {
    unimplementedWarning("settext");
    return;
  }

  setautoenter(onoff: boolean) {
    unimplementedWarning("setautoenter");
    return;
  }

  getautoenter() {
    unimplementedWarning("getautoenter");
    return;
  }

  gettext() {
    unimplementedWarning("gettext");
    return;
  }

  selectall() {
    unimplementedWarning("selectall");
    return;
  }

  enter() {
    unimplementedWarning("enter");
    return;
  }

  setidleenabled(onoff: boolean) {
    unimplementedWarning("setidleenabled");
    return;
  }

  getidleenabled() {
    unimplementedWarning("getidleenabled");
    return;
  }
}

export default Edit;
