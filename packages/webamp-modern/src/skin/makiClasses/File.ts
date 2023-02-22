import BaseObject from "./BaseObject";
import { UIRoot } from "../../UIRoot";
import { unimplemented } from "../../utils";

export default class File extends BaseObject {
  static GUID = "836f8b2e4db4e0d10a0d7f93d1dcc804";
  _uiRoot: UIRoot;
  _path: string;

  constructor(uiRoot: UIRoot) {
    super();
    this._uiRoot = uiRoot;
  }

  load(path: string) {
    this._path = path;
  }

  exists(): boolean {
    // return unimplemented(false)
    // const response = await fetch(this._path);
    // return response.status == 200;

    const request = new XMLHttpRequest();
    request.open("GET", this._path, false); // `false` makes the request synchronous
    request.send(null);
    return request.status === 200;
  }

  getsize(): number {
    const request = new XMLHttpRequest();
    request.open("GET", this._path, false); // `false` makes the request synchronous
    request.send(null);
    return Number(request.getResponseHeader("content-length"));
  }
}
