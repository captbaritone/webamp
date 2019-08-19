import MakiObject from "./MakiObject";
import { unimplementedWarning } from "../utils";

class Timer extends MakiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Timer";
  }

  setdelay(millisec) {
    unimplementedWarning("setDelay");
  }

  start() {
    unimplementedWarning("start");
  }

  stop() {
    unimplementedWarning("stop");
  }
}

export default Timer;
