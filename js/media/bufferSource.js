import Emitter from "./emitter";

const invariant = (assertion, message) => {
  if (!assertion) {
    console.error(message);
  }
};

async function readUrlAsArrayBuffer(url) {
  return new Promise((resolve, reject) => {
    const oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";

    oReq.onload = () => {
      const arrayBuffer = oReq.response; // Note: not oReq.responseText
      resolve(arrayBuffer);
    };

    oReq.onerror = e => {
      reject(e);
    };

    oReq.send(null);
    return true;
  });
}

const STATUS = {
  PLAYING: "PLAYING",
  STOPPED: "STOPPED",
  PAUSED: "PAUSED"
};

export default class BufferSource extends Emitter {
  constructor(context, destination) {
    super();
    this._context = context;
    this._destination = destination;
    this._loop = false;
    this._buffer = null;
    this._source = null;
    this._status = STATUS.STOPPED;
    this._stalled = false;
    this._startTime = null;
    this._pausedAtTime = null;
    this._onEnded = this._onEnded.bind(this);
  }

  disconnect() {
    if (this._source != null) {
      this._source.disconnect();
      this._source = null;
    }
  }

  // Just adapt the callback into a promise.
  _decodeAudioData(buffer) {
    return new Promise((resolve, reject) => {
      this._context.decodeAudioData(buffer, resolve, reject);
    });
  }

  _startLoading() {
    this.stop();
    // Ensure we don't start playing while we are waiting to load.
    this._buffer = null;
    this._setStalled(true);
  }

  async loadUrl(url) {
    this._startLoading();
    const arrayBuffer = await readUrlAsArrayBuffer(url);
    return this._loadArrayBuffer(arrayBuffer);
  }

  async _loadArrayBuffer(arrayBuffer) {
    this._buffer = await this._decodeAudioData(arrayBuffer);
    this.trigger("loaded");
    this._setStalled(false);
    this._setStatus(STATUS.STOPPED);
  }

  play() {
    if (this._stalled) {
      return;
    }
    switch (this._status) {
      case STATUS.PLAYING:
      case STATUS.STOPPED:
        this._start(0);
        break;
      case STATUS.PAUSED:
        invariant(
          this._pausedAtTime != null,
          "Status is paused, but there is no _pausedAtTime"
        );
        this._start(this._pausedAtTime);
        break;
    }
  }

  pause() {
    this._pausedAtTime = this.getTimeElapsed();
    this._silence(STATUS.PAUSED);
  }

  stop() {
    this._silence(STATUS.STOPPED);
  }

  seekToTime(time) {
    if (!this.getDuration()) {
      return;
    }
    time = Math.min(time, this.getDuration());
    time = Math.max(time, 0);
    this._start(time);
  }

  getStatus() {
    return this._status;
  }

  getStalled() {
    return this._stalled;
  }

  getDuration() {
    if (this._buffer == null) {
      return 0;
    }
    return this._buffer.duration;
  }

  getTimeElapsed() {
    switch (this._status) {
      case STATUS.PLAYING:
        invariant(
          this._startTime != null,
          "status is playing, but there is no _startTime"
        );
        const totalTime = this._context.currentTime - this._startTime;
        // If looping, the time may be greater than the song's duration.
        return totalTime % this.getDuration();
      case STATUS.STOPPED:
        return 0;
      case STATUS.PAUSED:
        invariant(
          this._pausedAtTime != null,
          "Status is paused, but there is no _pausedAtTime"
        );
        return this._pausedAtTime;
    }
    throw new Error("Invalid status");
  }

  getNumberOfChannels() {
    if (this._buffer == null) {
      return null;
    }
    // TODO: This is actually the channels of the audio node, not the source media.
    return this._buffer.numberOfChannels;
  }

  getSampleRate() {
    if (this._buffer == null) {
      return null;
    }
    // TODO: This is actually the sample rate of the audio node, not the source media.
    return this._buffer.sampleRate;
  }

  getLoop() {
    return this._loop;
  }

  setLoop(shouldLoop) {
    this._loop = shouldLoop;
    if (this._source) {
      this._source.loop = this._loop;
    }
  }

  _start(position) {
    invariant(!isNaN(position));
    if (this._buffer == null) {
      return;
    }
    if (this._source) {
      // Does this work?
      this.disconnect();
    }
    this._source = this._context.createBufferSource();
    this._source.buffer = this._buffer;
    this._source.loop = this._loop;
    this._source.connect(this._destination);
    this._source.onended = this._onEnded;
    this._startTime = this._context.currentTime - position;
    this._setStatus(STATUS.PLAYING);
    this._source.start(0, position);
  }

  _silence(reason) {
    if (!reason) {
      throw new Error("Tried to silence the audio without a reason");
    }
    // We must always update the status before ending the audio, so that onEnded
    // can distinguish between audio that got to the end of the track, and audio
    // that the user stopped/paused
    this._setStatus(reason);
    if (this._source == null) {
      return;
    }
    this._source.stop(0);
    this._source = null;
  }

  _startMonitoringPosition() {
    this._nextPositionUpdate = setTimeout(() => {
      this.trigger("positionChange");
      this._startMonitoringPosition();
    }, 50);
  }

  _stopMonitoringPosition() {
    clearTimeout(this._nextPositionUpdate);
  }

  _setStatus(status) {
    this._status = status;
    if (status === STATUS.PLAYING) {
      this._startMonitoringPosition();
    } else {
      this._stopMonitoringPosition();
    }
    this.trigger("statusChange");
  }

  _setStalled(stalled) {
    this._stalled = stalled;
    this.trigger("statusChange");
  }

  _onEnded() {
    if (this._status === STATUS.PLAYING) {
      this._setStatus(STATUS.STOPPED);
    }
  }
}
