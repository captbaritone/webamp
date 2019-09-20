import MakiObject from "./MakiObject";
import { unimplementedWarning } from "../utils";

class TreeItem extends MakiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "TreeItem";
  }

  getnumchildren() {
    unimplementedWarning("getnumchildren");
    return;
  }

  setlabel(label: string) {
    unimplementedWarning("setlabel");
    return;
  }

  getlabel() {
    unimplementedWarning("getlabel");
    return;
  }

  ensurevisible() {
    unimplementedWarning("ensurevisible");
    return;
  }

  getnthchild(nth: number) {
    unimplementedWarning("getnthchild");
    return;
  }

  getchild() {
    unimplementedWarning("getchild");
    return;
  }

  getchildsibling(_item: TreeItem) {
    unimplementedWarning("getchildsibling");
    return;
  }

  getsibling() {
    unimplementedWarning("getsibling");
    return;
  }

  getparent() {
    unimplementedWarning("getparent");
    return;
  }

  editlabel() {
    unimplementedWarning("editlabel");
    return;
  }

  hassubitems() {
    unimplementedWarning("hassubitems");
    return;
  }

  setsorted(issorted: number) {
    unimplementedWarning("setsorted");
    return;
  }

  setchildtab(haschildtab: number) {
    unimplementedWarning("setchildtab");
    return;
  }

  issorted() {
    unimplementedWarning("issorted");
    return;
  }

  iscollapsed() {
    unimplementedWarning("iscollapsed");
    return;
  }

  isexpanded() {
    unimplementedWarning("isexpanded");
    return;
  }

  invalidate() {
    unimplementedWarning("invalidate");
    return;
  }

  isselected() {
    unimplementedWarning("isselected");
    return;
  }

  ishilited() {
    unimplementedWarning("ishilited");
    return;
  }

  sethilited(ishilited: number) {
    unimplementedWarning("sethilited");
    return;
  }

  collapse() {
    unimplementedWarning("collapse");
    return;
  }

  expand() {
    unimplementedWarning("expand");
    return;
  }

  gettree() {
    unimplementedWarning("gettree");
    return;
  }

  ontreeadd(): void {
    this.js_trigger("onTreeAdd");
  }

  ontreeremove(): void {
    this.js_trigger("onTreeRemove");
  }

  onselect(): void {
    this.js_trigger("onSelect");
  }

  ondeselect(): void {
    this.js_trigger("onDeselect");
  }

  onleftdoubleclick(): void {
    this.js_trigger("onLeftDoubleClick");
  }

  onrightdoubleclick(): void {
    this.js_trigger("onRightDoubleClick");
  }

  onchar(key: number): void {
    this.js_trigger("onChar", key);
  }

  onexpand(): void {
    this.js_trigger("onExpand");
  }

  oncollapse(): void {
    this.js_trigger("onCollapse");
  }

  onbeginlabeledit(): void {
    this.js_trigger("onBeginLabelEdit");
  }

  onendlabeledit(newlabel: string): void {
    this.js_trigger("onEndLabelEdit", newlabel);
  }

  oncontextmenu(x: number, y: number): void {
    this.js_trigger("onContextMenu", x, y);
  }
}

export default TreeItem;
