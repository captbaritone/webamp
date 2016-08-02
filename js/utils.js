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

const parseViscolors = (text) => {
  const entries = text.split('\n');
  const regex = /^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/;
  const colors = [];
  // changed to a hard number to deal with empty lines at the end...
  // plus its only meant to be an exact amount of numbers anywayz
  // - @PAEz
  for (let i = 0; i < 24; i++) {
    const matches = regex.exec(entries[i]);
    if (matches) {
      colors[i] = `rgb(${matches.slice(1, 4).join(',')})`;
    } else {
      console.error('Error in VISCOLOR.TXT on line', i);
    }
  }
  return colors;
};

module.exports = {
  getTimeObj,
  getTimeStr,
  parseViscolors
};
