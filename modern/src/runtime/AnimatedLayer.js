import Layer from "./Layer";
import { unimplementedWarning } from "../utils";

class AnimatedLayer extends Layer {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "AnimatedLayer";
  }

  play() {
    unimplementedWarning("play");
  }

  pause() {
    unimplementedWarning("pause");
  }

  stop() {
    unimplementedWarning("stop");
  }

  setspeed(msperframe) {
    unimplementedWarning("setspeed");
  }

  gotoframe(framenum) {
    unimplementedWarning("gotoframe");
  }

  getlength() {
    unimplementedWarning("getlength");
    return 10;
  }
}

export default AnimatedLayer;
