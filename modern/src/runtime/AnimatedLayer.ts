import Layer from "./Layer";
import { unimplementedWarning } from "../utils";
import { XmlNode } from "../types";
import MakiObject from "./MakiObject";

// Eventually we will want to type the attributes for each MakiObject. To do
// that we will need patterns and utilities that make it easy. This is a first
// stab at a pattern with a few utility functions. The idea is that the
// attributes we expect are all typed as optional strings, since I think all XML
// attributes are optional. Then we have utility functions which handle type
// coersion with default values.
//
// My goal is that the XML attributes parsed in
// the constructor and pulled into typed local properties.
type JSImage = {
  imgUrl: string;
  h: number;
  w: number;
  x: number;
  y: number;
};

type Attributes = {
  js_assets: {
    image: JSImage;
  };
  end?: string;
  frameheight?: string;
  framewidth?: string;
  autoplay?: string;
  autoreplay?: string;
  start?: string;
  speed?: string;
  h?: string;
  w?: string;
};

function getNumber(attr: string | undefined, fallback: number): number {
  return attr === undefined ? fallback : Number(attr);
}

function getBoolean(attr: string | undefined, fallback: boolean): boolean {
  // TODO: Check if there are othe values that parse as `true`, there probably are.
  return attr === undefined ? fallback : attr === "1";
}

class AnimatedLayer extends Layer {
  _typedAttributes: Attributes;
  _playing: boolean;
  _autoReplay: boolean;
  _start: number;
  _end: number;
  _speed: number;
  _frameNum: number;
  _animationStartTime: number;
  _animationCancelID: number | null;

  constructor(node: XmlNode, parent: MakiObject, annotations: Object = {}) {
    super(node, parent, annotations);
    // @ts-ignore For now MakiObject defines a much-too-generic version of
    // attributes. Eventually we will want to be able to define the XML node we
    // expect locally. For now we will just cheat.
    this._typedAttributes = this.attributes;
    const { autoplay, autoreplay, start, speed } = this._typedAttributes;

    // Default values from http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Canimatedlayer.2F.3E
    this._playing = getBoolean(autoplay, false);
    this._autoReplay = getBoolean(autoreplay, true);
    this._frameNum = getNumber(start, 0);
    this._start = getNumber(start, 0);
    this._speed = getNumber(speed, 200);
    this._end = this._initializeEnd();

    this._animationStartTime = 0;
    this._animationCancelID = null;

    this._setupAnimationLoop();
  }

  _initializeEnd(): number {
    const {
      end,
      js_assets,
      frameheight,
      framewidth,
      w,
      h,
    } = this._typedAttributes;

    if (end != null) {
      return getNumber(end, 0);
    }

    const { image } = js_assets;
    if (!image) {
      console.warn("Could not find js_assets image");
      return 0;
    }

    const typedFrameHeight = getNumber(frameheight, 0);
    const typedFrameWidth = getNumber(framewidth, 0);

    if (typedFrameHeight !== 0) {
      return Math.ceil(image.h / typedFrameHeight);
    } else if (typedFrameWidth !== 0) {
      return Math.ceil(image.w / typedFrameWidth);
    }
    // In the general case where we don't have a frameheight/framewidth and
    // the start/end are not both set, we calculate the end frame by
    // calculating the end in both directions and picking the longer repeat length
    const width = getNumber(w, image.w);
    const height = getNumber(h, image.h);
    return Math.max(Math.ceil(image.w / width), Math.ceil(image.h / height));
  }

  _animationLoop() {
    this._animationCancelID = window.requestAnimationFrame(() => {
      const currentTime = window.performance.now();
      if (currentTime > this._animationStartTime + this._speed) {
        this._animationStartTime = currentTime;
        this.js_trigger("js_framechange");
      } else {
        this._animationLoop();
      }
    });
  }

  _setupAnimationLoop() {
    this.js_listen("js_framechange", () => {
      this._frameNum += 1;
      if (this._frameNum > this.getendframe()) {
        this._frameNum = this.getstartframe();
        if (!this._autoReplay) {
          return;
        }
      }
      this.js_trigger("js_update");

      if (this._playing) {
        this._animationLoop();
      }
    });

    if (this._playing) {
      this.js_trigger("js_framechange");
    }
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
  getclassname(): string {
    return "AnimatedLayer";
  }

  play(): void {
    // TODO: do we need to trigger something for `onplay`/`onresume` events?
    this._playing = true;
    this.js_trigger("js_framechange");
  }

  pause(): void {
    // TODO: do we need to trigger something for `onpause` events?
    this._playing = false;
  }

  stop(): void {
    // TODO: do we need to trigger something for `onstop` events?
    this._playing = false;
    this._frameNum = this.getstartframe();
  }

  setspeed(msperframe: number): void {
    this._speed = msperframe;
  }

  gotoframe(framenum: number): void {
    this._frameNum = framenum;
    this.js_trigger("js_update");
  }

  getlength(): number {
    return this.getendframe() - this.getstartframe();
  }

  onplay(): void {
    this.js_trigger("onPlay");
  }

  onpause(): void {
    this.js_trigger("onPause");
  }

  onresume(): void {
    this.js_trigger("onResume");
  }

  onstop(): void {
    this.js_trigger("onStop");
  }

  onframe(framenum: number): void {
    this.js_trigger("onFrame", framenum);
  }

  setstartframe(framenum: number): void {
    this._start = framenum;
  }

  setendframe(framenum: number): void {
    this.attributes.end = framenum;
  }

  setautoreplay(onoff: boolean): void {
    // TODO: should this trigger the animation if it isn't currently runnnig?
    this._autoReplay = onoff;
  }

  isplaying(): boolean {
    return this._playing;
  }

  ispaused(): boolean {
    return unimplementedWarning("ispaused");
  }

  isstopped(): boolean {
    return unimplementedWarning("isstopped");
  }

  getstartframe(): number {
    return this._start;
  }

  getendframe(): number {
    return this._end;
  }

  getdirection(): number {
    return unimplementedWarning("getdirection");
  }

  getautoreplay(): boolean {
    return this._autoReplay;
  }

  getcurframe(): number {
    return this._frameNum;
  }

  setrealtime(onoff: boolean): void {
    return unimplementedWarning("setrealtime");
  }
}

export default AnimatedLayer;
