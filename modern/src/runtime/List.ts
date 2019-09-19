import MakiObject from "./MakiObject";

class List extends MakiObject {
  _list: Array<any>;

  constructor(node, parent, annotations, store) {
    super(node, parent, annotations, store);
    this._list = [];
  }

  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "List";
  }

  additem(object: any): void {
    this._list.push(object);
  }

  removeitem(pos: number): void {
    this._list.splice(pos, 1);
  }

  enumitem(pos: number): any {
    return this._list[pos];
  }

  finditem(obj: any): number {
    return this._list.indexOf(obj);
  }

  getnumitems(): number {
    return this._list.length;
  }

  removeall(): void {
    this._list = [];
  }
}

export default List;
