import MakiObject from "./MakiObject";
import { unimplementedWarning } from "../utils";

class Timer extends MakiObject {
  _speed: number;
  _animationStartTime: number;
  _animationCancelID: number;

  constructor(node, parent, annotations) {
    super(node, parent, annotations);

    this._speed = 200;
    this._animationStartTime = 0;
    this._animationCancelID = null;
  }

  _animationLoop(): void {
    this._animationCancelID = window.requestAnimationFrame(currentTime => {
      if (currentTime > this._animationStartTime + this._speed) {
        this._animationStartTime = currentTime;
        this.ontimer();
      }
      this._animationLoop();
    });
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

  getskipped() {
    unimplementedWarning("getskipped");
    return;
  }
}

export default Timer;
