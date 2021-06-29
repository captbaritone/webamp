class AudioPlayer {
  _input: HTMLInputElement = document.createElement("input");
  _audio: HTMLAudioElement = document.createElement("audio");
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
    // TODO: Actually stop
    this._audio.pause();
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
}

const AUDIO_PLAYER = new AudioPlayer();

export default AUDIO_PLAYER;
