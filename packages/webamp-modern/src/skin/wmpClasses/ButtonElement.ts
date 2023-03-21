import { UIRoot } from "../../UIRoot";
import { toBool } from "../../utils";
import { AUDIO_PAUSED, AUDIO_PLAYING, AUDIO_STOPPED } from "../AudioPlayer";
import { Edges } from "../Clippath";
import GuiObj from "../makiClasses/GuiObj";
import ButtonGroup from "./ButtonGroup";
import { runInlineScript } from "./util";

// https://docs.microsoft.com/en-us/windows/win32/wmp/buttonelement-element
export default class ButtonElement extends GuiObj {
  _mappingColor: string;
  _action: string = null;
  _onClick: string = null;
  _down: boolean = false;
  _upTooltip: string = null;
  _downTooltip: string = null;
  _enabled: boolean = true;
  _sticky: boolean = false;
  _audioEvent: { [audioEvent: string]: string } = {};

  constructor(uiRoot: UIRoot) {
    super(uiRoot);
    // TODO: Cleanup!
    // this._div.addEventListener("mousedown", this._handleMouseDown.bind(this));
    this._div.addEventListener("click", (e: MouseEvent) => {
      if (this._onClick != null) {
        this.onClick();
      }
    });
  }

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (value.startsWith("wmpenabled:player.controls.")) {
      // console.log("--before_register wmpenabled:", this.getId(), this._audioEvent);
      // console.log("wmpenabled:!", key, "=", value);
      // this._audioEvent[value.split(".").pop()] = key;
      this._audioEvent[key] = value.split(".").pop();
      // console.log("--after_register wmpenabled:", this.getId(), this._audioEvent);
      return true;
    }
    if (super.setXmlAttr(key, value)) {
      return true;
    }

    switch (key) {
      // case "image":
      //   //quick and dirty patch
      //   //TODO: implement all hover,down,disable. sample: quicksilver.wmz: playbutton
      //   this.setXmlAttr('background', value);
      //   return true
      case "mappingcolor":
        this._mappingColor = value;
        //temporary:
        // this._div.style.backgroundColor = value;
        break;
      case "action":
        this.setAction(value);
        break;
      case "onclick":
        if (value.startsWith("visEffects.next()")) {
          this.setAction("VIS_Next");
        } else if (value.startsWith("visEffects.previous()")) {
          this.setAction("VIS_Prev");
        } else {
          this._onClick = value;
        }
        break;
      case "uptooltip":
        this._upTooltip = value;
        break;
      case "downtooltip":
        this._downTooltip = value;
        break;
      case "sticky":
        // Specifies or retrieves a value indicating whether the BUTTONELEMENT
        // is sticky.
        // When sticky, a BUTTONELEMENT will change states after being clicked
        // and will remain in the new state until clicked again.
        this._sticky = toBool(value);
        break;
      default:
        return false;
    }
    return true;
  }

  get down(): boolean {
    return this._down;
  }
  set down(value: boolean) {
    this._down = value;
    this._renderDown();
  }

  get enabled(): boolean {
    return this._enabled;
  }
  set enabled(value: boolean) {
    this._enabled = value;
    this._renderDisabled();
  }

  setAction(action: string) {
    this._action = action;
    if (action) {
      this._div.addEventListener("click", (e: MouseEvent) => {
        if (e.button == 0) {
          //   this.leftclick();
          this.dispatchAction(this._action, null, null);
        }
      });
    }
  }

  onClick() {
    if (!this.enabled) {
      return;
    }
    // if (this._action) {
    //   this.dispatchAction(this._action, this._param, this._actionTarget);
    //   this.invalidateActionState();
    // }
    // this.onLeftClick();
    runInlineScript(this._onClick);
    if (this._sticky) {
      this.down = true;
    }
  }

  _renderDown() {
    if (this._down) {
      this._div.classList.add("down");
    } else {
      this._div.classList.remove("down");
    }
    this._renderTooltip();
  }

  _renderTooltip() {
    if (this._down && (this._downTooltip || this._upTooltip)) {
      this._div.setAttribute("title", this._downTooltip || this._upTooltip);
    } else if (!this._down && this._upTooltip) {
      this._div.setAttribute("title", this._upTooltip);
    } else {
      this._div.removeAttribute("title");
    }
  }

  _renderDisabled() {
    if (this._enabled) {
      this._div.classList.remove("disabled");
    } else {
      this._div.classList.add("disabled");
    }
  }

  _renderRegion() {
    if (this._mappingColor && this._parent instanceof ButtonGroup) {
      const canvas = this._uiRoot
        .getBitmap(this._parent._mappingImage)
        .getCanvas();
      const edge = new Edges();
      edge.parseCanvasTransparencyByNonColor(canvas, this._mappingColor);
      if (edge.isSimpleRect()) {
        // this.setXmlAttr("sysregion", "0");
      } else {
        this._div.style.clipPath = edge.getPolygon();
      }
    }
  }

  init() {
    super.init();
    if (Object.keys(this._audioEvent).length > 0) {
      this._uiRoot.audio.on("statchanged", () =>
        this._updatePropsByAudioState()
      );
      this._updatePropsByAudioState();
    }
  }

  _updatePropsByAudioState() {
    // console.log("audio-state-changed:", this.getId(), this._audioEvent);
    const buttonStates = {
      [AUDIO_PLAYING]: { play: false, pause: true, stop: true },
      [AUDIO_PAUSED]: { play: true, pause: false, stop: true },
      [AUDIO_STOPPED]: { play: true, pause: false, stop: false },
    };
    const state = this._uiRoot.audio.getState(); // playing
    if (!buttonStates[state]) {
      console.warn("unknown audio state:", state);
      return;
    }
    for (const [prop, audioEvent] of Object.entries(this._audioEvent)) {
      this[prop] = buttonStates[state][audioEvent];
      // console.log(
      //   `${this.getId()}|${
      //     this._action
      //   }| audioState="${state}"  >> this.[${prop}]=${this[prop]}`
      // );
      // (audioEvent == "play" && state != AUDIO_PLAYING) ||
      // (audioEvent == "pause" && state != AUDIO_PAUSED) ||
      // (audioEvent == "stop" && state != AUDIO_STOPPED);
    }
  }

  draw() {
    super.draw();
    this._renderRegion();
    this._renderDown();
  }
}
