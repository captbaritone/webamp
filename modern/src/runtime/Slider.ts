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

  getposition(): number {
    unimplementedWarning("getposition");
    return 0;
  }

  onsetposition(newpos: number): void {
    this.js_trigger("onSetPosition", newpos);
  }

  onpostedposition(newpos: number): void {
    this.js_trigger("onPostedPosition", newpos);
  }

  onsetfinalposition(pos: number): void {
    this.js_trigger("onSetFinalPosition", pos);
  }

  setposition(pos: number): void {
    return unimplementedWarning("setposition");
  }

  lock(): void {
    return unimplementedWarning("lock");
  }

  unlock(): void {
    return unimplementedWarning("unlock");
  }
}

export default Slider;
