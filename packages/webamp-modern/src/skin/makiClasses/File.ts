import BaseObject from "./BaseObject";
import { UIRoot } from "../../UIRoot";

export default class File extends BaseObject {
  static GUID = "836f8b2e4db4e0d10a0d7f93d1dcc804";
  _uiRoot: UIRoot;

  constructor(uiRoot: UIRoot) {
    super();
    this._uiRoot = uiRoot;
  }

}

