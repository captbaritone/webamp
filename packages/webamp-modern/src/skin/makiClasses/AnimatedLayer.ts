import UI_ROOT from "../../UIRoot";
import { ensureVmInt, num, px } from "../../utils";
import Layer from "./Layer";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Canimatedlayer.2F.3E
export default class AnimatedLayer extends Layer {
  static GUID = "6b64cd274c4b5a26a7e6598c3a49f60c";
  _currentFrame: number = 0;
  _startFrame: number = 0;
  _endFrame: number = 0;
  _speed: number = 0;
  _frameWidth: number;
  _frameHeight: number;
  _animationInterval: NodeJS.Timeout | null = null;

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "frameheight":
        this._frameHeight = num(value);
        this._renderHeight();
        break;
      default:
        return false;
    }
    return true;
  }

  _renderHeight() {
    super._renderHeight();
    if (this._frameHeight) {
      const height = parseInt(this._div.style.height);
      this._div.style.height = px(this._frameHeight);
      this._div.style.transform = `scaleY(${height / this._frameHeight})`;
      this._div.style.transformOrigin = "top left";
    }
  }

  _getImageHeight(): number {
    const bitmap = UI_ROOT.getBitmap(this._image);
    return bitmap.getHeight();
  }

  getlength(): number {
    // TODO: What about other orientations?
    return this._getImageHeight() / (this._frameHeight || this.getheight());
  }
  gotoframe(framenum: number) {
    this._currentFrame = ensureVmInt(framenum);
    this._renderFrame();
    UI_ROOT.vm.dispatch(this, "onframe", [
      { type: "INT", value: this._currentFrame },
    ]);
  }
  getcurframe(): number {
    return this._currentFrame;
  }
  setstartframe(framenum: number) {
    this._startFrame = ensureVmInt(framenum);
  }
  setendframe(framenum: number) {
    this._endFrame = ensureVmInt(framenum);
  }
  setspeed(msperframe: number) {
    this._speed = msperframe;
  }
  play() {
    if (this._animationInterval != null) {
      clearInterval(this._animationInterval);
      this._animationInterval = null;
    }
    const end = this._endFrame;
    const start = this._startFrame;

    const change = end > start ? 1 : -1;

    let frame = this._startFrame;
    this.gotoframe(frame);
    UI_ROOT.vm.dispatch(this, "onplay");
    if (frame === end) {
      this.stop();
      return;
    }
    this._animationInterval = setInterval(() => {
      frame += change;
      this.gotoframe(frame);
      if (frame === end) {
        clearInterval(this._animationInterval);
        this._animationInterval = null;
        this.stop();
      }
    }, this._speed);
  }
  pause() {
    UI_ROOT.vm.dispatch(this, "onpause");
    // TODO
  }
  stop() {
    if (this._animationInterval != null) {
      clearInterval(this._animationInterval);
      this._animationInterval = null;
    }
    UI_ROOT.vm.dispatch(this, "onstop");
  }
  isplaying(): boolean {
    return this._animationInterval != null;
  }

  _getActualHeight():number {
    return this._height || this._div.getBoundingClientRect().height;
  }

  _renderFrame() {
    this._div.style.backgroundPositionY = px(
      -(this._currentFrame * this._getActualHeight())
    );
  }

  /*
extern AnimatedLayer.onPause();
extern AnimatedLayer.onResume();
extern AnimatedLayer.setAutoReplay(Boolean onoff);
extern Boolean AnimatedLayer.isPaused();
extern Boolean AnimatedLayer.isStopped();
extern Int AnimatedLayer.getDirection();
extern Boolean AnimatedLayer.getAutoReplay();
extern AnimatedLayer.setRealtime(Boolean onoff);
*/

  draw() {
    super.draw();
    this._renderFrame();
    this._div.setAttribute("data-obj-name", "AnimatedLayer");
  }
}
