import { DEFAULT_SKIN } from "./constants";
import { WindowInfo } from "./types";

interface Time {
  minutesFirstDigit: string;
  minutesSecondDigit: string;
  secondsFirstDigit: string;
  secondsSecondDigit: string;
}

interface IniData {
  [section: string]: {
    [key: string]: string;
  };
}

export const getTimeObj = (time: number | null): Time => {
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
          String(Math.floor(minutes / 10)),
          String(Math.floor(minutes % 10)),
          String(Math.floor(seconds / 10)),
          String(Math.floor(seconds % 10))
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

export const getTimeStr = (
  time: number | null,
  truncate: boolean = true
): string => {
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
    truncate && minutesFirstDigit === "0" ? "" : minutesFirstDigit,
    minutesSecondDigit,
    ":",
    secondsFirstDigit,
    secondsSecondDigit
  ].join("");
};

export const getFileExtension = (fileName: string): string | null => {
  const matches = /\.([a-z]{3,4})$/i.exec(fileName);
  return matches ? matches[1].toLowerCase() : null;
};

export const parseViscolors = (text: string): string[] => {
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
      : DEFAULT_SKIN.colors[i];
  }
  return colors;
};

const SECTION_REGEX = /^\s*\[(.+?)\]\s*$/;
const PROPERTY_REGEX = /^\s*([^;].*)\s*=\s*(.*)\s*$/;

export const parseIni = (text: string): IniData => {
  let section: string, match;
  return text.split(/[\r\n]+/g).reduce((data: IniData, line) => {
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

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const base64FromArrayBuffer = (arrayBuffer: ArrayBuffer): string => {
  const dataView = new Uint8Array(arrayBuffer);
  return window.btoa(String.fromCharCode(...dataView));
};

// https://stackoverflow.com/a/15832662/1263117
export function downloadURI(uri: string, name: string): void {
  const link = document.createElement("a");
  link.download = name;
  link.href = uri;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
}

export const toPercent = (min: number, max: number, value: number): number =>
  (value - min) / (max - min);

export const percentToRange = (percent: number, min: number, max: number) =>
  min + Math.round(percent * (max - min));

export const percentToIndex = (percent: number, length: number): number =>
  percentToRange(percent, 0, length - 1);

const rebound = (
  oldMin: number,
  oldMax: number,
  newMin: number,
  newMax: number
) => (oldValue: number): number =>
  percentToRange(toPercent(oldMin, oldMax, oldValue), newMin, newMax);

// Convert a .eqf value to a 1-100
export const normalize = rebound(1, 64, 1, 100);

// Convert a 0-100 to an .eqf value
export const denormalize = rebound(1, 100, 1, 64);

// Merge a `source` object to a `target` recursively
// TODO: The typing here is a bit of a disaster.
export function merge<T extends object, S extends object>(
  target: T,
  source: S
): T & S {
  const s = source as any;
  const t = target as any;
  // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
  for (const key of Object.keys(s as any)) {
    if (s[key] instanceof Object) Object.assign(s[key], merge(t[key], s[key]));
  }

  // Join `target` and modified `source`
  Object.assign(target || {}, source);
  return target as any;
}

// Maps a value in a range (defined my min/max) to a value in an array (options).
export function segment<V>(
  min: number,
  max: number,
  value: number,
  newValues: V[]
): V {
  const ratio = toPercent(min, max, value);
  /*
  | 0 | 1 | 2 |
  0   1   2   3
  */
  return newValues[percentToIndex(ratio, newValues.length)];
}

export const arraysAreEqual = (a: any[], b: any[]): boolean =>
  a.length === b.length && a.every((value, i) => value === b[i]);

// https://bost.ocks.org/mike/shuffle/
// Shuffle an array in O(n)
export function shuffle<T>(array: T[]): T[] {
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
}

export function sort<T>(
  array: T[],
  iteratee: (value: T) => number | string
): T[] {
  return [...array].sort((a, b) => {
    const aKey = iteratee(a);
    const bKey = iteratee(b);
    if (aKey < bKey) {
      return -1;
    } else if (aKey > bKey) {
      return 1;
    }
    return 0;
  });
}

export function moveSelected<V>(
  arr: V[],
  isSelected: (index: number) => boolean,
  offset: number
): V[] {
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
}

export function spliceIn<T>(original: T[], start: number, newValues: T[]): T[] {
  const newArr = [...original];
  newArr.splice(start, 0, ...newValues);
  return newArr;
}

type Procedure = (...args: any[]) => void;

export function debounce<F extends Procedure>(func: F, delay: number): F {
  let token: NodeJS.Timer;
  return function(this: any, ...args: any[]): void {
    if (token != null) {
      clearTimeout(token);
    }
    token = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  } as any;
}

// Trailing edge only throttle
export function throttle<F extends Procedure>(func: F, delay: number): F {
  let timeout: NodeJS.Timer | null = null;
  let callbackArgs: any[] | null = null;

  return function(this: any, ...args: any[]): void {
    callbackArgs = args;
    if (!timeout) {
      timeout = setTimeout(() => {
        func.apply(this, callbackArgs);
        timeout = null;
      }, delay);
    }
  } as any;
}

let counter = 0;
export function uniqueId() {
  return counter++;
}

export function objectForEach<V>(
  obj: { [key: string]: V },
  cb: (value: V, key: string) => void
): void {
  Object.keys(obj).forEach(key => cb(obj[key], key));
}

export function objectMap<V, N>(
  obj: { [key: string]: V },
  cb: (value: V, key: string) => N
): { [key: string]: N } {
  const modified: { [key: string]: N } = {};
  Object.keys(obj).forEach(key => (modified[key] = cb(obj[key], key)));
  return modified;
}

export function objectFilter<V>(
  obj: { [key: string]: V },
  predicate: (value: V, key: string) => boolean
): { [key: string]: V } {
  // TODO: Could return the original reference if no values change
  return Object.keys(obj).reduce((newObj: { [key: string]: V }, key) => {
    if (predicate(obj[key], key)) {
      newObj[key] = obj[key];
    }
    return newObj;
  }, {});
}

export const calculateBoundingBox = (windows: WindowInfo[]) =>
  windows
    .map(w => ({
      left: w.x,
      top: w.y,
      bottom: w.y + w.height,
      right: w.x + w.width
    }))
    .reduce((b, w) => ({
      left: Math.min(b.left, w.left),
      top: Math.min(b.top, w.top),
      bottom: Math.max(b.bottom, w.bottom),
      right: Math.max(b.right, w.right)
    }));

export function findLastIndex<T>(arr: T[], cb: (val: T) => boolean) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (cb(arr[i])) {
      return i;
    }
  }
  return -1;
}

export function getWindowSize(): { width: number; height: number } {
  // Aparently this is crazy across browsers.
  return {
    width: Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.body.clientWidth,
      document.documentElement.clientWidth
    ),
    height: Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    )
  };
}
