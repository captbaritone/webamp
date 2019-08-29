import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

class Vis extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Vis";
  }

  setmode(mode: number) {
    unimplementedWarning("setmode");
  }

  onframe() {
    unimplementedWarning("onframe");
    return;
  }

  setrealtime(onoff: boolean) {
    unimplementedWarning("setrealtime");
    return;
  }

  getrealtime() {
    unimplementedWarning("getrealtime");
    return;
  }

  getmode() {
    unimplementedWarning("getmode");
    return;
  }

  nextmode() {
    unimplementedWarning("nextmode");
    return;
  }
}

export default Vis;
