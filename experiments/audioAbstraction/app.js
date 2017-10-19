/* global ElementSource BufferSource */
const play = document.getElementById("play");
const pause = document.getElementById("pause");
const stop = document.getElementById("stop");
const eject = document.getElementById("eject");
const url = document.getElementById("url");
const loadUrl = document.getElementById("loadUrl");
const info = document.getElementById("info");
const position = document.getElementById("position");
const sourceType = document.getElementById("sourceType");
const autoplay = document.getElementById("autoplay");

const context = new (window.AudioContext || window.webkitAudioContext)();

const getSourceClass = () =>
  sourceType.value === "buffer" ? BufferSource : ElementSource;

let source = new (getSourceClass())(context, context.destination);
source.setAutoPlay(true);

sourceType.addEventListener("change", () => {
  source.disconnect();
  source = new (getSourceClass())(context, context.destination);
  source.setAutoPlay(true);
});

//const source = new BufferSource(context, context.destination);

play.addEventListener("click", () => {
  source.play();
});
pause.addEventListener("click", () => {
  source.pause();
});
stop.addEventListener("click", () => {
  source.stop();
});
eject.addEventListener("change", e => {
  source.loadFile(e.target.files[0]);
});

loadUrl.addEventListener("click", () => {
  source.loadUrl(url.value);
});

position.addEventListener("change", () => {
  const percent = position.value / 100;
  const newTime = source.getDuration() * percent;
  source.seekToTime(newTime);
});

autoplay.addEventListener("change", () => {
  source.setAutoPlay(autoplay.checked);
});

const updateInfo = () => {
  const data = {
    numberOfChannels: source.getNumberOfChannels(),
    status: source.getStatus(),
    duration: source.getDuration(),
    timeElapsed: source.getTimeElapsed(),
    sampleRate: source.getSampleRate(),
    loop: source.getLoop(),
    autoplay: source.getAutoPlay()
  };

  info.value = JSON.stringify(data, null, 2);
};
info.addEventListener("click", updateInfo);

source.on("statusChange", () => {
  updateInfo();
});

source.on("positionChange", () => {
  const percent = source.getTimeElapsed() / source.getDuration();
  position.value = percent * 100;
  updateInfo();
});
