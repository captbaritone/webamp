import BaseObject from "./BaseObject";
import { UIRoot } from "../../UIRoot";

export default class BitList extends BaseObject {
  static GUID = "87c6577849fee743cc09f98556fd2a53";
  _uiRoot: UIRoot;
  _items: boolean[] = [];

  constructor(uiRoot: UIRoot) {
    super();
    this._uiRoot = uiRoot;
  }

  getitem(n: number): boolean {
    return this._items[n];
  }
  setitem(n: number, val: boolean) {
    this.setsize(n);
    this._items[n] = val;
  }
  setsize(s: number) {
    while (this._items.length < s) {
      this._items.push(false);
    }
  }
  getsize(): number {
    return this._items.length;
  }
}
