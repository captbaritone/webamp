import { DEFAULT_VIS_COLORS } from "./constants";

export const getTimeObj = time => {
  if (time == null) {
    // If we clean up `<MiniTime />` we don't need to do this any more.
    return {
      minutesFirstDigit: " ",
      minutesSecondDigit: " ",
      secondsFirstDigit: " ",
      secondsSecondDigit: " "
    };
  }
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  const digits =
    time == null
      ? [" ", " ", " ", " "]
      : [
          Math.floor(minutes / 10),
          Math.floor(minutes % 10),
          Math.floor(seconds / 10),
          Math.floor(seconds % 10)
        ];

  const [
    minutesFirstDigit,
    minutesSecondDigit,
    secondsFirstDigit,
    secondsSecondDigit
  ] = digits;

  return {
    minutesFirstDigit,
    minutesSecondDigit,
    secondsFirstDigit,
    secondsSecondDigit
  };
};

export const getTimeStr = (time, truncate = true) => {
  if (time == null) {
    return "";
  }
  const {
    minutesFirstDigit,
    minutesSecondDigit,
    secondsFirstDigit,
    secondsSecondDigit
  } = getTimeObj(time);

  return [
    truncate ? minutesFirstDigit || "" : minutesFirstDigit,
    minutesSecondDigit,
    ":",
    secondsFirstDigit,
    secondsSecondDigit
  ].join("");
};

export const getFileExtension = fileName => {
  const matches = /\.([a-z]{3,4})$/i.exec(fileName);
  return matches ? matches[1].toLowerCase() : null;
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
    colors[i] = matches
      ? `rgb(${matches.slice(1, 4).join(",")})`
      : DEFAULT_VIS_COLORS[i];
  }
  return colors;
};

const SECTION_REGEX = /^\s*\[(.+?)\]\s*$/;
const PROPERTY_REGEX = /^\s*([^;].*)\s*=\s*(.*)\s*$/;

export const parseIni = text => {
  let section, match;
  return text.split(/[\r\n]+/g).reduce((data, line) => {
    if ((match = line.match(PROPERTY_REGEX)) && section != null) {
      const value = match[2].replace(/(^")|("$)|(^')|('$)/gi, "");
      data[section][match[1].trim().toLowerCase()] = value;
    } else if ((match = line.match(SECTION_REGEX))) {
      section = match[1].trim().toLowerCase();
      data[section] = {};
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

export const toPercent = (min, max, value) => (value - min) / (max - min);

export const percentToRange = (percent, min, max) =>
  min + Math.round(percent * (max - min));

export const percentToIndex = (percent, length) =>
  percentToRange(percent, 0, length - 1);

const rebound = (oldMin, oldMax, newMin, newMax) => oldValue =>
  percentToRange(toPercent(oldMin, oldMax, oldValue), newMin, newMax);

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

// Maps a value in a range (defined my min/max) to a value in an array (options).
export const segment = (min, max, value, newValues) => {
  const ratio = toPercent(min, max, value);
  /*
  | 0 | 1 | 2 |
  0   1   2   3
  */
  return newValues[percentToIndex(ratio, newValues.length)];
};

export const arraysAreEqual = (a, b) =>
  a.length === b.length && a.every((value, i) => value === b[i]);

// https://bost.ocks.org/mike/shuffle/
// Shuffle an array in O(n)
export const shuffle = array => {
  const sorted = [...array];
  let m = sorted.length;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    const i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    const val = sorted[m];
    sorted[m] = sorted[i];
    sorted[i] = val;
  }

  return sorted;
};

export const sort = (array, iteratee) =>
  [...array].sort((a, b) => {
    const aKey = iteratee(a);
    const bKey = iteratee(b);
    if (aKey < bKey) {
      return -1;
    } else if (aKey > bKey) {
      return 1;
    }
    return 0;
  });

export const moveSelected = (arr, isSelected, offset) => {
  const newArr = new Array(arr.length);
  let next = 0;
  for (let i = 0; i < newArr.length; i++) {
    const from = i - offset;
    // Is a value supposed to move here?
    if (from >= 0 && from < arr.length && isSelected(from)) {
      newArr[i] = arr[from];
    } else {
      while (next < arr.length && isSelected(next)) {
        next++;
      }
      newArr[i] = arr[next];
      next++;
    }
  }
  return newArr;
};

export const spliceIn = (original, start, newValues) => {
  const newArr = [...original];
  newArr.splice(start, 0, ...newValues);
  return newArr;
};

export function debounce(func, delay) {
  let token;
  return function(...args) {
    if (token != null) {
      clearTimeout(token);
    }
    token = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

let counter = 0;
export function uniqueId() {
  return counter++;
}

export function objectForEach(obj, cb) {
  Object.keys(obj).forEach(key => cb(obj[key], key));
}

export function objectMap(obj, cb) {
  const modified = {};
  Object.keys(obj).forEach(key => (modified[key] = cb(obj[key], key)));
  return modified;
}

export const objectFilter = (obj, predicate) =>
  // TODO: Could return the original reference if no values change
  Object.keys(obj).reduce((newObj, key) => {
    if (predicate(obj[key], key)) {
      newObj[key] = obj[key];
    }
    return newObj;
  }, {});
