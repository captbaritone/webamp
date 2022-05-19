import UI_ROOT from "../UIRoot";
import { AUDIO_PAUSED, AUDIO_PLAYING, AUDIO_STOPPED } from "./AudioPlayer";

import GuiObj from "./makiClasses/GuiObj";

/**
 * GuiObject that support automatic property to change
 * regarding to audio.state
 * It is not used by Winamp, but WindowsMediaPlayer & Audion do.
 */
export default class AudioEventedGui extends GuiObj {
  // // set props as if allowed.
  // // example: prop=pause will set true if allowed to pause eg. audio is playing
  // _enabledFor: {[prop:string]:string} = {}
  // // set prop as equal to audio state
  // // example:
  // _equalTo: {[prop:string]:string} = {}
  // prop=pause event='allowed-to:pause' | event='audio:play'
  _propEvent: { [prop: string]: string } = {};
  _audioEventListeners: Function;

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (value.startsWith("allowed-to:") || value.startsWith("audio:")) {
      this._propEvent[key] = value;
      return true;
    }

    if (super.setXmlAttr(_key, value)) {
      return true;
    }
    return false;
  }

  init() {
    super.init();
    this._registerAudioEvents();
  }

  _registerAudioEvents() {
    if (Object.keys(this._propEvent).length > 0) {
      //unregister
      if (this._audioEventListeners != null) {
        this._audioEventListeners();
      }
      this._audioEventListeners = UI_ROOT.audio.on("statchanged", () =>
        this._updatePropsByAudioState()
      );
      this._updatePropsByAudioState();
    }
  }

  _updatePropsByAudioState() {
    // console.log("audio-state-changed:", this.getId(), this._audioEvent);
    const pl = UI_ROOT.playlist;
    const plCount = pl.getnumtracks();
    const plIndex = pl.getcurrentindex();
    const canNext = plIndex < plCount - 1;
    const canPrev = plIndex > 0;
    const buttonStates = {
      [AUDIO_PLAYING]: {
        play: false,
        pause: true,
        stop: true,
        next: canNext,
        prev: canPrev,
      },
      [AUDIO_PAUSED]: {
        play: true,
        pause: false,
        stop: true,
        next: canNext,
        prev: canPrev,
      },
      [AUDIO_STOPPED]: {
        play: true,
        pause: false,
        stop: false,
        next: canNext,
        prev: canPrev,
      },
    };
    const nickState = {
      [AUDIO_PLAYING]: "play",
      [AUDIO_PAUSED]: "pause",
      [AUDIO_STOPPED]: "stop",
    };

    const state = UI_ROOT.audio.getState(); // playing
    if (!buttonStates[state]) {
      console.warn("unknown audio state:", state);
      return;
    }
    for (const [prop, audioEvent] of Object.entries(this._propEvent)) {
      const [enabled, requestedState] = audioEvent.split(":");
      if (enabled == "allowed-to") {
        this[prop] = buttonStates[state][requestedState];
      } else if (enabled == "equal") {
        this[prop] = requestedState == nickState[state];
      }
    }
  }
}
