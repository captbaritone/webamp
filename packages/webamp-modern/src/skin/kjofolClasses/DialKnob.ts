import { UIRoot } from "../../UIRoot";
import { assume, throttle } from "../../utils";
import AnimatedLayer from "../makiClasses/AnimatedLayer";
import MakiMap from "../makiClasses/MakiMap";

export class ActionHandler {
  _slider: DialKnob;
  _uiRoot: UIRoot;
  _subscription: Function;

  constructor(slider: DialKnob) {
    this._slider = slider;
    this._uiRoot = slider._uiRoot;
    this._subscription = () => {}; // deFault empty
  }

  init(): void {}
  onChange(percent: number): void {}
  onFrame(percent: number): void {} // during animation

  dispose(): void {
    this._subscription();
  }
}
export default class DialKnob extends AnimatedLayer {
  _mapImage: string;
  _map: MakiMap;
  _frameCount: number;
  _mouseIsDown: boolean = false;
  _value: number; //0..255
  _action: string;
  _actionHandler: ActionHandler;

  constructor(uiRoot: UIRoot) {
    super(uiRoot);
    this._map = new MakiMap(uiRoot);
    this._speed = 20;
    this._autoReplay = false;
  }

  getElTag(): string {
    return "animatedlayer";
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
    this._frameCount = this.getlength(); // because getLength seem as expensive
    this._registerDragEvents();
    this._map.loadmap(this._mapImage);
    this._actionHandler = new ActionHandler(this); // to be always has an handler
    this._initializeActionHandler();
    this._actionHandler.init();
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
      case "pitch":
        this._actionHandler = new PitchActionHandler(this);
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
      const value = Math.round(percent * 255);
      if (value != this._value) {
        this._value = value;
        if (animate) {
          this._animateDial();
        } else {
          this.gotoframe(
            Math.round((this._value / 255) * (this._frameCount - 1))
          );
        }
      }
    }
  }

  // called by animation loop
  gotoframe(framenum: number) {
    super.gotoframe(framenum);
    this._actionHandler.onFrame(framenum / (this._frameCount - 1));
  }

  doLeftMouseDown(x: number, y: number) {
    this._mouseIsDown = true;
    const val = this._map.getUnsafeValue(x, y);
    if (val != null && !isNaN(val) && val != this._value) {
      console.log("knob:", val);
      this._value = val;
      // this.stop();
      // this.setstartframe(this.getcurframe());
      // this.setendframe(Math.round((val / 255) * (this._frameCount-1)));
      // this.play();
      this._animateDial();
      this._actionHandler.onChange(this._value / 255);
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

  _animateDial() {
    this.stop();
    this.setstartframe(this.getcurframe());
    this.setendframe(Math.round((this._value / 255) * (this._frameCount - 1)));
    this.play();
  }
}

class SeekActionHandler extends ActionHandler {
  // _pendingChange: boolean;

  isPendingChange(): boolean {
    return true; // this._pendingChange || this._dragging;
  }

  constructor(slider: DialKnob) {
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

  constructor(slider: DialKnob) {
    super(slider);

    this._subscription = this._uiRoot.audio.onVolumeChanged(() => {
      slider.setPercentValue(this._uiRoot.audio.getVolume());
    });
  }

  init(): void {
    this._slider.setPercentValue(this._uiRoot.audio.getVolume());
  }

  // 0..1 called by slider
  onChange(percent: number): void {
    this._uiRoot.audio.setVolume(percent);
  }
}

class PitchActionHandler extends ActionHandler {
  _changing: boolean = false;

  constructor(slider: DialKnob) {
    super(slider);
  }

  // called by audio
  _setSliderValue(force: boolean = false) {
    if (this._slider.isplaying && !force) return;

    const pitch = this._uiRoot.audio.getPlaybackRate();
    //* audio pitch :    0   0.5    1           2         3
    //* slider %    :         0                 1
    const percent = (pitch - 0.5) / (2 - 0.5);
    this._slider.setPercentValue(percent, !force);
  }
  _setAudioValue(percent: number) {
    const pitch = percent * (2 - 0.5) + 0.5;
    this._uiRoot.audio.setPlaybackRate(pitch);
  }

  init(): void {
    this._subscription = this._uiRoot.audio.on("playbackratechange", () => {
      // this._slider.setPercentValue(this._uiRoot.audio.getPlaybackRate());
      this._setSliderValue();
    });
    this._setSliderValue(true);
  }

  // called by audio animation loop during goto target
  onFrame(percent: number): void {
    this._setAudioValue(percent);
  }

  // 0..1 called by slider ciick
  onChange(percent: number): void {
    // this._setAudioValue(percent)
  }
}
