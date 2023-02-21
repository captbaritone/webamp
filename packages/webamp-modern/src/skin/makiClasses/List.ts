import { assert, assume } from "../../utils";
import BaseObject from "./BaseObject";
import { UIRoot } from "../../UIRoot";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Clist.2F.3E
export default class MakiList extends BaseObject {
  static GUID = "b2023ab54ba1434d6359aebec6f30375";
  _uiRoot: UIRoot;
  _list: any[] = [];

  constructor(uiRoot: UIRoot) {
    super();
    this._uiRoot = uiRoot;
  }

  additem(_object: any) {
    this._list.push(_object);
  }

  removeitem(pos: number) {
    const item = this._list[pos];
    if (item) {
      // only splice array when item is found
      this._list.splice(pos, 1); // 2nd parameter means remove one item only
    }
  }

  finditem(_object: any): number {
    return this._list.indexOf(_object);
  }
  finditem2(_object: any, startItem: number): number {
    return this._list.indexOf(_object, startItem);
  }

  enumitem(pos: number): any {
    return this._list[pos];
  }

  getnumitems(): number {
    return this._list.length;
  }
  removeall() {
    this._list = [];
  }
}
