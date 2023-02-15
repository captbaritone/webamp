import BaseObject from "./BaseObject";
import { UIRoot } from "../../UIRoot";

export default class TreeItem extends BaseObject {
  static GUID = "9b3b4b82420e667a4179fc8f029c8015";
  _uiRoot: UIRoot;

  constructor(uiRoot: UIRoot) {
    super();
    this._uiRoot = uiRoot;
  }

//   loadfrommap(regionmap: MakiMap, threshold: number, reversed: boolean) {
//     // TODO:
//   }
}
