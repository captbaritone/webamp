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
  // plus it's only meant to be an exact quantity of numbers anyway.
  // - @PAEz
  for (let i = 0; i < 24; i++) {
    const matches = regex.exec(entries[i]);
    if (matches) {
      colors[i] = `rgb(${matches.slice(1, 4).join(",")})`;
    } else {
      console.error(`Error in VISCOLOR.TXT on line ${i}`);
    }
  }
  return colors;
};

// Dumb ini parser that just gets all the key/value pairs
export const parseIni = text => {
  const lines = text.split(/[\r\n]+/g);
  return lines.reduce((data, line) => {
    if (line.includes("=")) {
      const [key, value] = line.split("=");
      data[key] = value;
    }
    return data;
  }, {});
};

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const base64FromArrayBuffer = arrayBuffer => {
  const dataView = new Uint8Array(arrayBuffer);
  return window.btoa(String.fromCharCode(...dataView));
};

// https://stackoverflow.com/a/15832662/1263117
export function downloadURI(uri, name) {
  const link = document.createElement("a");
  link.download = name;
  link.href = uri;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
}

export const rebound = (oldMin, oldMax, newMin, newMax) => oldValue =>
  Math.round(
    (oldValue - oldMin) * (newMax - newMin) / (oldMax - oldMin) + newMin
  );

// Convert a .eqf value to a 1-100
export const normalize = rebound(1, 64, 1, 100);

// Convert a 0-100 to an .eqf value
export const denormalize = rebound(1, 100, 1, 64);

// Merge a `source` object to a `target` recursively
export const merge = (target, source) => {
  // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object)
      Object.assign(source[key], merge(target[key], source[key]));
  }

  // Join `target` and modified `source`
  Object.assign(target || {}, source);
  return target;
};

// Maps a value in a range (defined my min/max) to the corresponding value in the array `newValues`.
export const segment = (min, max, value, newValues) =>
  newValues[Math.floor((value - min) / (max - min) * (newValues.length - 1))];
