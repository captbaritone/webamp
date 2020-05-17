import Emitter from "../emitter";
import { clamp } from "../utils";
import { MEDIA_STATUS } from "../constants";
import { MediaStatus } from "../types";

export default class ElementSource {
  _emitter: Emitter;
  _context: AudioContext;
  _source: AudioNode;
  _destination: AudioNode;
  _audio: HTMLAudioElement;
  _stalled: boolean;
  _status: MediaStatus;

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

    // TODO: #leak
    this._audio.addEventListener("suspend", () => {
      this._setStalled(true);
    });

    // TODO: #leak
    this._audio.addEventListener("durationchange", () => {
      this._emitter.trigger("loaded");
      this._setStalled(false);
    });

    // TODO: #leak
    this._audio.addEventListener("ended", () => {
      this._emitter.trigger("ended");
      this._setStatus(MEDIA_STATUS.STOPPED);
    });

    // TODO: Throttle to 50 (if needed)
    // TODO: #leak
    this._audio.addEventListener("timeupdate", () => {
      this._emitter.trigger("positionChange");
    });

    // TODO: #leak
    this._audio.addEventListener("error", (e) => {
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
    this._audio.src = url;
  }

  async play() {
    if (this._status !== MEDIA_STATUS.PAUSED) {
      this.seekToTime(0);
    }
    try {
      await this._audio.play();
      // TODO #race
    } catch (err) {
      //
    }
    this._setStatus(MEDIA_STATUS.PLAYING);
  }

  pause() {
    this._audio.pause();
    this._setStatus(MEDIA_STATUS.PAUSED);
  }

  stop() {
    this._audio.pause();
    this._audio.currentTime = 0;
    this._setStatus(MEDIA_STATUS.STOPPED);
  }

  seekToTime(time: number) {
    /* TODO: We could check if this is actually seekable:
    const { seekable } = this._audio;
    for (let i = 0; i < seekable.length; i++) {
      console.log("start", seekable.start(i), "end", seekable.end(i));
    }
    */
    this._audio.currentTime = clamp(time, 0, this.getDuration());
    this._emitter.trigger("positionChange");
  }

  getStalled() {
    return this._stalled;
  }

  getStatus() {
    return this._status;
  }

  getDuration() {
    const { duration } = this._audio;
    // Safari on iOS currently has a strange behavior where it reports
    // the duration as infinity if an Accept-Ranges header is not returned.
    // For now, 0 is better even though it's still wrong.
    return isNaN(duration) || duration === Infinity ? 0 : duration;
  }

  getTimeElapsed() {
    return this._audio.currentTime;
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
