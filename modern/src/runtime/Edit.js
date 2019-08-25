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

  onenter() {
    unimplementedWarning("onenter");
    return;
  }

  onabort() {
    unimplementedWarning("onabort");
    return;
  }

  onidleeditupdate() {
    unimplementedWarning("onidleeditupdate");
    return;
  }

  oneditupdate() {
    unimplementedWarning("oneditupdate");
    return;
  }

  settext(txt) {
    unimplementedWarning("settext");
    return;
  }

  setautoenter(onoff) {
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

  setidleenabled(onoff) {
    unimplementedWarning("setidleenabled");
    return;
  }

  getidleenabled() {
    unimplementedWarning("getidleenabled");
    return;
  }
}

export default Edit;
