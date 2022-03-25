import UI_ROOT from "../../UIRoot";
import { assume, clamp, num, px, throttle } from "../../utils";
import GuiObj from "./GuiObj";

class ActionHandler {
  _slider: Slider;
  constructor(slider: Slider) {
    this._slider=slider;
  }
  _subscription: () => void = () => {};
  // 0-255
  onsetposition(position: number): void {}
  onLeftMouseDown(x: number, y: number): void {}
  onLeftMouseUp(x: number, y: number): void {}
  onMouseMove(x: number, y: number): void {
    this._slider._setPositionXY(x, y);
  }
  onFreeMouseMove(x: number, y: number): void {}
  dispose(): void {
    this._subscription();
  }
}
const MAX = 255;

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Cslider.2F.3E_.26_.3CWasabi:HSlider.2F.3E_.26_.3CWasabi:VSlider.2F.3E
export default class Slider extends GuiObj {
  static GUID = "62b65e3f408d375e8176ea8d771bb94a";
  _barLeft: string;
  _barMiddle: string;
  _barRight: string;
  _vertical: boolean = false;
  _thumb: string;
  _downThumb: string;
  _hoverThumb: string;
  _action: string | null = null;
  _low: number = 0;
  _high: number = 1;
  _thumbWidth: number = 0;
  _thumbHeight: number = 0;
  _position: number = 0;
  _param: string | null = null;
  // _thumbDiv: HTMLDivElement = document.createElement("div");
  _actionHandler: null | ActionHandler;
  _onSetPositionEvenEaten: number;
  _mouseX: number;
  _mouseY: number;

  getRealWidth() {
    return this._div.getBoundingClientRect().width;
  }

  /**
   * set .position by X, Y
   * where X,Y is mouseEvent.offsetX & Y
   */
  _setPositionXY(x: number, y: number) {
    //TODO: consider padding. where padding = thumbSize/2
    const width = this.getRealWidth() - this._thumbWidth;
    const height = this.getheight() - this._thumbHeight;
    const newPercent = this._vertical ? (height - y) / height : x / width;
    this._position = clamp(newPercent, 0, 1);
    this._renderThumbPosition();
    this.doSetPosition(this.getposition());
  }

  _registerDragEvents() {
    // this._thumbDiv.addEventListener("mousedown", (downEvent: MouseEvent) => {
    this._div.addEventListener("mousedown", (downEvent: MouseEvent) => {
      downEvent.stopPropagation();
      if (downEvent.button != 0) return; // only care LeftButton
      // const bitmap = UI_ROOT.getBitmap(this._thumb);
      //TODO: change client/offset into pageX/Y
      const startX = downEvent.clientX;
      const startY = downEvent.clientY;
      const innerX = downEvent.offsetX;
      const innerY = downEvent.offsetY;
      // const width = this.getRealWidth() - this._thumbWidth;
      // const height = this.getheight() - this._thumbHeight;
      // const initialPostition = this._position;
      // const newPercent = this._vertical ? startY / height : startX / width;
      console.log("mouseDown:", downEvent.offsetX, downEvent.offsetY);
      this.doLeftMouseDown(downEvent.offsetX, downEvent.offsetY);

      const handleMove = (moveEvent: MouseEvent) => {
        moveEvent.stopPropagation();
        const newMouseX = moveEvent.clientX;
        const newMouseY = moveEvent.clientY;
        const deltaX = newMouseX - startX;
        const deltaY = newMouseY - startY;

        // const deltaPercent = this._vertical ? deltaY / height : deltaX / width;
        // const newPercent = this._vertical
        //   ? initialPostition - deltaPercent
        //   : initialPostition + deltaPercent;

        // this._position = clamp(newPercent, 0, 1);
        // this._renderThumbPosition();
        // this.doSetPosition(this.getposition());
        //below is mousePosition conversion relative to inner _div
        this.doMouseMove(innerX + deltaX, innerY + deltaY);
      };

      const throttleMouseMove = throttle(handleMove,50)

      const handleMouseUp = (upEvent: MouseEvent) => {
        upEvent.stopPropagation();
        if (upEvent.button != 0) return; // only care LeftButton

        document.removeEventListener("mousemove", throttleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        this.doLeftMouseUp(upEvent.offsetX, upEvent.offsetY);
      };
      document.addEventListener("mousemove", throttleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    });

    //? free mouse move, currently only Equalizers use it. =============
    this._div.addEventListener("mousemove", (moveEvent: MouseEvent) => {
      // moveEvent.stopPropagation();
      this.doFreeMouseMove(moveEvent.offsetX, moveEvent.offsetY);
    });
  }

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      if (key == "action") this._setAction(value);
      return true;
    }
    switch (key.toLowerCase()) {
      case "thumb":
        // (id) The bitmap element for the slider thumb.
        this._thumb = value;
        const bitmap = UI_ROOT.getBitmap(this._thumb);
        this._thumbWidth = bitmap.getWidth();
        this._thumbHeight = bitmap.getHeight();
        break;
      case "downthumb":
        // (id) The bitmap element for the slider thumb when held by the user.
        this._downThumb = value;
        break;
      case "hoverthumb":
        // (id) The bitmap element for the slider thumb when the user's mouse is above it.
        this._hoverThumb = value;
        break;
      case "barmiddle":
        // (id) The bitmap element for the middle, stretched, position of the slider.
        this._barMiddle = value;
        break;
      case "barleft":
        // (id) The bitmap element for the left or top position of the slider.
        this._barLeft = value;
        break;
      case "barright":
        // (id) The bitmap element for the right or bottom position of the slider.
        this._barRight = value;
        break;
      case "orientation":
        // (str) Either "v" or "vertical" to make the slider vertical, otherwise it will be horizontal.
        const lower = value.toLowerCase();
        this._vertical = lower === "v" || lower === "vertical";
        break;
      case "low":
        // (int) Set the low-value boundary. Default is 0.
        this._low = num(value);
        break;
      case "high":
        // (int) Set the high-value boundary. Default is 255.
        this._high = num(value);
        break;
      case "action":
        this._setAction(value);
        break;
      case "param":
        // Undocumented? In MMD3 for EQ (eq_band) action, this seems to indicate _which_ band.
        this._param = value;
        break;
      default:
        return false;
    }
    return true;
  }

  init() {
    // console.log("SLIDER-INITED!");
    this._initializeActionHandler();
    this._registerDragEvents();
  }

  _initializeActionHandler() {
    switch (this._action) {
      case "seek":
        this._actionHandler = new SeekActionHandler(this);
        break;
      case "eq_band":
        if (this._param == "preamp")
          this._actionHandler = new PreampActionHandler(this, this._param);
        else this._actionHandler = new EqActionHandler(this, this._param);
        break;
      case "eq_preamp":
        break;
      case "pan":
        this._actionHandler = new PanActionHandler(this);
        break;
      case "volume":
        this._actionHandler = new VolumeActionHandler(this);
        break;
      case null:
        break;
      default:
        assume(false, `Unhandled slider action: ${this._action}`);
    }
  }

  _setAction(value: string) {
    if (this._actionHandler != null) {
      this._actionHandler.dispose();
      this._actionHandler = null;
    }
    this._action = value.toLowerCase();

    // If we've already initialized we might have an action handler already. In
    // that case, we want to reinitialize.
    if (this._actionHandler != null) {
      this._actionHandler.dispose();
      this._initializeActionHandler();
    }
  }

  // extern Int Slider.getPosition();
  getposition(): number {
    return this._position * MAX;
  }

  onsetposition(newPos: number) {
    this._onSetPositionEvenEaten = UI_ROOT.vm.dispatch(this, "onsetposition", [
      //needed by seekerGhost
      { type: "INT", value: newPos },
    ]);
  }
  doSetPosition(newPos: number) {
    this.onsetposition(newPos);
    if (this._actionHandler != null) {
      this._actionHandler.onsetposition(newPos);
    }
  }

  doLeftMouseDown(x: number, y: number) {
    this._setPositionXY(x, y);
    UI_ROOT.vm.dispatch(this, "onleftbuttondown", [
      { type: "INT", value: x },
      { type: "INT", value: y },
    ]);
    if (this._actionHandler != null) {
      this._actionHandler.onLeftMouseDown(x, y);
    }
  }
  doMouseMove(x: number, y: number) {
    if (this._actionHandler != null) {
      this._actionHandler.onMouseMove(x, y);
    }
  }
  doLeftMouseUp(x: number, y: number) {
    // console.log("slider.doLeftMouseUp");
    UI_ROOT.vm.dispatch(this, "onleftbuttonup", [
      { type: "INT", value: x },
      { type: "INT", value: y },
    ]);
    UI_ROOT.vm.dispatch(this, "onsetfinalposition", [
      { type: "INT", value: this.getposition() },
    ]);
    UI_ROOT.vm.dispatch(this, "onpostedposition", [
      { type: "INT", value: this.getposition() },
    ]);
    if (this._actionHandler != null) {
      // console.log("slider_ACTION.doLeftMouseUp");
      this._actionHandler.onLeftMouseUp(x, y);
    }
  }

  doFreeMouseMove(x: number, y: number) {
    // UI_ROOT.vm.dispatch(this, "onleftbuttondown", [
    //   { type: "INT", value: x },
    //   { type: "INT", value: y },
    // ]);
    if (this._actionHandler != null) {
      this._actionHandler.onFreeMouseMove(x, y);
    }
  }

  _renderThumb() {
    // this._thumbDiv.style.position = "absolute";
    // this._thumbDiv.setAttribute("data-obj-name", "Slider::Handle");
    // this._thumbDiv.classList.add("webamp--img");
    if (this._thumb != null) {
      const bitmap = UI_ROOT.getBitmap(this._thumb);
      // this._thumbDiv.style.width = px(bitmap.getWidth());
      // this._thumbDiv.style.height = px(bitmap.getHeight());
      // bitmap.setAsBackground(this._thumbDiv);

      bitmap._setAsBackground(this._div, "thumb-");
      this._div.style.setProperty("--thumb-width", px(bitmap.getWidth()));
      this._div.style.setProperty("--thumb-height", px(bitmap.getHeight()));
    }

    if (this._downThumb != null) {
      const bitmap = UI_ROOT.getBitmap(this._downThumb);
      // bitmap.setAsDownBackground(this._thumbDiv);

      bitmap._setAsBackground(this._div, "thumb-down-");
    }

    if (this._hoverThumb != null) {
      const bitmap = UI_ROOT.getBitmap(this._hoverThumb);
      // bitmap.setAsHoverBackground(this._thumbDiv);

      bitmap._setAsBackground(this._div, "thumb-hover-");
    }
  }

  _renderThumbPosition() {
    if (this._thumb != null) {
      // const bitmap = UI_ROOT.getBitmap(this._thumb);
      // TODO: What if the orientation has changed?
      if (this._vertical) {
        const top =
          (1 - this._position) * (this.getheight() - this._thumbHeight);
        // this._thumbDiv.style.top = px(top);

        this._div.style.setProperty("--thumb-top", px(top));
      } else {
        // const left = (1 - this._position * (this.getwidth() - bitmap.getWidth());
        const curwidth = this.getRealWidth();
        const left = this._position * (curwidth - this._thumbWidth);
        // console.log('thumb.left', this._position, left, 'w:',this.getwidth(),'bmp.w:', bitmap.getWidth())
        // this._thumbDiv.style.left = px(left);

        this._div.style.setProperty("--thumb-left", px(left));
      }
    }
  }

  draw() {
    super.draw();
    this._div.setAttribute("data-obj-name", "Slider");
    assume(this._barLeft == null, "Need to handle Slider barleft");
    assume(this._barRight == null, "Need to handle Slider barright");
    assume(this._barMiddle == null, "Need to handle Slider barmiddle");
    this._renderThumb();
    this._renderThumbPosition();
    // this._div.appendChild(this._thumbDiv);
  }

  dispose() {
    if (this._actionHandler) {
      this._actionHandler.dispose();
    }
    super.dispose();
  }

  /*
  extern Slider.onPostedPosition(int newpos);
  extern Slider.onSetFinalPosition(int pos);
  extern Slider.setPosition(int pos);
  extern Slider.lock(); // locks descendant core collbacks
  extern Slider.unlock(); // unloads the
  */
}

/*****
 * Here we have the action handlers for the different action types:
 * Each one takes a reference to the slider and adds some extra behavior.
 * It's a bit odd that they access pirvate fields/methods, but since they live
 * in the same file I've allowed myself the sin of doing that.
 **/

// eslint-disable-next-line rulesdir/proper-maki-types

class SeekActionHandler extends ActionHandler {
  _pendingChange: boolean;

  isPendingChange(): boolean {
    return true; // this._pendingChange || this._dragging;
    // return this._dragging == true;
  }

  constructor(slider: Slider) {
    super(slider);
    this._registerOnAudioProgress();
  }

  _registerOnAudioProgress() {
    this._subscription = UI_ROOT.audio.onCurrentTimeChange(
      this._onAudioProgres
    );
  }

  _onAudioProgres = () => {
    if (!this._pendingChange) {
      if (this._slider.getId() == "seekerghost")
        console.log("thumb: not isPending()!");
      this._slider._position = UI_ROOT.audio.getCurrentTimePercent();
      // TODO: We could throttle this, or only render if the change is "significant"?
      this._slider._renderThumbPosition();
    }
  };

  onsetposition(position: number): void {
    // console.log("seek:", position);
    this._pendingChange = this._slider._onSetPositionEvenEaten != 0;
    if (!this._pendingChange) {
      UI_ROOT.audio.seekToPercent(position / MAX);
    }
  }

  // onLeftMouseDown(x: number, y: number) {}
  onLeftMouseUp(x: number, y: number) {
    // console.log("slider_ACTION.doLeftMouseUp");
    if (this._pendingChange) {
      this._pendingChange = false;
      UI_ROOT.audio.seekToPercent(this._slider.getposition() / MAX);
    }
  }
}

const EqGlobalVar = { eqMouseDown: false, targetSlider: null };
// eslint-disable-next-line rulesdir/proper-maki-types
class EqActionHandler extends ActionHandler {
  _kind: string;

  constructor(slider: Slider, kind: string) {
    super(slider);
    this._kind = kind;
    const update = () => {
      slider._position = UI_ROOT.audio.getEq(kind);
      slider._renderThumbPosition();
    };
    update();
    this._subscription = UI_ROOT.audio.onEqChange(kind, update);
  }

  onLeftMouseDown(x: number, y: number): void {
    EqGlobalVar.eqMouseDown = true;
  }
  onLeftMouseUp(x: number, y: number): void {
    EqGlobalVar.eqMouseDown = false;
  }

  onFreeMouseMove(x: number, y: number): void {
    if (EqGlobalVar.eqMouseDown) {
      EqGlobalVar.targetSlider = this._slider;
      this._slider._setPositionXY(x, y);
    }
  }

  onMouseMove(x: number, y: number): void {
    if (EqGlobalVar.eqMouseDown && EqGlobalVar.targetSlider) {
      // send mouse pos to last hovered slider
      EqGlobalVar.targetSlider._setPositionXY(x, y);
    }
  }

  onsetposition(position: number): void {
    UI_ROOT.audio.setEq(this._kind, position / MAX);
  }
}

// eslint-disable-next-line rulesdir/proper-maki-types
class PreampActionHandler extends ActionHandler {
  _kind: string;
  constructor(slider: Slider, kind: string) {
    super(slider);
    this._kind = kind;
    const update = () => {
      slider._position = UI_ROOT.audio.getEq(kind);
      slider._renderThumbPosition();
    };
    update();
    this._subscription = UI_ROOT.audio.onEqChange(kind, update);
  }

  onsetposition(position: number): void {
    UI_ROOT.audio.setEq(this._kind, position / MAX);
  }
}

// eslint-disable-next-line rulesdir/proper-maki-types
class PanActionHandler extends ActionHandler {
  onsetposition(position: number): void {
    // TODO
  }
}

// eslint-disable-next-line rulesdir/proper-maki-types
class VolumeActionHandler extends ActionHandler {
  _changing: boolean = false;

  constructor(slider: Slider) {
    super(slider);
    slider._position = UI_ROOT.audio.getVolume();
    slider._renderThumbPosition();

    this._subscription = UI_ROOT.audio.onVolumeChanged(() => {
      if (!this._changing) {
        slider._position = UI_ROOT.audio.getVolume();
        slider._renderThumbPosition();
      }
    });
  }

  onsetposition(position: number): void {
    UI_ROOT.audio.setVolume(position / 255);
  }
  onLeftMouseDown(x: number, y: number) {
    this._changing = true;
  }
  onLeftMouseUp(x: number, y: number) {
    this._changing = false;
  }
}
