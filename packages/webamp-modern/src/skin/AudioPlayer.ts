import { ITags } from "id3-parser/lib/interface";
import { clamp, Emitter } from "../utils";

const BANDS = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];

export const AUDIO_PAUSED = "paused";
export const AUDIO_STOPPED = "stopped";
export const AUDIO_PLAYING = "playing";

// moved here because used by several files eg Playlist,AudioMetadata
export type Track = {
  id?: number; //used for identification while refreshing playlist
  filename: string; // full url, or just File.name
  file?: File; // Blob
  metadata?: ITags; // http://forums.winamp.com/showthread.php?t=345521
  title?: string;
  rating?: number; // 0..5
  duration?: number | null;
};

export class AudioPlayer {
  _audio: HTMLAudioElement = document.createElement("audio");
  _context: AudioContext;
  __preamp: GainNode;
  _analyser: AnalyserNode;
  _bands: GainNode[] = [];
  _volumeNode: GainNode;
  _balanceNode: StereoPannerNode;
  _balance: number = 0; // -127..127 temporary
  _source: MediaElementAudioSourceNode;
  _eqEnabled: boolean = true;
  _eqValues: { [kind: string]: number } = {};
  _eqNodes: { [kind: string]: number } = {};
  _eqEmitter: Emitter = new Emitter();
  _isStop: boolean = true; //becaue we can't audio.stop() currently
  _trackInfo: {};
  _albumArtUrl: string = null;
  _timeRemaining: boolean = false; //temporary. to show minus
  //events aka addEventListener()
  _eventListener: Emitter = new Emitter();
  _vuMeter: number = 0;
  _last_itime: number = 0;

  constructor() {
    this._context = this._context = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Fix for iOS and Chrome (Canary) which require that the context be created
    // or resumed by a user interaction.
    // https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
    // https://gist.github.com/laziel/7aefabe99ee57b16081c
    // Via: https://stackoverflow.com/a/43395068/1263117
    // TODO #leak
    if (this._context.state === "suspended") {
      const resume = async () => {
        await this._context.resume();

        if (this._context.state === "running") {
          // TODO: Add this to the disposable
          document.body.removeEventListener("touchend", resume, false);
          document.body.removeEventListener("click", resume, false);
          document.body.removeEventListener("keydown", resume, false);
        }
      };

      document.body.addEventListener("touchend", resume, false);
      document.body.addEventListener("click", resume, false);
      document.body.addEventListener("keydown", resume, false);
    }

    this._source = this._context.createMediaElementSource(this._audio);

    this.__preamp = this._context.createGain();

    this._volumeNode = this._context.createGain();

    // Create the analyser node for the visualizer
    this._analyser = this._context.createAnalyser();
    // this._analyser.fftSize = 2048;
    // this._analyser.fftSize = 32;
    // this._analyser.fftSize = 512; //? to get same VIS to winamp osciloscpoe
    this._analyser.fftSize = 1024; //? exactly identical to winamp VIS. truncated later in VIS
    // don't smooth audio analysis
    this._analyser.smoothingTimeConstant = 0.0;

    // default pan set to 0 - center
    this._balanceNode = new StereoPannerNode(this._context, { pan: 0 });
    // change the value of the balance by updating the pan value
    // stereoNode.pan.value = -1; // left
    // stereoNode.pan.value = 0; // center
    // stereoNode.pan.value = 1; // right

    const connectionNodes: AudioNode[] = [
      this._source,
      this.__preamp,
      // this._analyser,
    ];

    const analyserNode = this._analyser;

    //TODO: generate vuMeter only once needed.
    const pcmData = new Float32Array(analyserNode.fftSize);
    const onFrame = () => {
      analyserNode.getFloatTimeDomainData(pcmData);
      let sumSquares = 0.0;
      for (let i = 0; i < pcmData.length; i++) {
        const amplitude = pcmData[i];
        sumSquares += amplitude * amplitude;
      }
      this._vuMeter = Math.sqrt(sumSquares / pcmData.length);
      window.requestAnimationFrame(onFrame);
    };
    window.requestAnimationFrame(onFrame);

    BANDS.forEach((band, i) => {
      const filter = this._context.createBiquadFilter();
      this._bands.push(filter);

      if (i === 0) {
        // The first filter, includes all lower frequencies
        filter.type = "lowshelf";
      } else if (i === BANDS.length - 1) {
        // The last filter, includes all higher frequencies
        filter.type = "highshelf";
      } else {
        filter.type = "peaking";
      }
      filter.frequency.value = band;
      filter.gain.value = 0;
      connectionNodes.push(filter);
    });

    connectionNodes.push(this._balanceNode);
    connectionNodes.push(this._volumeNode);
    connectionNodes.push(this._context.destination);

    let current = connectionNodes[0];
    for (let i = 1; i < connectionNodes.length; i++) {
      let next = connectionNodes[i];
      current.connect(next);
      current = next;
    }

    this._balanceNode.connect(this._analyser);

    // Connect all the nodes in the correct way
    // (Note, source is created and connected later)
    //
    //                <source>
    //                    | _ _ _ _ _ _
    //                    |            :
    //                    V            :
    //                <preamp>         :
    //                    v            : <-- Optional bypass
    //           [...biquadFilters]    :
    //                    |            :
    //                    |<- - - - - -'
    //                    v
    //                <balance>
    //                    |\
    //                    | `--> <analyser>
    //                    v
    //                 <volume>
    //                    v
    //              <destination>

    //temporary: in the end of playing mp3, lets stop.
    //TODO: in future, when ended: play next mp3
    this._audio.addEventListener("ended", () => this.stop());
    this._audio.addEventListener("timeupdate", () => this.doTimeUpdate());
  }

  /**
   * This method should only the called directly by the audio
   * purpose: call to update text only when the second is different (not per-250ms)
   */
  doTimeUpdate() {
    const i = this._audio.currentTime << 0;
    if (i != this._last_itime) {
      this._last_itime = i;
      this.trigger("timeupdate");
      // console.log('ITEIMER:', this.getCurrentTime())
    }
  }

  setEqEnabled(enable: boolean) {
    this._eqEnabled = enable;
    this._source.disconnect();
    if (enable) {
      this._source.connect(this.__preamp);
    } else {
      // bypassed.
      this._source.connect(this._balanceNode);
    }
  }
  getEqEnabled(): boolean {
    return this._eqEnabled;
  }

  getAnalyser(): AnalyserNode {
    return this._analyser;
  }

  setEqEnabled(enable: boolean) {
    this._eqEnabled = enable;
    this._source.disconnect();
    if (enable) {
      this._source.connect(this.__preamp);
    } else {
      // bypassed.
      this._source.connect(this._balanceNode);
    }
  }
  getEqEnabled(): boolean {
    return this._eqEnabled;
  }

  getAnalyser(): AnalyserNode {
    return this._analyser;
  }

  // shortcut of this.Emitter
  on(event: string, callback: Function): Function {
    return this._eventListener.on(event, callback);
  }
  trigger(event: string, ...args: any[]) {
    this._eventListener.trigger(event, ...args);
  }
  off(event: string, callback: Function) {
    this._eventListener.off(event, callback);
  }

  setAudioSource(url: string) {
    this._audio.src = url;
  }

  // 0-1
  getVolume(): number {
    // return this._audio.volume;
    return this._volumeNode.gain.value;
  }
  // 0-1
  setVolume(volume: number) {
    // this._audio.volume = volume;
    if (volume != this._volumeNode.gain.value) {
      this._volumeNode.gain.value = volume;
      this.trigger("volumechanged");
    }
  }

  getBalance(): number {
    return this._balance;
  }
  // -127..127
  // -1..0..1
  setBalance(balance: number) {
    this._balanceNode.pan.value = balance;
    this._balance = balance;
    this.trigger("balancechange");
  }

  // 0.5 .. 4
  getPlaybackRate(): number {
    return this._audio.playbackRate;
  }
  setPlaybackRate(value: number) {
    this._audio.playbackRate = clamp(value, 0.5, 4.0);
    this.trigger("playbackratechange");
  }

  play() {
    this._isStop = false;
    this.trigger("timeupdate");
    this._audio.play();
    this.trigger("play");
    this.trigger("statchanged");
  }
  stop() {
    this._isStop = true; // needed to make threestate
    if (this._audio.paused) {
      this._audio.play();
    } // for trigger the event change
    this._audio.pause();
    this._audio.currentTime = 0;
    this.trigger("stop");
    this.trigger("statchanged");
  }
  pause() {
    this._isStop = false; // needed to make threestate
    this._audio.pause();
    this.trigger("pause");
    this.trigger("statchanged");
  }

  seekTo(secs: number) {
    this._audio.currentTime = secs;
  }

  seekToPercent(percent: number) {
    this._audio.currentTime = this._audio.duration * percent;
  }

  toggleRemainingTime() {
    this._timeRemaining = !this._timeRemaining;
  }
  // In seconds
  getCurrentTime(): number {
    // return this._audio.currentTime;
    return this._timeRemaining
      ? this._audio.currentTime - this._audio.duration
      : this._audio.currentTime;
  }

  getCurrentTimePercent(): number {
    return this._audio.currentTime / this._audio.duration;
  }

  getState(): string {
    if (this._isStop) {
      // To distinct from pause
      return AUDIO_STOPPED;
    }
    const audio = this._audio;
    if (!audio.ended && !audio.paused) {
      return AUDIO_PLAYING;
    } else if (audio.ended) {
      return AUDIO_STOPPED;
    } else if (audio.paused) {
      return AUDIO_PAUSED;
    }
  }

  getEq(kind: string): number {
    switch (kind) {
      case "preamp":
        const a = this.__preamp.gain.value;
        const c = Math.log(a) / Math.log(10);
        const n = c * 20;
        return (n + 12) / 24;
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
        const bandIndex = Number(kind) - 1;
        const filter = this._bands[bandIndex];
        const value = (filter.gain.value + 12) / 24;
        return value;
      default:
        console.warn(`Tried to get unknown EQ kind: ${kind}`);
        return 0;
    }
  }

  /**
   *
   * @param kind : string range: '1'..'10'
   * @param value : float range 0..1
   */
  setEq(kind: string, value: number) {
    // console.log({ kind, value });
    const db = value * 24 - 12;
    switch (kind) {
      case "preamp": {
        // For now, 0 is 0db (no change).
        // Equation used is: 10^((dB)/20) = x, where x (preamp.gain.value) is passed on to gainnode for boosting or attenuation.
        this.__preamp.gain.value = Math.pow(10, db / 20);
        this._eqValues[kind] = db;
        this._eqEmitter.trigger(kind);
        break;
      }
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
        const bandIndex = Number(kind) - 1;
        const filter = this._bands[bandIndex];
        filter.gain.value = db;
        this._eqEmitter.trigger(kind);
        break;
      default:
        console.warn(`Tried to set unknown EQ kind: ${kind}`);
    }
  }

  onEqChange(kind: string, cb: () => void): Function {
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

  onCurrentTimeChange(cb: () => void): Function {
    // const handler = () => cb();
    // this._audio.addEventListener("timeupdate", handler);
    // const dispose = () => {
    //   this._audio.removeEventListener("timeupdate", handler);
    // };
    // return dispose;
    return this.on("timeupdate", cb);
  }

  onSeek(cb: () => void): () => void {
    const handler = () => cb();
    this._audio.addEventListener("seeked", handler);
    const dispose = () => {
      this._audio.removeEventListener("seeked", handler);
    };
    return dispose;
  }

  onVolumeChanged(cb: Function): Function {
    return this.on("volumechanged", cb);
  }

  onBalanceChanged(cb: () => void): Function {
    const handler = () => cb();
    const dispose = this.on("balancechange", handler);
    return dispose;
  }

  // Current track length in seconds
  getLength(): number {
    return this._audio.duration;
  }
}

const AUDIO_PLAYER = new AudioPlayer();

export default AUDIO_PLAYER;
