import { UIRoot } from "../../UIRoot";
import { assume, throttle } from "../../utils";
import GuiObj from "../makiClasses/GuiObj";
import MakiMap from "../makiClasses/MakiMap";

export class ActionHandler {
  _slider: FloodLevel;
  _uiRoot: UIRoot;
  _subscription: Function;

  constructor(slider: FloodLevel) {
    this._slider = slider;
    this._uiRoot = slider._uiRoot;
    this._subscription = () => {}; // deFault empty
  }

  onChange(percent: number): void {}

  dispose(): void {
    this._subscription();
  }
}
export default class FloodLevel extends GuiObj {
  _canvas: HTMLCanvasElement = document.createElement("canvas");
  _mapImage: string;
  _frontImage: string;
  _map: MakiMap;
  _mouseIsDown: boolean;
  _value: number; //0..255
  _action: string;
  _actionHandler: ActionHandler;

  constructor(uiRoot: UIRoot) {
    super(uiRoot);
    this._map = new MakiMap(uiRoot);
  }

  getElTag(): string {
    return "layer";
  }

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "mapimage":
        this._mapImage = value;
        break;
      case "frontimage":
        this._frontImage = value;
        break;
      case "action":
        this._action = value.toLowerCase();
        break;
      default:
        return false;
    }
    return true;
  }

  init() {
    super.init();
    this._map = new MakiMap(this._uiRoot);
    this._map.loadmap(this._mapImage);
    this._actionHandler = new ActionHandler(this); // to be always has an handler
    this._initializeActionHandler();
    this._registerDragEvents();
  }

  _initializeActionHandler() {
    const oldActionHandler = this._actionHandler;
    switch (this._action) {
      case "seek":
        this._actionHandler = new SeekActionHandler(this);
        break;
      // case "eq_band":
      //   if (this._param == "preamp")
      //     this._actionHandler = new PreampActionHandler(this, this._param);
      //   else this._actionHandler = new EqActionHandler(this, this._param);
      //   break;
      // case "eq_preamp":
      //   break;
      // case "pan":
      //   this._actionHandler = new PanActionHandler(this);
      //   break;
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

  _registerDragEvents() {
    this._div.addEventListener("mousedown", (downEvent: MouseEvent) => {
      downEvent.stopPropagation();
      if (downEvent.button != 0) return; // only care LeftButton
      //TODO: change client/offset into pageX/Y
      const startX = downEvent.clientX;
      const startY = downEvent.clientY;
      const innerX = downEvent.offsetX;
      const innerY = downEvent.offsetY;
      // this._checkMouseDownInThumb(downEvent.offsetX, downEvent.offsetY);
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

      const throttleMouseMove = throttle(handleMove, 10);

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
  }

  // 0..1 call by action handler
  setPercentValue(percent: number) {
    if (!this._mouseIsDown) {
      const value = Math.round(percent * 255);
      if (value != this._value) {
        this._value = value;
        this._renderFlood();
      }
    }
  }

  doLeftMouseDown(x: number, y: number) {
    this._mouseIsDown = true;
    const val = this._map.getUnsafeValue(x, y);
    if (val != null && val != this._value) {
      console.log("flood:", val);
      this._value = val;
      this._renderFlood();
      this._actionHandler.onChange(this._value / 255);
      // this.stop();
      // this.setstartframe(this.getcurframe());
      // this.setendframe(Math.round((val / 255) * (this._frameCount - 1)));
      // this.play();
    }
  }
  doMouseMove(x: number, y: number) {
    if (this._mouseIsDown) {
      this.doLeftMouseDown(x, y);
    }
  }
  doLeftMouseUp(x: number, y: number) {
    this._mouseIsDown = false;
  }

  _renderFlood() {
    const [w, h] = [this.getwidth(), this.getheight()];
    const ctx = this._canvas.getContext("2d"); // destination
    ctx.clearRect(0, 0, w, h);
    // ctx.fillStyle='fuchsia'
    // ctx.fillRect(0, 0, w, h);

    const img = ctx.getImageData(0, 0, w, h);
    const data = img.data;

    const bitmap = this._uiRoot.getBitmap(this._frontImage); // source pixel
    const canvasb = bitmap.getCanvas(true);
    const ctxb = canvasb.getContext("2d");
    const imgb = ctxb.getImageData(this.getleft(), this.gettop(), w, h);
    const datab = imgb.data;

    assume(
      img.width == imgb.width && img.height == imgb.height,
      "mismatch size of source vs dest"
    );

    // const dataa = this.alphaData;
    // const bw = bitmap.getWidth();
    // const bh = bitmap.getHeight();

    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        // // for (var i = 3; i < dataa.length; i += 4) {
        const val = this._map.getUnsafeValue(x, y);
        if (val != null && val <= this._value) {
          const b = (y * w + x) * 4;
          data[b + 0] = datab[b + 0];
          data[b + 1] = datab[b + 1];
          data[b + 2] = datab[b + 2];
          data[b + 3] = datab[b + 3];
        }
        // //? ignore transparent
        // if (datab[b * 4 + 3] != 0) {
        //   const a = (y + dy) * aw + dx + x;
        //   datab[b * 4 + 3] = dataa[a * 4 + 3];
        //   // anyPixelChanged = true;
        // }
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  _renderWidth() {
    super._renderWidth();
    this._canvas.style.width = this._div.style.width;
    this._canvas.setAttribute("width", `${parseInt(this._div.style.width)}`);
  }

  _renderHeight() {
    super._renderHeight();
    this._canvas.style.height = this._div.style.height;
    this._canvas.setAttribute("height", `${parseInt(this._div.style.height)}`);
  }

  draw() {
    super.draw();
    this._div.appendChild(this._canvas);
    // this.update();
  }

  dispose(): void {
    this._actionHandler.dispose();
    super.dispose();
  }
}

class SeekActionHandler extends ActionHandler {
  // _pendingChange: boolean;

  isPendingChange(): boolean {
    return true; // this._pendingChange || this._dragging;
  }

  constructor(slider: FloodLevel) {
    super(slider);
    this._registerOnAudioProgress();
  }

  _registerOnAudioProgress() {
    this._subscription = this._uiRoot.audio.onCurrentTimeChange(
      this._onAudioProgres
    );
  }

  _onAudioProgres = () => {
    // if (!this._pendingChange) {
    this._slider.setPercentValue(this._uiRoot.audio.getCurrentTimePercent());
    // }
  };

  // onsetposition(position: number): void {
  //   this._pendingChange = this._slider._onSetPositionEvenEaten != 0;
  //   if (!this._pendingChange) {
  //     this._uiRoot.audio.seekToPercent(position / this._slider._high);
  //   }
  // }

  // 0..1 called by slider
  onChange(percent: number): void {
    this._uiRoot.audio.seekToPercent(percent);
  }

  // onLeftMouseUp(x: number, y: number) {
  //   if (this._pendingChange) {
  //     this._pendingChange = false;
  //     this._uiRoot.audio.seekToPercent(
  //       this._slider.getposition() / this._slider._high
  //     );
  //   }
  // }
}

class VolumeActionHandler extends ActionHandler {
  _changing: boolean = false;

  constructor(slider: FloodLevel) {
    super(slider);
    slider.setPercentValue(this._uiRoot.audio.getVolume());

    this._subscription = this._uiRoot.audio.onVolumeChanged(() => {
      // if (!this._changing) {
      slider.setPercentValue(this._uiRoot.audio.getVolume());
      // slider._position = this._uiRoot.audio.getVolume();
      // slider._renderThumbPosition();
      // }
    });
  }

  // onsetposition(position: number): void {
  //   this._uiRoot.audio.setVolume(position / this._slider._high);
  // }

  // 0..1 called by slider
  onChange(percent: number): void {
    this._uiRoot.audio.setVolume(percent);
  }

  // onLeftMouseDown(x: number, y: number) {
  //   this._changing = true;
  // }
  // onLeftMouseUp(x: number, y: number) {
  //   this._changing = false;
  // }
}
