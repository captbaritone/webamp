import Layer from "./Layer";
import { unimplementedWarning } from "../utils";
import { XmlNode } from "../types";
import MakiObject from "./MakiObject";

class AnimatedLayer extends Layer {
  _playing: boolean;
  _frameNum: number;
  _animationStartTime: number;

  constructor(node: XmlNode, parent: MakiObject, annotations: Object = {}) {
    super(node, parent, annotations);

    this._setAttributeDefaults();
    this._convertAttributeTypes();
    this._initializeStartAndEnd();

    this._playing = this.attributes.autoplay;
    this._frameNum = this.attributes.start || 0;
    this._animationStartTime = 0;

    this._setupAnimationLoop();
  }

  _setAttributeDefaults(): void {
    const { attributes } = this;
    if (attributes.autoplay == null) {
      attributes.autoplay = "0";
    }
    if (attributes.autoreplay == null) {
      attributes.autoreplay = "1";
    }
    if (attributes.speed == null) {
      attributes.speed = "200";
    }
  }

  _convertAttributeTypes(): void {
    const { attributes } = this;
    if (attributes.autoplay != null) {
      attributes.autoplay = !!Number(attributes.autoplay);
    }
    if (attributes.autoreplay != null) {
      attributes.autoreplay = !!Number(attributes.autoreplay);
    }
    if (attributes.speed != null) {
      attributes.speed = Number(attributes.speed);
    }
    if (attributes.start != null) {
      attributes.start = Number(attributes.start);
    }
    if (attributes.end != null) {
      attributes.end = Number(attributes.end);
    }
  }

  _initializeStartAndEnd(): void {
    const { attributes } = this;
    if (attributes.start != null && attributes.end != null) {
      return;
    }

    const image = attributes.js_assets.image;
    if (!image) {
      console.warn("Could not find image: ", attributes.image);
      return;
    }

    if (attributes.start == null) {
      attributes.start = 0;
    }

    if (attributes.end == null) {
      if (attributes.frameheight != null) {
        attributes.end = Math.ceil(image.h / attributes.frameheight);
      } else if (attributes.framewidth != null) {
        attributes.end = Math.ceil(image.w / attributes.framewidth);
      } else {
        // In the general case where we don't have a frameheight/framewidth and
        // the start/end are not both set, we calculate the end frame by
        // calculating the end in both directions and picking the longer repeat length
        const width = attributes.w != null ? attributes.w : image.w;
        const height = attributes.h != null ? attributes.h : image.h;
        attributes.end = Math.max(
          Math.ceil(image.w / width),
          Math.ceil(image.h / height)
        );
      }
    }
  }

  _animationLoop() {
    window.requestAnimationFrame(() => {
      const currentTime = window.performance.now();
      if (currentTime > this._animationStartTime + this.attributes.speed) {
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
        if (!this.attributes.autoreplay) {
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
    this.attributes.speed = msperframe;
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
    this.attributes.start = framenum;
  }

  setendframe(framenum: number): void {
    this.attributes.end = framenum;
  }

  setautoreplay(onoff: boolean): void {
    // TODO: should this trigger the animation if it isn't currently runnnig?
    this.attributes.autoreplay = onoff;
  }

  isplaying(): boolean {
    return this._playing;
  }

  ispaused() {
    unimplementedWarning("ispaused");
    return;
  }

  isstopped() {
    unimplementedWarning("isstopped");
    return;
  }

  getstartframe(): number {
    return this.attributes.start;
  }

  getendframe(): number {
    return this.attributes.end;
  }

  getdirection() {
    unimplementedWarning("getdirection");
    return;
  }

  getautoreplay(): boolean {
    return this.attributes.autoreplay;
  }

  getcurframe(): number {
    return this._frameNum;
  }

  setrealtime(onoff: boolean) {
    unimplementedWarning("setrealtime");
    return;
  }
}

export default AnimatedLayer;
