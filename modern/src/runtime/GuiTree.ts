import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

class GuiTree extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "GuiTree";
  }

  onwantautocontextmenu() {
    unimplementedWarning("onwantautocontextmenu");
    return;
  }

  onmousewheelup(clicked: number, lines: number) {
    unimplementedWarning("onmousewheelup");
    return;
  }

  onmousewheeldown(clicked: number, lines: number) {
    unimplementedWarning("onmousewheeldown");
    return;
  }

  oncontextmenu(x: number, y: number) {
    unimplementedWarning("oncontextmenu");
    return;
  }

  onchar(c: number) {
    unimplementedWarning("onchar");
    return;
  }

  onitemrecvdrop(item) {
    unimplementedWarning("onitemrecvdrop");
    return;
  }

  onlabelchange(item) {
    unimplementedWarning("onlabelchange");
    return;
  }

  onitemselected(item) {
    unimplementedWarning("onitemselected");
    return;
  }

  onitemdeselected(item) {
    unimplementedWarning("onitemdeselected");
    return;
  }

  getnumrootitems() {
    unimplementedWarning("getnumrootitems");
    return;
  }

  enumrootitem(which: number) {
    unimplementedWarning("enumrootitem");
    return;
  }

  jumptonext(c: number) {
    unimplementedWarning("jumptonext");
    return;
  }

  ensureitemvisible(item) {
    unimplementedWarning("ensureitemvisible");
    return;
  }

  getcontentswidth() {
    unimplementedWarning("getcontentswidth");
    return;
  }

  getcontentsheight() {
    unimplementedWarning("getcontentsheight");
    return;
  }

  addtreeitem(item, par, sorted: number, haschildtab: number) {
    unimplementedWarning("addtreeitem");
    return;
  }

  removetreeitem(item) {
    unimplementedWarning("removetreeitem");
    return;
  }

  movetreeitem(item, newparent) {
    unimplementedWarning("movetreeitem");
    return;
  }

  deleteallitems() {
    unimplementedWarning("deleteallitems");
    return;
  }

  expanditem(item) {
    unimplementedWarning("expanditem");
    return;
  }

  expanditemdeferred(item) {
    unimplementedWarning("expanditemdeferred");
    return;
  }

  collapseitem(item) {
    unimplementedWarning("collapseitem");
    return;
  }

  collapseitemdeferred(item) {
    unimplementedWarning("collapseitemdeferred");
    return;
  }

  selectitem(item) {
    unimplementedWarning("selectitem");
    return;
  }

  selectitemdeferred(item) {
    unimplementedWarning("selectitemdeferred");
    return;
  }

  delitemdeferred(item) {
    unimplementedWarning("delitemdeferred");
    return;
  }

  hiliteitem(item) {
    unimplementedWarning("hiliteitem");
    return;
  }

  unhiliteitem(item) {
    unimplementedWarning("unhiliteitem");
    return;
  }

  getcuritem() {
    unimplementedWarning("getcuritem");
    return;
  }

  hittest(x: number, y: number) {
    unimplementedWarning("hittest");
    return;
  }

  edititemlabel(item) {
    unimplementedWarning("edititemlabel");
    return;
  }

  canceleditlabel(destroyit: number) {
    unimplementedWarning("canceleditlabel");
    return;
  }

  setautoedit(ae: number) {
    unimplementedWarning("setautoedit");
    return;
  }

  getautoedit() {
    unimplementedWarning("getautoedit");
    return;
  }

  getbylabel(item, name: string) {
    unimplementedWarning("getbylabel");
    return;
  }

  setsorted(dosort: number) {
    unimplementedWarning("setsorted");
    return;
  }

  getsorted() {
    unimplementedWarning("getsorted");
    return;
  }

  sorttreeitems() {
    unimplementedWarning("sorttreeitems");
    return;
  }

  getsibling(item) {
    unimplementedWarning("getsibling");
    return;
  }

  setautocollapse(doautocollapse: number) {
    unimplementedWarning("setautocollapse");
    return;
  }

  setfontsize(newsize: number) {
    unimplementedWarning("setfontsize");
    return;
  }

  getfontsize() {
    unimplementedWarning("getfontsize");
    return;
  }

  getnumvisiblechilditems(c) {
    unimplementedWarning("getnumvisiblechilditems");
    return;
  }

  getnumvisibleitems() {
    unimplementedWarning("getnumvisibleitems");
    return;
  }

  enumvisibleitems(n: number) {
    unimplementedWarning("enumvisibleitems");
    return;
  }

  enumvisiblechilditems(c, n: number) {
    unimplementedWarning("enumvisiblechilditems");
    return;
  }

  enumallitems(n: number) {
    unimplementedWarning("enumallitems");
    return;
  }

  getitemrectx(item) {
    unimplementedWarning("getitemrectx");
    return;
  }

  getitemrecty(item) {
    unimplementedWarning("getitemrecty");
    return;
  }

  getitemrectw(item) {
    unimplementedWarning("getitemrectw");
    return;
  }

  getitemrecth(item) {
    unimplementedWarning("getitemrecth");
    return;
  }

  getitemfrompoint(x: number, y: number) {
    unimplementedWarning("getitemfrompoint");
    return;
  }
}

export default GuiTree;
