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

  getitemselected(): string {
    return unimplementedWarning("getitemselected");
  }

  onselect(id: number, hover: number): void {
    this.js_trigger("onSelect", id, hover);
  }

  setlistheight(h: number): void {
    return unimplementedWarning("setlistheight");
  }

  openlist(): void {
    return unimplementedWarning("openlist");
  }

  closelist(): void {
    return unimplementedWarning("closelist");
  }

  setitems(lotsofitems: string): void {
    return unimplementedWarning("setitems");
  }

  additem(_text: string): number {
    return unimplementedWarning("additem");
  }

  delitem(id: number): void {
    return unimplementedWarning("delitem");
  }

  finditem(_text: string): number {
    return unimplementedWarning("finditem");
  }

  getnumitems(): number {
    return unimplementedWarning("getnumitems");
  }

  selectitem(id: number, hover: number): void {
    return unimplementedWarning("selectitem");
  }

  getitemtext(id: number): string {
    return unimplementedWarning("getitemtext");
  }

  getselected(): number {
    return unimplementedWarning("getselected");
  }

  getselectedtext(): string {
    return unimplementedWarning("getselectedtext");
  }

  getcustomtext(): string {
    return unimplementedWarning("getcustomtext");
  }

  deleteallitems(): void {
    return unimplementedWarning("deleteallitems");
  }

  setnoitemtext(txt: string): void {
    return unimplementedWarning("setnoitemtext");
  }
}

export default DropDownList;
