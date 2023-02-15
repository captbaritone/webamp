import BaseObject from "./BaseObject";
import { UIRoot } from "../../UIRoot";

export default class BitList extends BaseObject {
  static GUID = "87c6577849fee743cc09f98556fd2a53";
  _uiRoot: UIRoot;

  constructor(uiRoot: UIRoot) {
    super();
    this._uiRoot = uiRoot;
  }

//   loadfrommap(regionmap: MakiMap, threshold: number, reversed: boolean) {
//     // TODO:
//   }
}
