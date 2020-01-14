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

  getnumchildren(): number {
    return unimplementedWarning("getnumchildren");
  }

  setlabel(label: string): void {
    return unimplementedWarning("setlabel");
  }

  getlabel(): string {
    return unimplementedWarning("getlabel");
  }

  ensurevisible(): void {
    return unimplementedWarning("ensurevisible");
  }

  getnthchild(nth: number) {
    return unimplementedWarning("getnthchild");
  }

  getchild() {
    return unimplementedWarning("getchild");
  }

  getchildsibling(_item: TreeItem) {
    return unimplementedWarning("getchildsibling");
  }

  getsibling() {
    return unimplementedWarning("getsibling");
  }

  getparent() {
    return unimplementedWarning("getparent");
  }

  editlabel(): void {
    return unimplementedWarning("editlabel");
  }

  hassubitems(): number {
    return unimplementedWarning("hassubitems");
  }

  setsorted(issorted: number): void {
    return unimplementedWarning("setsorted");
  }

  setchildtab(haschildtab: number): void {
    return unimplementedWarning("setchildtab");
  }

  issorted(): number {
    return unimplementedWarning("issorted");
  }

  iscollapsed(): number {
    return unimplementedWarning("iscollapsed");
  }

  isexpanded(): number {
    return unimplementedWarning("isexpanded");
  }

  invalidate(): void {
    return unimplementedWarning("invalidate");
  }

  isselected(): number {
    return unimplementedWarning("isselected");
  }

  ishilited(): number {
    return unimplementedWarning("ishilited");
  }

  sethilited(ishilited: number): void {
    return unimplementedWarning("sethilited");
  }

  collapse(): number {
    return unimplementedWarning("collapse");
  }

  expand(): number {
    return unimplementedWarning("expand");
  }

  gettree() {
    return unimplementedWarning("gettree");
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
