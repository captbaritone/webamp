import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

class DropDownList extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "DropDownList";
  }

  getitemselected() {
    unimplementedWarning("getitemselected");
    return;
  }

  onselect(id, hover) {
    unimplementedWarning("onselect");
    return;
  }

  setlistheight(h) {
    unimplementedWarning("setlistheight");
    return;
  }

  openlist() {
    unimplementedWarning("openlist");
    return;
  }

  closelist() {
    unimplementedWarning("closelist");
    return;
  }

  setitems(lotsofitems) {
    unimplementedWarning("setitems");
    return;
  }

  additem(_text) {
    unimplementedWarning("additem");
    return;
  }

  delitem(id) {
    unimplementedWarning("delitem");
    return;
  }

  finditem(_text) {
    unimplementedWarning("finditem");
    return;
  }

  getnumitems() {
    unimplementedWarning("getnumitems");
    return;
  }

  selectitem(id, hover) {
    unimplementedWarning("selectitem");
    return;
  }

  getitemtext(id) {
    unimplementedWarning("getitemtext");
    return;
  }

  getselected() {
    unimplementedWarning("getselected");
    return;
  }

  getselectedtext() {
    unimplementedWarning("getselectedtext");
    return;
  }

  getcustomtext() {
    unimplementedWarning("getcustomtext");
    return;
  }

  deleteallitems() {
    unimplementedWarning("deleteallitems");
    return;
  }

  setnoitemtext(txt) {
    unimplementedWarning("setnoitemtext");
    return;
  }
}

export default DropDownList;
