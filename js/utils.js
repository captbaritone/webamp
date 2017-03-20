export const getTimeObj = time => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return {
    minutesFirstDigit: Math.floor(minutes / 10),
    minutesSecondDigit: Math.floor(minutes % 10),
    secondsFirstDigit: Math.floor(seconds / 10),
    secondsSecondDigit: Math.floor(seconds % 10)
  };
};

export const getTimeStr = time => {
  const timeObj = getTimeObj(time);
  return [
    timeObj.minutesFirstDigit,
    timeObj.minutesSecondDigit,
    ":",
    timeObj.secondsFirstDigit,
    timeObj.secondsSecondDigit
  ].join("");
};

export const parseViscolors = text => {
  const entries = text.split("\n");
  const regex = /^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/;
  const colors = [];
  // changed to a hard number to deal with empty lines at the end...
  // plus its only meant to be an exact amount of numbers anywayz
  // - @PAEz
  for (let i = 0; i < 24; i++) {
    const matches = regex.exec(entries[i]);
    if (matches) {
      colors[i] = `rgb(${matches.slice(1, 4).join(",")})`;
    } else {
      console.error("Error in VISCOLOR.TXT on line", i);
    }
  }
  return colors;
};

// Dumb ini parser that just gets all the key/value pairs
export const parseIni = text => {
  const lines = text.split(/[\r\n]+/g);
  const data = {};
  lines.forEach(line => {
    if (line.includes("=")) {
      const [key, value] = line.split("=");
      data[key] = value;
    }
  });
  return data;
};

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
