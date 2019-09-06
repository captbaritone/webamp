import Emitter from "../emitter";
import { MEDIA_STATUS } from "../constants";
import { MediaStatus } from "../types";
import Timidity from "../../demo/timidity/bundle.js";

export default class ElementSource {
  _emitter: Emitter;
  _context: AudioContext;
  _destination: AudioNode;
  _stalled: boolean;
  _status: MediaStatus;
  _player: Timidity;

  on(eventType: string, cb: (...args: any[]) => void) {
    return this._emitter.on(eventType, cb);
  }

  constructor(context: AudioContext, destination: AudioNode) {
    this._emitter = new Emitter();
    this._context = context;
    this._destination = destination;
    this._stalled = false;
    this._status = MEDIA_STATUS.STOPPED;

    this._player = new Timidity({
      baseUrl: "/demo/timidity/",
      audioContext: context,
      destination,
    });

    // TODO: #leak
    this._player.on("unstarted", () => {
      this._setStalled(true);
    });

    // TODO: #leak
    this._player.on("playing", () => {
      this._emitter.trigger("loaded");
      this._setStalled(false);
    });

    this._player.on("timeupdate", () => {
      this._emitter.trigger("positionChange");
    });

    // TODO: #leak
    this._player.on("ended", () => {
      this._emitter.trigger("ended");
      this._setStatus(MEDIA_STATUS.STOPPED);
    });

    // TODO: #leak
    this._player.on("error", e => {
      console.error("Timidity error", e);
      this._emitter.trigger("ended");
      this._setStatus(MEDIA_STATUS.STOPPED);
    });
  }

  _setStalled(stalled: boolean) {
    this._stalled = stalled;
    this._emitter.trigger("stallChanged");
  }

  disconnect() {
    this._player._node.disconnect();
  }

  // Async for now, for compatibility with BufferAudioSource
  // TODO: This does not need to be async
  async loadUrl(url: string) {
    this._player.load(url);
    this._emitter.trigger("loaded");
  }

  async play() {
    this._player.play();
    this._setStatus(MEDIA_STATUS.PLAYING);
  }

  pause() {
    this._player.pause();
    this._setStatus(MEDIA_STATUS.PAUSED);
  }

  stop() {
    this._player.pause();
    this._player.seek(0);
    this._setStatus(MEDIA_STATUS.STOPPED);
  }

  seekToTime(time: number) {
    this._player.seek(time);
    this._emitter.trigger("positionChange");
  }

  getStalled() {
    return false;
  }

  getStatus() {
    return this._status;
  }

  getDuration() {
    return this._player.duration;
  }

  getTimeElapsed() {
    return this._player.currentTime;
  }

  _setStatus(status: MediaStatus) {
    this._status = status;
    this._emitter.trigger("statusChange");
  }

  dispose() {
    this.stop();
    this._emitter.dispose();
    this._player.destroy();
  }
}
