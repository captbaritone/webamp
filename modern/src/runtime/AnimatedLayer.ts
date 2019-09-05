import Layer from "./Layer";
import { unimplementedWarning } from "../utils";

class AnimatedLayer extends Layer {
  _playing: boolean;
  _frameNum: number;

  constructor(node, parent, annotations, store) {
    super(node, parent, annotations, store);

    if (!node.attributes.hasOwnProperty("autoplay")) {
      node.attributes.autoplay = "0";
    }

    if (!node.attributes.hasOwnProperty("autoreplay")) {
      node.attributes.autoreplay = "1";
    }

    if (!node.attributes.hasOwnProperty("speed")) {
      node.attributes.speed = "200";
    }

    node.attributes.autoplay = !!Number(node.attributes.autoplay);
    node.attributes.autoreplay = !!Number(node.attributes.autoreplay);
    node.attributes.speed = Number(node.attributes.speed);
    node.attributes.start = Number(node.attributes.start);
    node.attributes.end = Number(node.attributes.end);

    this._initializeStartEnd(node);

    this._playing = node.attributes.autoplay;
    this._frameNum = node.attributes.start || 0;

    this.js_listen("js_framechange", () => {
      this._frameNum += 1;
      if (this._frameNum > this.getendframe()) {
        this._frameNum = this.getstartframe();
        if (!node.attributes.autoreplay) {
          return;
        }
      }
      this.js_trigger("js_update");

      if (this._playing) {
        setTimeout(
          () => this.js_trigger("js_framechange"),
          node.attributes.speed
        );
      }
    });

    if (this._playing) {
      this.js_trigger("js_framechange");
    }
  }

  _initializeStartEnd(node) {
    if (
      node.attributes.start !== undefined &&
      node.attributes.end !== undefined
    ) {
      return;
    }

    const image = this.js_imageLookup(node.attributes.image);
    if (!image) {
      console.warn("Could not find image: ", node.attributes.image);
      return;
    }

    let start, end;
    if (node.attributes.frameheight) {
      start = 0;
      end = Math.ceil(image.h / node.attributes.frameheight);
    } else if (node.attributes.framewidth) {
      start = 0;
      end = Math.ceil(image.w / node.attributes.framewidth);
    } else {
      // In the general case where we don't have a frameheight/framewidth and
      // the start/end are not both set, we calculate the end frame by
      // calculating the end in both directions and picking the longer repeat length
      const width =
        node.attributes.w !== undefined ? node.attributes.w : image.w;
      const height =
        node.attributes.h !== undefined ? node.attributes.h : image.h;
      start = 0;
      end = Math.max(Math.ceil(image.w / width), Math.ceil(image.h / height));
    }

    if (node.attributes.start !== undefined) {
      node.attributes.start = start;
    }

    if (node.attributes.end !== undefined) {
      node.attributes.end = end;
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
  }

  getlength(): number {
    return this.getendframe() - this.getstartframe();
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

  setstartframe(framenum: number): void {
    this.attributes.start = framenum;
  }

  setendframe(framenum: number): void {
    this.attributes.end = framenum;
  }

  setautoreplay(onoff: boolean): void {
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
