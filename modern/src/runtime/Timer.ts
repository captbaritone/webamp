import MakiObject from "./MakiObject";
import { unimplementedWarning } from "../utils";
import { XmlNode } from "../types";

class Timer extends MakiObject {
  _speed: number;
  _animationStartTime: number;
  _animationCancelID: number | null;

  constructor(node: XmlNode, parent: MakiObject, annotations: Object = {}) {
    super(node, parent, annotations);

    this._speed = 200;
    this._animationStartTime = 0;
    this._animationCancelID = null;
  }

  _animationLoop(): void {
    this._animationCancelID = window.requestAnimationFrame((currentTime) => {
      if (currentTime > this._animationStartTime + this._speed) {
        this._animationStartTime = currentTime;
        this.ontimer();
      }
      this._animationLoop();
    });
  }

  js_delete() {
    if (this._animationCancelID != null) {
      window.cancelAnimationFrame(this._animationCancelID);
    }
    super.js_delete();
  }

  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Timer";
  }

  setdelay(millisec: number): void {
    this._speed = millisec;
  }

  start(): void {
    this._animationStartTime = window.performance.now();
    this._animationLoop();
  }

  stop(): void {
    if (this._animationCancelID == null) {
      return;
    }

    window.cancelAnimationFrame(this._animationCancelID);
    this._animationCancelID = null;
  }

  ontimer(): void {
    this.js_trigger("onTimer");
  }

  getdelay(): number {
    return this._speed;
  }

  isrunning(): boolean {
    return this._animationCancelID != null;
  }

  getskipped(): number {
    return unimplementedWarning("getskipped");
  }
}

export default Timer;
