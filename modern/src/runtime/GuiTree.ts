import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";
import TreeItem from "./TreeItem";

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

  onwantautocontextmenu(): number {
    unimplementedWarning("onwantautocontextmenu");
    this.js_trigger("onWantAutoContextMenu");
    // TODO: not sure what we shuld return
    return 0;
  }

  onmousewheelup(clicked: number, lines: number): number {
    unimplementedWarning("onmousewheelup");
    this.js_trigger("onMouseWheelUp", clicked, lines);
    // TODO: not sure what we shuld return
    return 0;
  }

  onmousewheeldown(clicked: number, lines: number): number {
    unimplementedWarning("onmousewheeldown");
    this.js_trigger("onMouseWheelDown", clicked, lines);
    // TODO: not sure what we shuld return
    return 0;
  }

  oncontextmenu(x: number, y: number): number {
    unimplementedWarning("oncontextmenu");
    this.js_trigger("onContextMenu", x, y);
    // TODO: not sure what we shuld return
    return 0;
  }

  // @ts-ignore Type does not match that of parent.
  onchar(c: string): number {
    unimplementedWarning("onchar");
    this.js_trigger("onChar", c);
    // TODO: not sure what we shuld return
    return 0;
  }

  onitemrecvdrop(item: TreeItem): void {
    this.js_trigger("onItemRecvDrop", item);
  }

  onlabelchange(item: TreeItem): void {
    this.js_trigger("onLabelChange", item);
  }

  onitemselected(item: TreeItem): void {
    this.js_trigger("onItemSelected", item);
  }

  onitemdeselected(item: TreeItem): void {
    this.js_trigger("onItemDeselected", item);
  }

  getnumrootitems(): number {
    return unimplementedWarning("getnumrootitems");
  }

  enumrootitem(which: number) {
    return unimplementedWarning("enumrootitem");
  }

  jumptonext(c: number): void {
    return unimplementedWarning("jumptonext");
  }

  ensureitemvisible(item: TreeItem): void {
    return unimplementedWarning("ensureitemvisible");
  }

  getcontentswidth(): number {
    return unimplementedWarning("getcontentswidth");
  }

  getcontentsheight(): number {
    return unimplementedWarning("getcontentsheight");
  }

  addtreeitem(
    item: TreeItem,
    par: TreeItem,
    sorted: number,
    haschildtab: number
  ) {
    return unimplementedWarning("addtreeitem");
  }

  removetreeitem(item: TreeItem): number {
    return unimplementedWarning("removetreeitem");
  }

  movetreeitem(item: TreeItem, newparent: TreeItem): void {
    return unimplementedWarning("movetreeitem");
  }

  deleteallitems(): void {
    return unimplementedWarning("deleteallitems");
  }

  expanditem(item: TreeItem): number {
    return unimplementedWarning("expanditem");
  }

  expanditemdeferred(item: TreeItem): void {
    return unimplementedWarning("expanditemdeferred");
  }

  collapseitem(item: TreeItem): number {
    return unimplementedWarning("collapseitem");
  }

  collapseitemdeferred(item: TreeItem): void {
    return unimplementedWarning("collapseitemdeferred");
  }

  selectitem(item: TreeItem): void {
    return unimplementedWarning("selectitem");
  }

  selectitemdeferred(item: TreeItem): void {
    return unimplementedWarning("selectitemdeferred");
  }

  delitemdeferred(item: TreeItem): void {
    return unimplementedWarning("delitemdeferred");
  }

  hiliteitem(item: TreeItem): void {
    return unimplementedWarning("hiliteitem");
  }

  unhiliteitem(item: TreeItem): void {
    return unimplementedWarning("unhiliteitem");
  }

  getcuritem() {
    return unimplementedWarning("getcuritem");
  }

  hittest(x: number, y: number) {
    return unimplementedWarning("hittest");
  }

  edititemlabel(item: TreeItem): void {
    return unimplementedWarning("edititemlabel");
  }

  canceleditlabel(destroyit: number): void {
    return unimplementedWarning("canceleditlabel");
  }

  setautoedit(ae: number): void {
    return unimplementedWarning("setautoedit");
  }

  getautoedit(): number {
    return unimplementedWarning("getautoedit");
  }

  getbylabel(item: TreeItem, name: string) {
    return unimplementedWarning("getbylabel");
  }

  setsorted(dosort: number): void {
    return unimplementedWarning("setsorted");
  }

  getsorted(): number {
    return unimplementedWarning("getsorted");
  }

  sorttreeitems(): void {
    return unimplementedWarning("sorttreeitems");
  }

  getsibling(item: TreeItem) {
    return unimplementedWarning("getsibling");
  }

  setautocollapse(doautocollapse: number): void {
    return unimplementedWarning("setautocollapse");
  }

  setfontsize(newsize: number): number {
    return unimplementedWarning("setfontsize");
  }

  getfontsize(): number {
    return unimplementedWarning("getfontsize");
  }

  getnumvisiblechilditems(c: TreeItem): number {
    return unimplementedWarning("getnumvisiblechilditems");
  }

  getnumvisibleitems(): number {
    return unimplementedWarning("getnumvisibleitems");
  }

  enumvisibleitems(n: number) {
    return unimplementedWarning("enumvisibleitems");
  }

  enumvisiblechilditems(c: TreeItem, n: number) {
    return unimplementedWarning("enumvisiblechilditems");
  }

  enumallitems(n: number) {
    return unimplementedWarning("enumallitems");
  }

  getitemrectx(item: TreeItem): number {
    return unimplementedWarning("getitemrectx");
  }

  getitemrecty(item: TreeItem): number {
    return unimplementedWarning("getitemrecty");
  }

  getitemrectw(item: TreeItem): number {
    return unimplementedWarning("getitemrectw");
  }

  getitemrecth(item: TreeItem): number {
    return unimplementedWarning("getitemrecth");
  }

  getitemfrompoint(x: number, y: number) {
    return unimplementedWarning("getitemfrompoint");
  }
}

export default GuiTree;
