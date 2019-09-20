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

  setwantautodeselect(want: number) {
    unimplementedWarning("setwantautodeselect");
    return;
  }

  // @ts-ignore Type does not match that of parent.
  onsetvisible(show: number): void {
    this.js_trigger("onSetVisible", show);
  }

  setautosort(dosort: number) {
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

  addcolumn(name: string, width: number, numeric: number) {
    unimplementedWarning("addcolumn");
    return;
  }

  getnumcolumns() {
    unimplementedWarning("getnumcolumns");
    return;
  }

  getcolumnwidth(column: number) {
    unimplementedWarning("getcolumnwidth");
    return;
  }

  setcolumnwidth(column: number, newwidth: number) {
    unimplementedWarning("setcolumnwidth");
    return;
  }

  getcolumnlabel(column: number) {
    unimplementedWarning("getcolumnlabel");
    return;
  }

  setcolumnlabel(column: number, newlabel: string) {
    unimplementedWarning("setcolumnlabel");
    return;
  }

  getcolumnnumeric(column: number) {
    unimplementedWarning("getcolumnnumeric");
    return;
  }

  setcolumndynamic(column: number, isdynamic: number) {
    unimplementedWarning("setcolumndynamic");
    return;
  }

  iscolumndynamic(column: number) {
    unimplementedWarning("iscolumndynamic");
    return;
  }

  setminimumsize(size: number) {
    unimplementedWarning("setminimumsize");
    return;
  }

  additem(label: string) {
    unimplementedWarning("additem");
    return;
  }

  insertitem(pos: number, label: string) {
    unimplementedWarning("insertitem");
    return;
  }

  getlastaddeditempos() {
    unimplementedWarning("getlastaddeditempos");
    return;
  }

  setsubitem(pos: number, subpos: number, txt: string) {
    unimplementedWarning("setsubitem");
    return;
  }

  deleteallitems() {
    unimplementedWarning("deleteallitems");
    return;
  }

  deletebypos(pos: number) {
    unimplementedWarning("deletebypos");
    return;
  }

  getitemlabel(pos: number, subpos: number) {
    unimplementedWarning("getitemlabel");
    return;
  }

  setitemlabel(pos: number, _text: string) {
    unimplementedWarning("setitemlabel");
    return;
  }

  getitemselected(pos: number) {
    unimplementedWarning("getitemselected");
    return;
  }

  isitemfocused(pos: number) {
    unimplementedWarning("isitemfocused");
    return;
  }

  getitemfocused() {
    unimplementedWarning("getitemfocused");
    return;
  }

  setitemfocused(pos: number) {
    unimplementedWarning("setitemfocused");
    return;
  }

  ensureitemvisible(pos: number) {
    unimplementedWarning("ensureitemvisible");
    return;
  }

  invalidatecolumns() {
    unimplementedWarning("invalidatecolumns");
    return;
  }

  scrollabsolute(x: number) {
    unimplementedWarning("scrollabsolute");
    return;
  }

  scrollrelative(x: number) {
    unimplementedWarning("scrollrelative");
    return;
  }

  scrollleft(lines: number) {
    unimplementedWarning("scrollleft");
    return;
  }

  scrollright(lines: number) {
    unimplementedWarning("scrollright");
    return;
  }

  scrollup(lines: number) {
    unimplementedWarning("scrollup");
    return;
  }

  scrolldown(lines: number) {
    unimplementedWarning("scrolldown");
    return;
  }

  getsubitemtext(pos: number, subpos: number) {
    unimplementedWarning("getsubitemtext");
    return;
  }

  getfirstitemselected() {
    unimplementedWarning("getfirstitemselected");
    return;
  }

  getnextitemselected(lastpos: number) {
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

  invalidateitem(pos: number) {
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

  setfontsize(size: number) {
    unimplementedWarning("setfontsize");
    return;
  }

  getfontsize() {
    unimplementedWarning("getfontsize");
    return;
  }

  jumptonext(c: number) {
    unimplementedWarning("jumptonext");
    return;
  }

  scrolltoitem(pos: number) {
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

  setsortcolumn(col: number) {
    unimplementedWarning("setsortcolumn");
    return;
  }

  setsortdirection(dir: number) {
    unimplementedWarning("setsortdirection");
    return;
  }

  getitemcount() {
    unimplementedWarning("getitemcount");
    return;
  }

  setselectionstart(pos: number) {
    unimplementedWarning("setselectionstart");
    return;
  }

  setselectionend(pos: number) {
    unimplementedWarning("setselectionend");
    return;
  }

  setselected(pos: number, selected: number) {
    unimplementedWarning("setselected");
    return;
  }

  toggleselection(pos: number, setfocus: number) {
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

  setpreventmultipleselection(val: number) {
    unimplementedWarning("setpreventmultipleselection");
    return;
  }

  moveitem(from: number, to: number) {
    unimplementedWarning("moveitem");
    return;
  }

  onselectall(): void {
    this.js_trigger("onSelectAll");
  }

  ondelete(): void {
    this.js_trigger("onDelete");
  }

  ondoubleclick(itemnum: number): void {
    this.js_trigger("onDoubleClick", itemnum);
  }

  onleftclick(itemnum: number): void {
    this.js_trigger("onLeftClick", itemnum);
  }

  onsecondleftclick(itemnum: number): void {
    this.js_trigger("onSecondLeftClick", itemnum);
  }

  onrightclick(itemnum: number): number {
    unimplementedWarning("onrightclick");
    this.js_trigger("onRightClick", itemnum);
    // TODO: not sure what we shuld return
    return 0;
  }

  oncolumndblclick(col: number, x: number, y: number): number {
    unimplementedWarning("oncolumndblclick");
    this.js_trigger("onColumnDblClick", col, x, y);
    // TODO: not sure what we shuld return
    return 0;
  }

  oncolumnlabelclick(col: number, x: number, y: number): number {
    unimplementedWarning("oncolumnlabelclick");
    this.js_trigger("onColumnLabelClick", col, x, y);
    // TODO: not sure what we shuld return
    return 0;
  }

  onitemselection(itemnum: number, selected: number): void {
    this.js_trigger("onItemSelection", itemnum, selected);
  }
}

export default GuiList;
