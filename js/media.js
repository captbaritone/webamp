/* Emulate the native <audio> element with Web Audio API */
import { BANDS } from "./constants";
import MyFile from "./myFile";

export default class Media {
  constructor(fileInput) {
    this._context = new (window.AudioContext || window.webkitAudioContext)();
    this._source = null;
    this._buffer = null;
    this._callbacks = {
      waiting: function() {},
      stopWaiting: function() {},
      playing: function() {},
      timeupdate: function() {},
      visualizerupdate: function() {},
      ended: function() {},
      fileLoaded: function() {}
    };
    this._startTime = 0;
    this._position = 0;
    this._balance = 0;
    this._playing = false;
    this._loop = false;
    this.autoPlay = false;
    this.name = null;
    this.fileInput = fileInput;

    // The _source node has to be recreated each time it's stopped or
    // paused, so we don't create it here.

    // Create the preamp node
    this._preamp = this._context.createGain();

    // Create the spliter node
    this._chanSplit = this._context.createChannelSplitter(2);

    // Create the gains for left and right
    this._leftGain = this._context.createGain();
    this._rightGain = this._context.createGain();

    // Create channel merge
    this._chanMerge = this._context.createChannelMerger(2);

    // Create the gain node for the volume control
    this._gainNode = this._context.createGain();

    // Create the analyser node for the visualizer
    this._analyser = this._context.createAnalyser();
    this._analyser.fftSize = 2048;

    // Connect all the nodes in the correct way
    // (Note, source is created and connected later)
    //
    //                 <source>
    //                    |\
    //                    | <analyser>
    //                    |
    //                 preamp
    //                    |_____________
    //                    |             \
    //           [...biquadFilters]     | <-- Optional bypass
    //                    | ____________/
    //                    |/
    //    (split using createChannelSplitter)
    //                    |
    //                   / \
    //                  /   \
    //             leftGain rightGain
    //                  \   /
    //                   \ /
    //                    |
    //     (merge using createChannelMerger)
    //                    |
    //                chanMerge
    //                    |
    //                   gain
    //                    |
    //               destination

    let output = this._preamp;
    this.bands = {};

    BANDS.forEach((band, i) => {
      const filter = this._context.createBiquadFilter();

      this.bands[band] = filter;

      if (i === 0) {
        // The first filter, includes all lower frequencies
        filter.type = "lowshelf";
      } else if (i === band.length - 1) {
        // The last filter, includes all higher frequencies
        filter.type = "highshelf";
      } else {
        filter.type = "peaking";
      }
      filter.frequency.value = band;
      filter.gain.value = 0;

      output.connect(filter);
      output = filter;
    });

    output.connect(this._chanSplit);

    // Connect split channels to left / right gains
    this._chanSplit.connect(this._leftGain, 0);
    this._chanSplit.connect(this._rightGain, 1);

    // Reconnect the left / right gains to the merge node
    this._leftGain.connect(this._chanMerge, 0, 0);
    this._rightGain.connect(this._chanMerge, 0, 1);

    this._chanMerge.connect(this._gainNode);

    this._gainNode.connect(this._context.destination);

    // Kick off the animation loop
    this._draw(0);
    return this;
  }

  // Load from bufferArray
  loadBuffer(buffer, loadedCallback) {
    this.stop();
    this._callbacks.waiting();

    const loadAudioBuffer = function(audioBuffer) {
      this._buffer = audioBuffer;
      loadedCallback();
      this._callbacks.stopWaiting();
      if (this.autoPlay) {
        this.play(0);
      }
    };

    const error = function(errorMessage) {
      console.error("failed to decode:", errorMessage);
    };
    // Decode the target file into an arrayBuffer and pass it to loadBuffer
    this._context.decodeAudioData(buffer, loadAudioBuffer.bind(this), error);
  }

  /* Properties */
  duration() {
    return this._buffer.duration;
  }

  timeElapsed() {
    return this._position;
  }

  timeRemaining() {
    return this.duration() - this.timeElapsed();
  }

  percentComplete() {
    return this.timeElapsed() / this.duration() * 100;
  }

  channels() {
    if (!this._buffer) {
      return 0;
    }
    return this._buffer.numberOfChannels;
  }

  sampleRate() {
    return this._buffer.sampleRate;
  }

  /* Actions */
  previous() {
    // Implement this when we support playlists
  }

  play(position) {
    if (this._playing) {
      // So we don't get a race condition with _position getting overwritten
      this.pause();
    }
    if (this._buffer) {
      this._source = this._context.createBufferSource();
      this._source.buffer = this._buffer;
      this._source.connect(this._analyser);
      this._source.connect(this._preamp);

      this._position =
        typeof position !== "undefined" ? position : this._position;
      this._startTime = this._context.currentTime - this._position;
      this._source.start(0, this._position);
      this._playing = true;
      this._callbacks.playing();
    }
  }

  pause() {
    if (!this._playing) {
      return;
    }
    this._silence();
    this._updatePosition();
  }

  stop() {
    this._silence();
    this._position = 0;
  }

  _silence() {
    if (this._source) {
      this._source.stop(0);
      this._source = null;
    }
    this._playing = false;
  }

  /* Actions with arguments */
  seekToPercentComplete(percent) {
    const seekTime = this.duration() * (percent / 100);
    this.seekToTime(seekTime);
  }

  // From 0-1
  setVolume(volume) {
    this._gainNode.gain.value = volume / 100;
  }

  // From 0-1
  setPreamp(value) {
    this._preamp.gain.value = value / 100;
  }

  // From -100 to 100
  setBalance(balance) {
    let changeVal = Math.abs(balance) / 100;

    // Hack for Firefox. Having either channel set to 0 seems to revert us
    // to equal balance.
    changeVal = changeVal - 0.00000001;

    if (balance > 0) {
      // Right
      this._leftGain.gain.value = 1 - changeVal;
      this._rightGain.gain.value = 1;
    } else if (balance < 0) {
      // Left
      this._leftGain.gain.value = 1;
      this._rightGain.gain.value = 1 - changeVal;
    } else {
      // Center
      this._leftGain.gain.value = 1;
      this._rightGain.gain.value = 1;
    }
    this._balance = balance;
  }

  setEqBand(band, value) {
    const db = value / 100 * 24 - 12;
    this.bands[band].gain.value = db;
  }

  disableEq() {
    this._preamp.disconnect();
    this._preamp.connect(this._chanSplit);
  }

  enableEq() {
    this._preamp.disconnect();
    this._preamp.connect(this.bands[BANDS[0]]);
  }

  toggleRepeat() {
    this._loop = !this._loop;
  }

  toggleShuffle() {
    // Implement this when we support playlists
  }

  /* Listeners */
  addEventListener(event, callback) {
    this._callbacks[event] = callback;
  }

  seekToTime(time) {
    // Make sure we are within range
    // TODO: Use clamp
    time = Math.min(time, this.duration());
    time = Math.max(time, 0);
    this.play(time);
  }

  loadFromFileReference(fileReference) {
    const file = new MyFile();
    file.setFileReference(fileReference);
    this.autoPlay = true;
    this.name = file.name;
    file.processBuffer(this._loadBuffer.bind(this));
  }

  // Used only for the initial load, since it must have a CORS header
  loadFromUrl(url, fileName) {
    const file = new MyFile();
    this.name = fileName;
    file.setUrl(url, fileName);
    file.processBuffer(this._loadBuffer.bind(this));
  }

  /* Listeners */
  _loadBuffer(buffer) {
    // Note, this will not happen right away
    this.loadBuffer(buffer, this._callbacks.fileLoaded);
  }

  // There is probably a more reasonable way to do this, rather than having
  // it always running.
  _draw() {
    if (this._playing) {
      this._updatePosition();
      this._callbacks.timeupdate();
    }
    window.requestAnimationFrame(this._draw.bind(this));
  }

  _updatePosition() {
    this._position = this._context.currentTime - this._startTime;
    if (this._position >= this._buffer.duration && this._playing) {
      // Idealy we could use _source.loop, but it makes updating the position tricky
      if (this._loop) {
        this.play(0);
      } else {
        this.stop();
        this._callbacks.ended();
      }
    }
  }
}
