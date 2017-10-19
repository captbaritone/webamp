(function() {
  const STATUS = {
    WAITING: "WAITING",
    PLAYING: "PLAYING",
    STOPPED: "STOPPED",
    PAUSED: "PAUSED"
  };

  class ElementSource extends window.Emitter {
    constructor(context, destination) {
      super();
      this._context = context;
      this._destination = destination;
      this._audio = document.createElement("audio");
      this._audio.crossorigin = "anonymous";

      this._audio.addEventListener("loadend", () => {
        if (this._autoPlay) {
          this.play();
        }
      });

      this._audio.addEventListener("timeupdate", () => {
        this.trigger("positionChange");
      });

      this._source = this._context.createMediaElementSource(this._audio);
      this._loop = true;
      this._autoPlay = true; // Do this ourselves for now. The actual API is bonkers and may not play well with mobile Safari
      this._source.connect(destination);
    }

    disconnect() {
      this._source.disconnect();
    }

    // Async for now, for compatibility with BufferAudioSource
    async loadUrl(url) {
      this._audio.src = url;
      if (this._autoPlay) {
        this.play();
      }
    }

    loadFile(fileReference) {
      this.loadUrl(URL.createObjectURL(fileReference));
    }

    async play() {
      // TODO: set status waiting
      if (this._status !== STATUS.PAUSED) {
        this.seekToTime(0);
      }
      await this._audio.play();
      this._setStatus(STATUS.PLAYING);
      // TODO: set status playing
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
      return this._loop;
    }

    setLoop(shouldLoop) {
      this._loop = shouldLoop;
    }

    getAutoPlay() {
      return this._autoPlay;
    }
    setAutoPlay(shouldAutoPlay) {
      this._autoPlay = shouldAutoPlay;
    }

    _setStatus(status) {
      this._status = status;
      this.trigger("statusChange");
    }
  }

  window.ElementSource = ElementSource;
  //export default AudioSource;
})();
