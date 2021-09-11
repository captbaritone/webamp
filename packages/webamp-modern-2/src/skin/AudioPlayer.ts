import { clamp, Emitter } from "../utils";

export class AudioPlayer {
  _input: HTMLInputElement = document.createElement("input");
  _audio: HTMLAudioElement = document.createElement("audio");
  _eqValues: { [kind: string]: number } = {};
  _eqEmitter: Emitter = new Emitter();
  constructor() {
    this._audio.src =
      "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Auto-Pilot_-_03_-_Seventeen.mp3";
    this._input.type = "file";
    // document.body.appendChild(this._input);
    // TODO: dispose
    this._input.onchange = (e) => {
      const file = this._input.files[0];
      if (file == null) {
        return;
      }
      this._audio.src = URL.createObjectURL(file);
      this.play();
    };
  }
  // 0-1
  getVolume(): number {
    return this._audio.volume;
  }
  play() {
    this._audio.play();
  }
  stop() {
    this._audio.pause();
    this._audio.currentTime = 0;
  }
  pause() {
    this._audio.pause();
  }

  eject() {
    this._input.click();
  }

  next() {}

  previous() {}

  // 0-1
  setVolume(volume: number) {
    this._audio.volume = volume;
  }

  seekTo(secs: number) {
    this._audio.currentTime = secs;
  }

  seekToPercent(percent: number) {
    this._audio.currentTime = this._audio.duration * percent;
  }

  // In seconds
  getCurrentTime(): number {
    return this._audio.currentTime;
  }

  getCurrentTimePercent(): number {
    return this._audio.currentTime / this._audio.duration;
  }

  getEq(kind: string): number {
    switch (kind) {
      case "preamp":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
      case "10":
        if (this._eqValues[kind] == null) {
          this._eqValues[kind] = 0.5;
        }
        return this._eqValues[kind];
      default:
        console.warn(`Tried to get unknown EQ kind: ${kind}`);
    }
  }

  setEq(kind: string, value: number) {
    switch (kind) {
      case "preamp":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
      case "10":
        this._eqValues[kind] = clamp(value, 0, 1);
        this._eqEmitter.trigger(kind);
        break;
      default:
        console.warn(`Tried to set unknown EQ kind: ${kind}`);
    }
  }

  onEqChange(kind: string, cb: () => void): () => void {
    switch (kind) {
      case "preamp":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
      case "10":
        return this._eqEmitter.on(kind, cb);
      default:
        console.warn(`Tried to bind to an unknown EQ kind: ${kind}`);
    }
  }

  onCurrentTimeChange(cb: () => void): () => void {
    const handler = () => cb();
    this._audio.addEventListener("timeupdate", handler);
    const dispose = () => {
      this._audio.removeEventListener("timeupdate", handler);
    };
    return dispose;
  }

  onSeek(cb: () => void): () => void {
    const handler = () => cb();
    this._audio.addEventListener("seeked", handler);
    const dispose = () => {
      this._audio.removeEventListener("seeked", handler);
    };
    return dispose;
  }

  // Current track length in seconds
  getLength(): number {
    return this._audio.duration;
  }
}

const AUDIO_PLAYER = new AudioPlayer();

export default AUDIO_PLAYER;
