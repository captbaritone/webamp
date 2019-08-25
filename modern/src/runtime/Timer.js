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

  ontimer() {
    unimplementedWarning("ontimer");
    return;
  }

  getdelay() {
    unimplementedWarning("getdelay");
    return;
  }

  isrunning() {
    unimplementedWarning("isrunning");
    return;
  }

  getskipped() {
    unimplementedWarning("getskipped");
    return;
  }
}

export default Timer;
