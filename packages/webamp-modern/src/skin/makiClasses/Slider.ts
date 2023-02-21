import { UIRoot } from "../../UIRoot";
import { assume, clamp, num, px, throttle } from "../../utils";
import GuiObj from "./GuiObj";

export class ActionHandler {
  _slider: Slider;
  _uiRoot: UIRoot;

  constructor(slider: Slider) {
    this._slider = slider;
    this._uiRoot = slider._uiRoot;
  }

  _subscription: Function = () => {};
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

// Note: FreeMouseMove is about receiving mousemove without mousedown precedent.
//       It is useful for equalizer sliders that may changed once a slider is moved

// Note: FreeMouseMove is about receiving mousemove without mousedown precedent.
//       It is useful for equalizer sliders that may changed once a slider is moved

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
  _high: number = 255;
  _thumbWidth: number = 0;
  _thumbHeight: number = 0;
  _thumbLeft: number = 0;
  _thumbTop: number = 0;
  _position: number = 0;
  _param: string | null = null;
  _actionHandler: null | ActionHandler;
  _onSetPositionEvenEaten: number;
  _mouseDx: number = 0; // mouseDown inside thumb. 0..thumbWidth
  _mouseDy: number = 0;

  _getActualSize() {
    const relatSize = this._div.getBoundingClientRect();
    // sometime getBoundingClientRect return zero if element not in DOM.
    if (!this.getguirelatw()) {
      relatSize.width = this.getwidth();
    }
    if (!this.getguirelath()) {
      relatSize.height = this.getheight();
    }
    return relatSize;
  }

  /**
   * Central logic of setting new position using mouse
   *
   * set .position by X, Y
   * where X,Y is mouse position inside _div
   */
  _setPositionXY(x: number, y: number) {
    if (this._vertical) {
      y = y - this._thumbHeight / 2 - this._mouseDy;
    } else {
      x = x - this._thumbWidth / 2 - this._mouseDx;
    }
    const actual = this._getActualSize();
    const width = actual.width - this._thumbWidth;
    const height = actual.height - this._thumbHeight;
    const newPercent = this._vertical ? (height - y) / height : x / width;
    this._position = clamp(newPercent, 0, 1);
    this._renderThumbPosition();
    this.doSetPosition(this.getposition());
  }
  /**
   * Part of central logic that detect whether mouseDown is inside thumb
   * @param x mouse position inside _div
   * @param y mouse position inside _div
   */
  _checkMouseDownInThumb(x: number, y: number) {
    if (this._vertical) {
      const thumbTop = parseInt(
        this._div.style.getPropertyValue("--thumb-top")
      );
      const dy = y - thumbTop;
      this._mouseDy =
        dy >= 0 && dy <= this._thumbHeight ? dy - this._thumbHeight / 2 : 0;
    } else {
      //? horizontal
      const thumbLeft = parseInt(
        this._div.style.getPropertyValue("--thumb-left")
      );
      const dx = x - thumbLeft;
      this._mouseDx =
        dx >= 0 && dx <= this._thumbWidth ? dx - this._thumbWidth / 2 : 0;
    }
  }

  _registerDragEvents() {
    this._div.addEventListener("mousedown", (downEvent: MouseEvent) => {
      downEvent.stopPropagation();
      if (downEvent.button != 0) return; // only care LeftButton
      //TODO: change client/offset into pageX/Y
      const startX = downEvent.clientX;
      const startY = downEvent.clientY;
      const innerX = downEvent.offsetX;
      const innerY = downEvent.offsetY;
      this._checkMouseDownInThumb(downEvent.offsetX, downEvent.offsetY);
      this.doLeftMouseDown(downEvent.offsetX, downEvent.offsetY);

      const handleMove = (moveEvent: MouseEvent) => {
        moveEvent.stopPropagation();
        const newMouseX = moveEvent.clientX;
        const newMouseY = moveEvent.clientY;
        const deltaX = newMouseX - startX;
        const deltaY = newMouseY - startY;

        //below is mousePosition conversion relative to inner _div
        this.doMouseMove(innerX + deltaX, innerY + deltaY);
      };

      const throttleMouseMove = throttle(handleMove, 50);

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
        const bitmap = this._uiRoot.getBitmap(this._thumb);
        if (bitmap) {
          this._thumbWidth = bitmap.getWidth();
          this._thumbHeight = bitmap.getHeight();
        }
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
    super.init();
    this._initializeActionHandler();
    this._registerDragEvents();
  }

  _initializeActionHandler() {
    const oldActionHandler = this._actionHandler;
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
        // CrossFadeSlider doesn't has action. should be supported.
        if (!this._actionHandler) {
          this._actionHandler = new ActionHandler(this);
        }
        break;
      default:
        assume(false, `Unhandled slider action: ${this._action}`);
    }
    if (oldActionHandler != null && oldActionHandler != this._actionHandler) {
      oldActionHandler.dispose();
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

  // called by playlist.scrollbar
  setActionHandler(actionHandler: ActionHandler) {
    if (this._actionHandler != null) {
      this._actionHandler.dispose();
      this._actionHandler = null;
    }
    this._actionHandler = actionHandler;
  }
  // called by playlist.scrollbar
  setThumbSize(width: number, height: number) {
    this._thumbWidth = width;
    this._thumbHeight = height;
  }

  _cfgAttribChanged(newValue: string) {
    // do something when configAttrib broadcast message `datachanged` by other object
    const newPos = parseInt(newValue);
    if (newPos != this.getposition()) {
      this.setposition(newPos);
    }
  }

  // extern Int Slider.getPosition();
  getposition(): number {
    return this._position * this._high;
  }

  /**
   *
   * @param newpos 0..MAX
   */
  setposition(newpos: number) {
    this._position = newpos / this._high;
    this._renderThumbPosition();
    this.doSetPosition(this.getposition());
  }

  onsetposition(newPos: number) {
    this._onSetPositionEvenEaten = this._uiRoot.vm.dispatch(
      this,
      "onsetposition",
      [
        //needed by seekerGhost
        { type: "INT", value: newPos },
      ]
    );
  }
  doSetPosition(newPos: number) {
    this.onsetposition(newPos);
    if (this._actionHandler != null) {
      this._actionHandler.onsetposition(newPos);
    }
    this.updateCfgAttib(String(this.getposition()));
  }

  doLeftMouseDown(x: number, y: number) {
    this._setPositionXY(x, y);
    this._uiRoot.vm.dispatch(this, "onleftbuttondown", [
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
    this._uiRoot.vm.dispatch(this, "onleftbuttonup", [
      { type: "INT", value: x },
      { type: "INT", value: y },
    ]);
    this._uiRoot.vm.dispatch(this, "onsetfinalposition", [
      { type: "INT", value: this.getposition() },
    ]);
    this._uiRoot.vm.dispatch(this, "onpostedposition", [
      { type: "INT", value: this.getposition() },
    ]);
    if (this._actionHandler != null) {
      this._actionHandler.onLeftMouseUp(x, y);
    }
  }

  doFreeMouseMove(x: number, y: number) {
    if (this._actionHandler != null) {
      this._actionHandler.onFreeMouseMove(x, y);
    }
  }

  _prepareThumbBitmaps() {
    if (this._thumb != null) {
      const bitmap = this._uiRoot.getBitmap(this._thumb);
      if (bitmap && bitmap.loaded()) {
        bitmap._setAsBackground(this._div, "thumb-");
      }
    }
    this._div.style.setProperty("--thumb-width", px(this._thumbWidth));
    this._div.style.setProperty("--thumb-height", px(this._thumbHeight));

    if (this._downThumb != null) {
      const bitmap = this._uiRoot.getBitmap(this._downThumb);
      if (bitmap && bitmap.loaded()) {
        bitmap._setAsBackground(this._div, "thumb-down-");
      }
    }

    if (this._hoverThumb != null) {
      const bitmap = this._uiRoot.getBitmap(this._hoverThumb);
      if (bitmap && bitmap.loaded()) {
        bitmap._setAsBackground(this._div, "thumb-hover-");
      }
    }
  }

  _renderThumbPosition() {
    const actual = this._getActualSize();
    if (this._vertical) {
      const top = Math.floor(
        Math.max(0, (1 - this._position) * (actual.height - this._thumbHeight))
      );
      if (this._thumbTop != top) {
        this._thumbTop = top;
        this._div.style.setProperty("--thumb-top", px(top));
      }
    } else {
      const left = Math.floor(
        this._position * (actual.width - this._thumbWidth)
      );
      if (this._thumbLeft != left) {
        this._thumbLeft = left;
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
    this._prepareThumbBitmaps();
    this._renderThumbPosition();
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
  }

  constructor(slider: Slider) {
    super(slider);
    this._registerOnAudioProgress();
  }

  _registerOnAudioProgress() {
    this._subscription = this._uiRoot.audio.onCurrentTimeChange(
      this._onAudioProgres
    );
  }

  _onAudioProgres = () => {
    if (!this._pendingChange) {
      this._slider._position = this._uiRoot.audio.getCurrentTimePercent();
      this._slider._renderThumbPosition();
    }
  };

  onsetposition(position: number): void {
    this._pendingChange = this._slider._onSetPositionEvenEaten != 0;
    if (!this._pendingChange) {
      this._uiRoot.audio.seekToPercent(position / this._slider._high);
    }
  }

  onLeftMouseUp(x: number, y: number) {
    if (this._pendingChange) {
      this._pendingChange = false;
      this._uiRoot.audio.seekToPercent(
        this._slider.getposition() / this._slider._high
      );
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
      slider._position = this._uiRoot.audio.getEq(kind);
      slider._renderThumbPosition();
    };
    update();
    this._subscription = this._uiRoot.audio.onEqChange(kind, update);
  }

  onLeftMouseDown(x: number, y: number): void {
    EqGlobalVar.eqMouseDown = true;
    this._slider.getparent().getDiv().classList.add("eq-surf");
    this._slider.getDiv().tabIndex = -1;
    this._slider.getDiv().focus();
  }
  onLeftMouseUp(x: number, y: number): void {
    EqGlobalVar.eqMouseDown = false;
    this._slider.getparent().getDiv().classList.remove("eq-surf");
  }

  onFreeMouseMove(x: number, y: number): void {
    if (EqGlobalVar.eqMouseDown) {
      EqGlobalVar.targetSlider = this._slider;
      this._slider.getDiv().tabIndex = -1;
      this._slider.getDiv().focus();
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
    this._uiRoot.audio.setEq(this._kind, position / this._slider._high);
  }
}

// eslint-disable-next-line rulesdir/proper-maki-types
class PreampActionHandler extends ActionHandler {
  _kind: string;
  constructor(slider: Slider, kind: string) {
    super(slider);
    this._kind = kind;
    const update = () => {
      slider._position = this._uiRoot.audio.getEq(kind);
      slider._renderThumbPosition();
    };
    update();
    this._subscription = this._uiRoot.audio.onEqChange(kind, update);
  }

  onsetposition(position: number): void {
    this._uiRoot.audio.setEq(this._kind, position / this._slider._high);
  }
}

// eslint-disable-next-line rulesdir/proper-maki-types
class PanActionHandler extends ActionHandler {
  onsetposition(position: number): void {
    // TODO
    this._uiRoot.audio.setBalance(position / this._slider._high);
  }
}

// eslint-disable-next-line rulesdir/proper-maki-types
class VolumeActionHandler extends ActionHandler {
  _changing: boolean = false;

  constructor(slider: Slider) {
    super(slider);
    slider._position = this._uiRoot.audio.getVolume();
    slider._renderThumbPosition();

    this._subscription = this._uiRoot.audio.onVolumeChanged(() => {
      if (!this._changing) {
        slider._position = this._uiRoot.audio.getVolume();
        slider._renderThumbPosition();
      }
    });
  }

  onsetposition(position: number): void {
    this._uiRoot.audio.setVolume(position / this._slider._high);
  }
  onLeftMouseDown(x: number, y: number) {
    this._changing = true;
  }
  onLeftMouseUp(x: number, y: number) {
    this._changing = false;
  }
}
