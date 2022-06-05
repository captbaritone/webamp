import { UIRoot } from "../../UIRoot";
import { assume, num, throttle } from "../../utils";
import GuiObj from "../makiClasses/GuiObj";

export class ActionHandler {
  _slider: RingProgress;
  _uiRoot: UIRoot;
  _subscription: Function;

  constructor(slider: RingProgress) {
    this._slider = slider;
    this._uiRoot = slider._uiRoot;
    this._subscription = () => {}; // deFault empty
  }

  init(): void {}
  onChange(percent: number): void {}
  dispose(): void {
    this._subscription();
  }
}
export default class RingProgress extends GuiObj {
  _rgnId: string;
  _action: string;
  _colors: string[] = [];
  _maxDegree: number = 360; // 0..360
  _bgColor: string = "red";
  _bgImageId: string;
  _maskId: string;
  _progress: number = 0;
  _actionHandler: null | ActionHandler;
  _staticGradient: string; // css for never changed gradient
  _mouseIsDown: boolean = false;

  getElTag(): string {
    return "layer";
  }

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }

    switch (key) {
      case "action":
        this._action = value.toLowerCase();
        break;
      case "degree":
        this._maxDegree = num(value);
        break;
      case "mask":
        this._maskId = value;
        break;
      case "colors":
        this._buildColors(value);
        break;
      case "bgcolor":
        this._bgColor = parseColor(value);
        break;
      default:
        return false;
    }
    return true;
  }

  /**
   *
   * @param colors separated comma sonique color
   * * Note: RGB = 0xRRGGBB
   * *       ARGB = 0XFFRRGGBB
   */
  _buildColors(colors: string) {
    for (var color of colors.split(",")) {
      this._colors.push(parseColor(color));
    }
  }

  init() {
    super.init();
    this._actionHandler = new ActionHandler(this); // to be always has an handler
    this._registerDragEvents();
    this._initializeActionHandler();
    this._actionHandler.init();
  }

  _initializeActionHandler() {
    const oldActionHandler = this._actionHandler;
    switch (this._action) {
      case "seek":
        this._actionHandler = new SeekActionHandler(this);
        break;
      // case "volume":
      //   this._actionHandler = new VolumeActionHandler(this);
      //   break;
      case null:
        // CrossFadeSlider doesn't has action. should be supported.
        if (!this._actionHandler) {
          this._actionHandler = new ActionHandler(this);
        }
        break;
      default:
        assume(false, `Unhandled ring action: ${this._action}`);
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
  }

  // 0..1 call by action handler
  setPercentValue(percent: number, animate: boolean = true) {
    if (!this._mouseIsDown) {
      this._progress = percent;
      this.drawProgress();
    }
  }

  /**
   * * User click on ring
   * @param x mouse location relative to this client
   * @param y
   */
  doLeftMouseDown(x: number, y: number) {
    this._mouseIsDown = true;
    const bound = this.getDiv().getBoundingClientRect();
    const cx = bound.width / 2;
    const cy = bound.height / 2;
    const deltaX = x - cx;
    const deltaY = y - cy;
    const rad = Math.atan2(deltaY, deltaX); // In radians
    const pi = Math.PI;
    let deg = rad * (180 / pi); // got: 0..180,-179..-1
    deg = (deg + 450) % 360; // modulus. got: 0..~360
    const progress = deg / this._maxDegree;
    if (progress != this._progress) {
      // console.log("ring:", progress);
      this._progress = progress;
      this.drawProgress();
      this._actionHandler.onChange(this._progress);
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

  drawMask() {
    if (!this._maskId) return;
    const bitmap = this._uiRoot.getBitmap(this._maskId);
    bitmap._setAsBackground(this.getDiv(), "mask");
    // bitmap.setAsBackground(this.getDiv());
    // this.getDiv().classList.add('webamp--img')
    this.getDiv().style.setProperty(
      "-webkit-mask-image",
      `var(${bitmap.getCSSVar()})`
    );
    this.getDiv().style.setProperty(
      "webkit-mask-image",
      `var(${bitmap.getCSSVar()})`
    );
  }

  prepareGradient() {
    const fullColors = [...this._colors]; //clone
    if (this._maxDegree < 360) {
      let lastColor = fullColors.pop();
      lastColor = `${lastColor} ${this._maxDegree}deg`;
      fullColors.push(lastColor);
      fullColors.push(`transparent ${this._maxDegree}deg`);
    }
    this._staticGradient = `conic-gradient(${fullColors.join(", ")})`;
  }

  drawProgress() {
    const progressColors = [
      `transparent ${this._progress * this._maxDegree}deg`,
      `${this._bgColor} ${this._progress * this._maxDegree}deg ${
        this._maxDegree
      }deg`,
      `transparent ${this._maxDegree}deg`,
    ];
    const dynamicGradient = `conic-gradient(${progressColors.join(", ")})`;

    this.getDiv().style.backgroundImage = `${dynamicGradient}, ${this._staticGradient}`;
  }

  draw(): void {
    super.draw();
    this.prepareGradient();
    this.drawMask();
    this.drawProgress();
  }
}

function parseColor(soniqueColor: string): string {
  let color = soniqueColor;
  if (!color.startsWith("0x")) {
    throw new Error("color is expected in 0xFF999999 format.");
  }
  if (color.length == 10) {
    color = color.substring(4);
  } else {
    color = color.substring(2);
  }
  return `#${color}`;
}

class SeekActionHandler extends ActionHandler {
  //

  init() {
    this._registerOnAudioProgress();
  }

  _registerOnAudioProgress() {
    this._subscription = this._uiRoot.audio.onCurrentTimeChange(
      this._onAudioProgres
    );
  }

  _onAudioProgres = () => {
    this._slider.setPercentValue(this._uiRoot.audio.getCurrentTimePercent());
  };

  // 0..1 called by slider
  onChange(percent: number): void {
    this._uiRoot.audio.seekToPercent(percent);
  }
}
