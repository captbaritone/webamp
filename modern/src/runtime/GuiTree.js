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

  onmousewheelup(clicked, lines) {
    unimplementedWarning("onmousewheelup");
    return;
  }

  onmousewheeldown(clicked, lines) {
    unimplementedWarning("onmousewheeldown");
    return;
  }

  oncontextmenu(x, y) {
    unimplementedWarning("oncontextmenu");
    return;
  }

  onchar(c) {
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

  enumrootitem(which) {
    unimplementedWarning("enumrootitem");
    return;
  }

  jumptonext(c) {
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

  addtreeitem(item, par, sorted, haschildtab) {
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

  hittest(x, y) {
    unimplementedWarning("hittest");
    return;
  }

  edititemlabel(item) {
    unimplementedWarning("edititemlabel");
    return;
  }

  canceleditlabel(destroyit) {
    unimplementedWarning("canceleditlabel");
    return;
  }

  setautoedit(ae) {
    unimplementedWarning("setautoedit");
    return;
  }

  getautoedit() {
    unimplementedWarning("getautoedit");
    return;
  }

  getbylabel(item, name) {
    unimplementedWarning("getbylabel");
    return;
  }

  setsorted(dosort) {
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

  setautocollapse(doautocollapse) {
    unimplementedWarning("setautocollapse");
    return;
  }

  setfontsize(newsize) {
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

  enumvisibleitems(n) {
    unimplementedWarning("enumvisibleitems");
    return;
  }

  enumvisiblechilditems(c, n) {
    unimplementedWarning("enumvisiblechilditems");
    return;
  }

  enumallitems(n) {
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

  getitemfrompoint(x, y) {
    unimplementedWarning("getitemfrompoint");
    return;
  }
}

export default GuiTree;
