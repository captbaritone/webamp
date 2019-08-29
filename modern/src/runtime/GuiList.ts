import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

class GuiList extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "GuiList";
  }

  getnumitems() {
    unimplementedWarning("getnumitems");
    return;
  }

  getwantautodeselect() {
    unimplementedWarning("getwantautodeselect");
    return;
  }

  setwantautodeselect(want) {
    unimplementedWarning("setwantautodeselect");
    return;
  }

  onsetvisible(show) {
    unimplementedWarning("onsetvisible");
    return;
  }

  setautosort(dosort) {
    unimplementedWarning("setautosort");
    return;
  }

  next() {
    unimplementedWarning("next");
    return;
  }

  selectcurrent() {
    unimplementedWarning("selectcurrent");
    return;
  }

  selectfirstentry() {
    unimplementedWarning("selectfirstentry");
    return;
  }

  previous() {
    unimplementedWarning("previous");
    return;
  }

  pagedown() {
    unimplementedWarning("pagedown");
    return;
  }

  pageup() {
    unimplementedWarning("pageup");
    return;
  }

  home() {
    unimplementedWarning("home");
    return;
  }

  end() {
    unimplementedWarning("end");
    return;
  }

  reset() {
    unimplementedWarning("reset");
    return;
  }

  addcolumn(name, width, numeric) {
    unimplementedWarning("addcolumn");
    return;
  }

  getnumcolumns() {
    unimplementedWarning("getnumcolumns");
    return;
  }

  getcolumnwidth(column) {
    unimplementedWarning("getcolumnwidth");
    return;
  }

  setcolumnwidth(column, newwidth) {
    unimplementedWarning("setcolumnwidth");
    return;
  }

  getcolumnlabel(column) {
    unimplementedWarning("getcolumnlabel");
    return;
  }

  setcolumnlabel(column, newlabel) {
    unimplementedWarning("setcolumnlabel");
    return;
  }

  getcolumnnumeric(column) {
    unimplementedWarning("getcolumnnumeric");
    return;
  }

  setcolumndynamic(column, isdynamic) {
    unimplementedWarning("setcolumndynamic");
    return;
  }

  iscolumndynamic(column) {
    unimplementedWarning("iscolumndynamic");
    return;
  }

  setminimumsize(size) {
    unimplementedWarning("setminimumsize");
    return;
  }

  additem(label) {
    unimplementedWarning("additem");
    return;
  }

  insertitem(pos, label) {
    unimplementedWarning("insertitem");
    return;
  }

  getlastaddeditempos() {
    unimplementedWarning("getlastaddeditempos");
    return;
  }

  setsubitem(pos, subpos, txt) {
    unimplementedWarning("setsubitem");
    return;
  }

  deleteallitems() {
    unimplementedWarning("deleteallitems");
    return;
  }

  deletebypos(pos) {
    unimplementedWarning("deletebypos");
    return;
  }

  getitemlabel(pos, subpos) {
    unimplementedWarning("getitemlabel");
    return;
  }

  setitemlabel(pos, _text) {
    unimplementedWarning("setitemlabel");
    return;
  }

  getitemselected(pos) {
    unimplementedWarning("getitemselected");
    return;
  }

  isitemfocused(pos) {
    unimplementedWarning("isitemfocused");
    return;
  }

  getitemfocused() {
    unimplementedWarning("getitemfocused");
    return;
  }

  setitemfocused(pos) {
    unimplementedWarning("setitemfocused");
    return;
  }

  ensureitemvisible(pos) {
    unimplementedWarning("ensureitemvisible");
    return;
  }

  invalidatecolumns() {
    unimplementedWarning("invalidatecolumns");
    return;
  }

  scrollabsolute(x) {
    unimplementedWarning("scrollabsolute");
    return;
  }

  scrollrelative(x) {
    unimplementedWarning("scrollrelative");
    return;
  }

  scrollleft(lines) {
    unimplementedWarning("scrollleft");
    return;
  }

  scrollright(lines) {
    unimplementedWarning("scrollright");
    return;
  }

  scrollup(lines) {
    unimplementedWarning("scrollup");
    return;
  }

  scrolldown(lines) {
    unimplementedWarning("scrolldown");
    return;
  }

  getsubitemtext(pos, subpos) {
    unimplementedWarning("getsubitemtext");
    return;
  }

  getfirstitemselected() {
    unimplementedWarning("getfirstitemselected");
    return;
  }

  getnextitemselected(lastpos) {
    unimplementedWarning("getnextitemselected");
    return;
  }

  selectall() {
    unimplementedWarning("selectall");
    return;
  }

  deselectall() {
    unimplementedWarning("deselectall");
    return;
  }

  invertselection() {
    unimplementedWarning("invertselection");
    return;
  }

  invalidateitem(pos) {
    unimplementedWarning("invalidateitem");
    return;
  }

  getfirstitemvisible() {
    unimplementedWarning("getfirstitemvisible");
    return;
  }

  getlastitemvisible() {
    unimplementedWarning("getlastitemvisible");
    return;
  }

  setfontsize(size) {
    unimplementedWarning("setfontsize");
    return;
  }

  getfontsize() {
    unimplementedWarning("getfontsize");
    return;
  }

  jumptonext(c) {
    unimplementedWarning("jumptonext");
    return;
  }

  scrolltoitem(pos) {
    unimplementedWarning("scrolltoitem");
    return;
  }

  resort() {
    unimplementedWarning("resort");
    return;
  }

  getsortdirection() {
    unimplementedWarning("getsortdirection");
    return;
  }

  getsortcolumn() {
    unimplementedWarning("getsortcolumn");
    return;
  }

  setsortcolumn(col) {
    unimplementedWarning("setsortcolumn");
    return;
  }

  setsortdirection(dir) {
    unimplementedWarning("setsortdirection");
    return;
  }

  getitemcount() {
    unimplementedWarning("getitemcount");
    return;
  }

  setselectionstart(pos) {
    unimplementedWarning("setselectionstart");
    return;
  }

  setselectionend(pos) {
    unimplementedWarning("setselectionend");
    return;
  }

  setselected(pos, selected) {
    unimplementedWarning("setselected");
    return;
  }

  toggleselection(pos, setfocus) {
    unimplementedWarning("toggleselection");
    return;
  }

  getheaderheight() {
    unimplementedWarning("getheaderheight");
    return;
  }

  getpreventmultipleselection() {
    unimplementedWarning("getpreventmultipleselection");
    return;
  }

  setpreventmultipleselection(val) {
    unimplementedWarning("setpreventmultipleselection");
    return;
  }

  moveitem(from, to) {
    unimplementedWarning("moveitem");
    return;
  }

  onselectall() {
    unimplementedWarning("onselectall");
    return;
  }

  ondelete() {
    unimplementedWarning("ondelete");
    return;
  }

  ondoubleclick(itemnum) {
    unimplementedWarning("ondoubleclick");
    return;
  }

  onleftclick(itemnum) {
    unimplementedWarning("onleftclick");
    return;
  }

  onsecondleftclick(itemnum) {
    unimplementedWarning("onsecondleftclick");
    return;
  }

  onrightclick(itemnum) {
    unimplementedWarning("onrightclick");
    return;
  }

  oncolumndblclick(col, x, y) {
    unimplementedWarning("oncolumndblclick");
    return;
  }

  oncolumnlabelclick(col, x, y) {
    unimplementedWarning("oncolumnlabelclick");
    return;
  }

  onitemselection(itemnum, selected) {
    unimplementedWarning("onitemselection");
    return;
  }
}

export default GuiList;
