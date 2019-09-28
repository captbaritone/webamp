import { unimplementedWarning } from "../utils";
import MakiObject from "./MakiObject";

class BitList extends MakiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "BitList";
  }

  getitem(n: number) {
    unimplementedWarning("getitem");
    return;
  }

  setitem(n: number, val: boolean) {
    unimplementedWarning("setitem");
    return;
  }

  setsize(s: number) {
    unimplementedWarning("setsize");
    return;
  }

  getsize() {
    unimplementedWarning("getsize");
    return;
  }
}

export default BitList;
