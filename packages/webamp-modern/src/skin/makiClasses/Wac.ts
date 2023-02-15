import BaseObject from "./BaseObject";
import { UIRoot } from "../../UIRoot";

/**
 * @deprecated Wac was marked as deprecated in Winamp 5.66
 */
export default class Wac extends BaseObject {
  static GUID = "00c074a049a0fea2bbfa8dbe401616db";
  _uiRoot: UIRoot;

  constructor(uiRoot: UIRoot) {
    super();
    this._uiRoot = uiRoot;
  }

//   loadfrommap(regionmap: MakiMap, threshold: number, reversed: boolean) {
//     // TODO:
//   }
}
