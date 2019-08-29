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

  getchildsibling(_item) {
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

  ontreeadd() {
    unimplementedWarning("ontreeadd");
    return;
  }

  ontreeremove() {
    unimplementedWarning("ontreeremove");
    return;
  }

  onselect() {
    unimplementedWarning("onselect");
    return;
  }

  ondeselect() {
    unimplementedWarning("ondeselect");
    return;
  }

  onleftdoubleclick() {
    unimplementedWarning("onleftdoubleclick");
    return;
  }

  onrightdoubleclick() {
    unimplementedWarning("onrightdoubleclick");
    return;
  }

  onchar(key: number) {
    unimplementedWarning("onchar");
    return;
  }

  onexpand() {
    unimplementedWarning("onexpand");
    return;
  }

  oncollapse() {
    unimplementedWarning("oncollapse");
    return;
  }

  onbeginlabeledit() {
    unimplementedWarning("onbeginlabeledit");
    return;
  }

  onendlabeledit(newlabel: string) {
    unimplementedWarning("onendlabeledit");
    return;
  }

  oncontextmenu(x: number, y: number) {
    unimplementedWarning("oncontextmenu");
    return;
  }
}

export default TreeItem;
