import Emitter from "./emitter";

const STATUS = {
  PLAYING: "PLAYING",
  STOPPED: "STOPPED",
  PAUSED: "PAUSED"
};

export default class ElementSource extends Emitter {
  constructor(context, destination) {
    super();
    this._context = context;
    this._destination = destination;
    this._audio = document.createElement("audio");
    this._audio.crossorigin = "anonymous";
    this._stalled = false;
    this._status = STATUS.STOPPED;

    this._audio.addEventListener("suspend", () => {
      this._setStalled(true);
    });

    this._audio.addEventListener("durationchange", () => {
      this.trigger("loaded");
      this._setStalled(false);
    });

    this._audio.addEventListener("ended", () => {
      this._setStatus(STATUS.STOPPED);
    });

    // TODO: Throttle to 50 (if needed)
    this._audio.addEventListener("timeupdate", () => {
      this.trigger("positionChange");
    });

    this._source = this._context.createMediaElementSource(this._audio);
    this._audio.loop = false;
    this._source.connect(destination);
  }

  _setStalled(stalled) {
    this._stalled = stalled;
    this.trigger("stallChanged");
  }

  disconnect() {
    this._source.disconnect();
  }

  // Async for now, for compatibility with BufferAudioSource
  async loadUrl(url) {
    this._audio.src = url;
  }

  async play() {
    if (this._status !== STATUS.PAUSED) {
      this.seekToTime(0);
    }
    await this._audio.play();
    this._setStatus(STATUS.PLAYING);
  }

  pause() {
    this._audio.pause();
    this._setStatus(STATUS.PAUSED);
  }

  stop() {
    this._audio.pause();
    this._audio.currentTime = 0;
    this._setStatus(STATUS.STOPPED);
  }

  seekToTime(time) {
    // Make sure we are within range
    // TODO: Use clamp
    time = Math.min(time, this.getDuration());
    time = Math.max(time, 0);
    this._audio.currentTime = time;
    this.trigger("positionChange");
  }

  getStalled() {
    return this._stalled;
  }

  getStatus() {
    return this._status;
  }

  getDuration() {
    const { duration } = this._audio;
    return isNaN(duration) ? 0 : duration;
  }

  getTimeElapsed() {
    return this._audio.currentTime;
  }

  getNumberOfChannels() {
    return this._source.channelCount;
  }

  getSampleRate() {
    return null;
  }

  getLoop() {
    return this._audio.loop;
  }

  setLoop(shouldLoop) {
    this._audio.loop = shouldLoop;
  }

  _setStatus(status) {
    this._status = status;
    this.trigger("statusChange");
  }
}
