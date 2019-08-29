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

  setspeed(msperframe: number) {
    unimplementedWarning("setspeed");
  }

  gotoframe(framenum: number) {
    unimplementedWarning("gotoframe");
  }

  getlength() {
    unimplementedWarning("getlength");
    return 10;
  }

  onplay() {
    unimplementedWarning("onplay");
    return;
  }

  onpause() {
    unimplementedWarning("onpause");
    return;
  }

  onresume() {
    unimplementedWarning("onresume");
    return;
  }

  onstop() {
    unimplementedWarning("onstop");
    return;
  }

  onframe(framenum: number) {
    unimplementedWarning("onframe");
    return;
  }

  setstartframe(framenum: number) {
    unimplementedWarning("setstartframe");
    return;
  }

  setendframe(framenum: number) {
    unimplementedWarning("setendframe");
    return;
  }

  setautoreplay(onoff: boolean) {
    unimplementedWarning("setautoreplay");
    return;
  }

  isplaying() {
    unimplementedWarning("isplaying");
    return;
  }

  ispaused() {
    unimplementedWarning("ispaused");
    return;
  }

  isstopped() {
    unimplementedWarning("isstopped");
    return;
  }

  getstartframe() {
    unimplementedWarning("getstartframe");
    return;
  }

  getendframe() {
    unimplementedWarning("getendframe");
    return;
  }

  getdirection() {
    unimplementedWarning("getdirection");
    return;
  }

  getautoreplay() {
    unimplementedWarning("getautoreplay");
    return;
  }

  getcurframe() {
    unimplementedWarning("getcurframe");
    return;
  }

  setrealtime(onoff: boolean) {
    unimplementedWarning("setrealtime");
    return;
  }
}

export default AnimatedLayer;
