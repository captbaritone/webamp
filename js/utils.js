const getTimeObj = (time) => {
  var minutes = Math.floor(time / 60);
  var seconds = time % 60;

  return {
    minutesFirstDigit: Math.floor(minutes / 10),
    minutesSecondDigit: Math.floor(minutes % 10),
    secondsFirstDigit: Math.floor(seconds / 10),
    secondsSecondDigit: Math.floor(seconds % 10)
  };
};

const getTimeStr = (time) => {
  const timeObj = getTimeObj(time);
  return [
    timeObj.minutesFirstDigit,
    timeObj.minutesSecondDigit,
    ':',
    timeObj.secondsFirstDigit,
    timeObj.secondsSecondDigit
  ].join('');
};

const getBalanceText = (balance) => {
  if (balance === 0) {
    return 'Balance: Center';
  }
  const direction = balance > 0 ? 'Right' : 'Left';
  return `Balance: ${Math.abs(balance)}% ${direction}`;
};

const getVolumeText = (volume) => `Volume: ${volume}%`;

const getPositionText = (duration, seekToPercent) => {
  const newElapsedStr = getTimeStr(duration * seekToPercent / 100);
  const durationStr = getTimeStr(duration);
  return `Seek to: ${newElapsedStr}/${durationStr} (${seekToPercent}%)`;
};

const getMediaText = (name, duration) => {
  return `${name} (${getTimeStr(duration)})  ***  `;
};

const getDoubleSizeModeText = (enabled) => {
  return `${enabled ? 'Disable' : 'Enable'} doublesize mode`;
};

const wrapForMarquee = (text, step) => {
  if (text.length <= 30) {
    return text;
  }
  step = step % (text.length + 1);
  const chars = text.split('');
  const start = chars.slice(step);
  const end = chars.slice(0, step);
  return [...start, ' ', ...end].slice(0, 30).join('');
};

module.exports = {
  getTimeObj,
  getTimeStr,
  getBalanceText,
  getVolumeText,
  getPositionText,
  getMediaText,
  getDoubleSizeModeText,
  wrapForMarquee
};
