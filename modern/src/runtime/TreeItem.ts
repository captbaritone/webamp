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

  setlabel(label) {
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

  getnthchild(nth) {
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

  setsorted(issorted) {
    unimplementedWarning("setsorted");
    return;
  }

  setchildtab(haschildtab) {
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

  sethilited(ishilited) {
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

  onchar(key) {
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

  onendlabeledit(newlabel) {
    unimplementedWarning("onendlabeledit");
    return;
  }

  oncontextmenu(x, y) {
    unimplementedWarning("oncontextmenu");
    return;
  }
}

export default TreeItem;
