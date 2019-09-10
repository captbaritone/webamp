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

  onselect(id: number, hover: number): void {
    this.js_trigger("onSelect", id, hover);
  }

  setlistheight(h: number) {
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

  setitems(lotsofitems: string) {
    unimplementedWarning("setitems");
    return;
  }

  additem(_text: string) {
    unimplementedWarning("additem");
    return;
  }

  delitem(id: number) {
    unimplementedWarning("delitem");
    return;
  }

  finditem(_text: string) {
    unimplementedWarning("finditem");
    return;
  }

  getnumitems() {
    unimplementedWarning("getnumitems");
    return;
  }

  selectitem(id: number, hover: number) {
    unimplementedWarning("selectitem");
    return;
  }

  getitemtext(id: number) {
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

  setnoitemtext(txt: string) {
    unimplementedWarning("setnoitemtext");
    return;
  }
}

export default DropDownList;
