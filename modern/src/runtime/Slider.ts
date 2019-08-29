import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

class Slider extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Slider";
  }

  getposition() {
    unimplementedWarning("getposition");
    return 0;
  }

  onsetposition(newpos: number) {
    unimplementedWarning("onsetposition");
  }

  onpostedposition(newpos: number) {
    unimplementedWarning("onpostedposition");
    return;
  }

  onsetfinalposition(pos: number) {
    unimplementedWarning("onsetfinalposition");
    return;
  }

  setposition(pos: number) {
    unimplementedWarning("setposition");
    return;
  }

  lock() {
    unimplementedWarning("lock");
    return;
  }

  unlock() {
    unimplementedWarning("unlock");
    return;
  }
}

export default Slider;
