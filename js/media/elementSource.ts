import Emitter from "../emitter";
import { clamp } from "../utils";
import { MEDIA_STATUS } from "../constants";
import { MediaStatus } from "../types";
import Timidity from "../../demo/timidity/bundle.js";

export default class ElementSource {
  _emitter: Emitter;
  _context: AudioContext;
  _source: AudioNode;
  _destination: AudioNode;
  _audio: HTMLAudioElement;
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
    this._audio = document.createElement("audio");
    this._audio.crossOrigin = "anonymous";
    this._stalled = false;
    this._status = MEDIA_STATUS.STOPPED;

    this._player = new Timidity("/demo/timidity/");

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
    this._audio.addEventListener("ended", () => {
      this._emitter.trigger("ended");
      this._setStatus(MEDIA_STATUS.STOPPED);
    });

    // TODO: #leak
    this._audio.addEventListener("error", e => {
      switch (this._audio.error!.code) {
        case 1:
          // The fetching of the associated resource was aborted by the user's request.
          console.error("MEDIA_ERR_ABORTED", e);
          break;
        case 2:
          console.error("MEDIA_ERR_NETWORK", e);
          // Some kind of network error occurred which prevented the media from being successfully fetched, despite having previously been available.
          break;
        case 3:
          // Despite having previously been determined to be usable, an error occurred while trying to decode the media resource, resulting in an error.

          // There is a bug in Chrome where improperly terminated mp3s can cuase this error.
          // https://bugs.chromium.org/p/chromium/issues/detail?id=794782
          // Related: Commit f44e826c83c74fef04c2c448af30cfb353b28312
          console.error("PIPELINE_ERROR_DECODE", e);
          break;
        case 4:
          console.error("MEDIA_ERR_SRC_NOT_SUPPORTED", e);
          // The associated resource or media provider object (such as a MediaStream) has been found to be unsuitable.
          break;
      }
      // Rather than just geting stuck in this error state, we can just pretend this is
      // the end of the track.

      this._emitter.trigger("ended");
      this._setStatus(MEDIA_STATUS.STOPPED);
    });

    this._source = this._context.createMediaElementSource(this._audio);
    this._source.connect(destination);
  }

  _setStalled(stalled: boolean) {
    this._stalled = stalled;
    this._emitter.trigger("stallChanged");
  }

  disconnect() {
    this._source.disconnect();
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
    // TODO: Dispose subscriptions to this.audio
    this.stop();
    this._emitter.dispose();
  }
}
