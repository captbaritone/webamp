import { UIRoot } from "../../UIRoot";
import { AUDIO_PAUSED, AUDIO_PLAYING, AUDIO_STOPPED } from "../AudioPlayer";
import GuiObj from "../makiClasses/GuiObj";
import { runInlineScript } from "./util";

// https://docs.microsoft.com/en-us/windows/win32/wmp/player-element
// https://docs.microsoft.com/en-us/windows/win32/wmp/player-object
export default class Player extends GuiObj {
  _controls: PlayerControls;
  _playState_onchange: string;

  constructor(uiRoot: UIRoot) {
    super(uiRoot);
    // this.setXmlAttr("visible", "0");
    // Within script code, the Player object is accessed through the player global attribute rather than
    // through a name specified by an id attribute, which is not supported by the PLAYER element.
    this.setXmlAttr("id", "player");

    this._controls = new PlayerControls();
  }

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(_key, value)) {
      return true;
    }

    switch (key) {
      case "backgroundcolor":
        break;
      case "playState_onchange":
        this._playState_onchange = value;
        break;
      default:
        return false;
    }
    return true;
  }

  init(): void {
    super.init();

    if (this._playState_onchange != null) {
      //audio state change
      this._uiRoot.audio.on("statchanged", () => this._updateAudioStatus());
      this._updateAudioStatus();
    }
  }
  _updateAudioStatus() {
    runInlineScript(this._playState_onchange);
  }

  //? WMP things ============================
  get controls(): PlayerControls {
    return this._controls;
  }

  get playState(): number {
    // taken from QuickSilver.wmz

    switch (this._uiRoot.audio.getState()) {
      case AUDIO_STOPPED:
        return 1;
      case AUDIO_PAUSED:
        return 2;
      case AUDIO_PLAYING:
        return 3;
      // case 6: //buffering
      //   break;
      // case 7: //waiting
      //   break;
      // case 8: //media ended
      //   break;
      // case 9: //Transitioning
      //   break;
      // case 10: //Ready
      //   break;
      default:
        // case 0:		//undefined
        return 0;
    }
  }

  draw() {
    // super.draw(); //? nothing to draw. this element is dormant
    console.log("setting window.player ");
    window["player"] = this;
  }
}

class PlayerControls {
  //

  isAvailable(buttonId: string): boolean {
    return false;
  }
}
