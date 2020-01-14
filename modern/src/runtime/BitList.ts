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

  getitem(n: number): boolean {
    return unimplementedWarning("getitem");
  }

  setitem(n: number, val: boolean): void {
    return unimplementedWarning("setitem");
  }

  setsize(s: number): void {
    return unimplementedWarning("setsize");
  }

  getsize(): number {
    return unimplementedWarning("getsize");
  }
}

export default BitList;
