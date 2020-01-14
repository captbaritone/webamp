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

  getnumitems(): number {
    return unimplementedWarning("getnumitems");
  }

  getwantautodeselect(): number {
    return unimplementedWarning("getwantautodeselect");
  }

  setwantautodeselect(want: number): void {
    return unimplementedWarning("setwantautodeselect");
  }

  // @ts-ignore Type does not match that of parent.
  onsetvisible(show: boolean): void {
    this.js_trigger("onSetVisible", show);
  }

  setautosort(dosort: number): void {
    return unimplementedWarning("setautosort");
  }

  next(): void {
    return unimplementedWarning("next");
  }

  selectcurrent(): void {
    return unimplementedWarning("selectcurrent");
  }

  selectfirstentry(): void {
    return unimplementedWarning("selectfirstentry");
  }

  previous(): void {
    return unimplementedWarning("previous");
  }

  pagedown(): void {
    return unimplementedWarning("pagedown");
  }

  pageup(): void {
    return unimplementedWarning("pageup");
  }

  home(): void {
    return unimplementedWarning("home");
  }

  end(): void {
    return unimplementedWarning("end");
  }

  reset(): void {
    return unimplementedWarning("reset");
  }

  addcolumn(name: string, width: number, numeric: number): number {
    return unimplementedWarning("addcolumn");
  }

  getnumcolumns(): number {
    return unimplementedWarning("getnumcolumns");
  }

  getcolumnwidth(column: number): number {
    return unimplementedWarning("getcolumnwidth");
  }

  setcolumnwidth(column: number, newwidth: number): void {
    return unimplementedWarning("setcolumnwidth");
  }

  getcolumnlabel(column: number): string {
    return unimplementedWarning("getcolumnlabel");
  }

  setcolumnlabel(column: number, newlabel: string): void {
    return unimplementedWarning("setcolumnlabel");
  }

  getcolumnnumeric(column: number): number {
    return unimplementedWarning("getcolumnnumeric");
  }

  setcolumndynamic(column: number, isdynamic: number): void {
    return unimplementedWarning("setcolumndynamic");
  }

  iscolumndynamic(column: number): number {
    return unimplementedWarning("iscolumndynamic");
  }

  setminimumsize(size: number): void {
    return unimplementedWarning("setminimumsize");
  }

  additem(label: string): number {
    return unimplementedWarning("additem");
  }

  insertitem(pos: number, label: string): number {
    return unimplementedWarning("insertitem");
  }

  getlastaddeditempos(): number {
    return unimplementedWarning("getlastaddeditempos");
  }

  setsubitem(pos: number, subpos: number, txt: string): void {
    return unimplementedWarning("setsubitem");
  }

  deleteallitems(): void {
    return unimplementedWarning("deleteallitems");
  }

  deletebypos(pos: number): number {
    return unimplementedWarning("deletebypos");
  }

  getitemlabel(pos: number, subpos: number): string {
    return unimplementedWarning("getitemlabel");
  }

  setitemlabel(pos: number, _text: string): void {
    return unimplementedWarning("setitemlabel");
  }

  getitemselected(pos: number): number {
    return unimplementedWarning("getitemselected");
  }

  isitemfocused(pos: number): number {
    return unimplementedWarning("isitemfocused");
  }

  getitemfocused(): number {
    return unimplementedWarning("getitemfocused");
  }

  setitemfocused(pos: number): void {
    return unimplementedWarning("setitemfocused");
  }

  ensureitemvisible(pos: number): void {
    return unimplementedWarning("ensureitemvisible");
  }

  invalidatecolumns(): void {
    return unimplementedWarning("invalidatecolumns");
  }

  scrollabsolute(x: number): number {
    return unimplementedWarning("scrollabsolute");
  }

  scrollrelative(x: number): number {
    return unimplementedWarning("scrollrelative");
  }

  scrollleft(lines: number): void {
    return unimplementedWarning("scrollleft");
  }

  scrollright(lines: number): void {
    return unimplementedWarning("scrollright");
  }

  scrollup(lines: number): void {
    return unimplementedWarning("scrollup");
  }

  scrolldown(lines: number): void {
    return unimplementedWarning("scrolldown");
  }

  getsubitemtext(pos: number, subpos: number): string {
    return unimplementedWarning("getsubitemtext");
  }

  getfirstitemselected(): number {
    return unimplementedWarning("getfirstitemselected");
  }

  getnextitemselected(lastpos: number): number {
    return unimplementedWarning("getnextitemselected");
  }

  selectall(): number {
    return unimplementedWarning("selectall");
  }

  deselectall(): number {
    return unimplementedWarning("deselectall");
  }

  invertselection(): number {
    return unimplementedWarning("invertselection");
  }

  invalidateitem(pos: number): number {
    return unimplementedWarning("invalidateitem");
  }

  getfirstitemvisible(): number {
    return unimplementedWarning("getfirstitemvisible");
  }

  getlastitemvisible(): number {
    return unimplementedWarning("getlastitemvisible");
  }

  setfontsize(size: number): number {
    return unimplementedWarning("setfontsize");
  }

  getfontsize(): number {
    return unimplementedWarning("getfontsize");
  }

  jumptonext(c: number): void {
    return unimplementedWarning("jumptonext");
  }

  scrolltoitem(pos: number): void {
    return unimplementedWarning("scrolltoitem");
  }

  resort(): void {
    return unimplementedWarning("resort");
  }

  getsortdirection(): number {
    return unimplementedWarning("getsortdirection");
  }

  getsortcolumn(): number {
    return unimplementedWarning("getsortcolumn");
  }

  setsortcolumn(col: number): void {
    return unimplementedWarning("setsortcolumn");
  }

  setsortdirection(dir: number): void {
    return unimplementedWarning("setsortdirection");
  }

  getitemcount(): number {
    return unimplementedWarning("getitemcount");
  }

  setselectionstart(pos: number): void {
    return unimplementedWarning("setselectionstart");
  }

  setselectionend(pos: number): void {
    return unimplementedWarning("setselectionend");
  }

  setselected(pos: number, selected: number): void {
    return unimplementedWarning("setselected");
  }

  toggleselection(pos: number, setfocus: number): void {
    return unimplementedWarning("toggleselection");
  }

  getheaderheight(): number {
    return unimplementedWarning("getheaderheight");
  }

  getpreventmultipleselection(): number {
    return unimplementedWarning("getpreventmultipleselection");
  }

  setpreventmultipleselection(val: number): number {
    return unimplementedWarning("setpreventmultipleselection");
  }

  moveitem(from: number, to: number): void {
    return unimplementedWarning("moveitem");
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

  setitemicon(pos: number, bitmapId: string): void {
    return unimplementedWarning("setitemicon");
  }

  getitemicon(pos: number): string {
    return unimplementedWarning("getitemicon");
  }

  setshowicons(showThem: number): void {
    return unimplementedWarning("setshowicons");
  }

  getshowicons(): number {
    return unimplementedWarning("getshowicons");
  }

  seticonwidth(width: number): number {
    return unimplementedWarning("seticonwidth");
  }

  seticonheight(width: number): number {
    return unimplementedWarning("seticonheight");
  }

  geticonwidth(): void {
    return unimplementedWarning("geticonwidth");
  }

  geticonheight(): void {
    return unimplementedWarning("geticonheight");
  }

  oniconleftclick(itemnum: number, x: number, y: number): number {
    return unimplementedWarning("oniconleftclick");
  }
}

export default GuiList;
