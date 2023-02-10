import { ensureVmInt, num, px, toBool } from "../../utils";
import Layer from "./Layer";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Canimatedlayer.2F.3E
export default class AnimatedLayer extends Layer {
  static GUID = "6b64cd274c4b5a26a7e6598c3a49f60c";
  _vertical: boolean = true;
  _currentFrame: number = 0;
  _startFrame: number = 0;
  _endFrame: number = 0;
  _speed: number = 200;
  _frameWidth: number;
  _frameHeight: number;
  _autoReplay: boolean = true;
  _autoPlay: boolean = false;
  _animationInterval: NodeJS.Timeout | null = null;
  _imageFormat: string; // api helper, together with elementFrames.
  _elementFrames: number;

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (key == "image" && /\%[0-9]*d/.test(value)) {
      this._imageFormat = value;
      return true;
    }
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "speed":
        this._speed = num(value);
        break;
      case "start":
        this._startFrame = num(value);
        break;
      case "end":
        this._endFrame = num(value);
        break;
      case "frameheight":
        // (int) The height in pixels of each cell of animation.
        // If frameheight is set, the animation will be assumed to be a vertical
        // strip of cells in the given bitmap.
        this._frameHeight = num(value);
        this._vertical = true;
        break;
      case "framewidth":
        // (int) The height in pixels of each cell of animation.
        // If frameheight is set, the animation will be assumed to be a vertical
        // strip of cells in the given bitmap.
        this._frameWidth = num(value);
        this._vertical = false;
        break;
      case "autoplay":
        this._autoPlay = toBool(value);
        break;
      case "autoreplay":
        this._autoReplay = toBool(value);
        break;
      default:
        return false;
    }
    return true;
  }

  // _renderHeight() {
  //   super._renderHeight();
  //   if (this._frameHeight) {
  //     const height = parseInt(this._div.style.height);
  //     this._div.style.height = px(this._frameHeight);
  //     this._div.style.transform = `scaleY(${height / this._frameHeight})`;
  //     this._div.style.transformOrigin = "top left";
  //   }
  // }

  _getImageHeight(): number {
    const bitmap = this._uiRoot.getBitmap(this._image);
    return bitmap.getHeight();
  }

  // api
  getlength(): number {
    const bitmap = this._uiRoot.getBitmap(this._image);
    // return bitmap.getHeight();
    if (!bitmap || !bitmap.getImg()) {
      return 0;
    }

    if (this._vertical) {
      return bitmap.getHeight() / (this._frameHeight || this.getheight());
    } else {
      return bitmap.getWidth() / (this._frameWidth || this.getwidth());
    }
  }
  gotoframe(framenum: number) {
    this._currentFrame = ensureVmInt(framenum);
    this._renderFrame();
    this._uiRoot.vm.dispatch(this, "onframe", [
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
    const backward: boolean = end < start;

    let frame = this._startFrame;
    this.gotoframe(frame); // initially, jump to start

    this._uiRoot.vm.dispatch(this, "onplay");

    if (frame === end && !this._autoReplay) {
      this.stop();
      return;
    }
    this._animationInterval = setInterval(() => {
      this.gotoframe(frame); // visual update

      if (frame === end) {
        if (!this._autoReplay) {
          // clearInterval(this._animationInterval);
          // this._animationInterval = null;
          this.stop();
        }
      }
      if (backward) {
        // warning: should able to animate! through every single frame. dont jump!
        frame -= 1;
        if (frame < end) {
          frame = start;
        } else if (frame > start) {
          frame = end;
        }
      } else {
        // normal, go forward
        frame += change;
        if (frame < start) {
          frame = end;
        } else if (frame > end) {
          frame = start;
        }
      }
    }, this._speed);
  }
  pause() {
    this._uiRoot.vm.dispatch(this, "onpause");
    // TODO
  }
  stop() {
    if (this._animationInterval != null) {
      clearInterval(this._animationInterval);
      this._animationInterval = null;
    }
    this._uiRoot.vm.dispatch(this, "onstop");
  }
  isplaying(): boolean {
    return this._animationInterval != null;
  }

  _getActualHeight(): number {
    return this._h || this._div.getBoundingClientRect().height;
  }

  init() {
    super.init();
    if (!this._frameHeight) {
      this._frameHeight = this.getheight();
    }
    if (this._endFrame == 0 && this.getlength() > 0) {
      this._endFrame = this.getlength() - 1;
    }
    if (this._startFrame != 0) {
      this.gotoframe(this._startFrame);
    }
    if (this._autoPlay) this.play();
  }
  _renderFrame() {
    if (this._vertical) {
      this._div.style.backgroundPositionY = px(
        -(this._currentFrame * this._frameHeight)
      );
    } else {
      this._div.style.backgroundPositionX = px(
        -(this._currentFrame * this._frameWidth)
      );
    }
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
