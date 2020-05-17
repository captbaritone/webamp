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

  setmode(mode: number): void {
    unimplementedWarning("setmode");
  }

  onframe(): void {
    this.js_trigger("onFrame");
  }

  setrealtime(onoff: boolean): void {
    return unimplementedWarning("setrealtime");
  }

  getrealtime(): boolean {
    return unimplementedWarning("getrealtime");
  }

  getmode(): number {
    return unimplementedWarning("getmode");
  }

  nextmode(): void {
    return unimplementedWarning("nextmode");
  }
}

export default Vis;
