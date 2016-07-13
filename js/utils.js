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

module.exports = {
  getTimeObj
};

