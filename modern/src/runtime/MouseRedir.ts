import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";
import MakiMap from "./MakiMap";
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

  setredirection(o: GuiObject): void {
    return unimplementedWarning("setredirection");
  }

  getredirection() {
    return unimplementedWarning("getredirection");
  }

  setregionfrommap(
    regionmap: MakiMap,
    threshold: number,
    reverse: boolean
  ): void {
    return unimplementedWarning("setregionfrommap");
  }

  setregion(reg: Region): void {
    return unimplementedWarning("setregion");
  }
}

export default MouseRedir;
