import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";
import MakiMap from "./Map";
import Region from "./Region";

class MouseRedir extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "MouseRedir";
  }

  setredirection(o: GuiObject) {
    unimplementedWarning("setredirection");
    return;
  }

  getredirection() {
    unimplementedWarning("getredirection");
    return;
  }

  setregionfrommap(regionmap: MakiMap, threshold: number, reverse: boolean) {
    unimplementedWarning("setregionfrommap");
    return;
  }

  setregion(reg: Region) {
    unimplementedWarning("setregion");
    return;
  }
}

export default MouseRedir;
