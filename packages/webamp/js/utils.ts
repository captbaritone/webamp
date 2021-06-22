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

export function imgFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export const getTimeObj = (time: number | null): Time => {
  if (time == null) {
    // If we clean up `<MiniTime />` we don't need to do this any more.
    return {
      minutesFirstDigit: " ",
      minutesSecondDigit: " ",
      secondsFirstDigit: " ",
      secondsSecondDigit: " ",
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
          String(Math.floor(seconds % 10)),
        ];

  const [
    minutesFirstDigit,
    minutesSecondDigit,
    secondsFirstDigit,
    secondsSecondDigit,
  ] = digits;

  return {
    minutesFirstDigit,
    minutesSecondDigit,
    secondsFirstDigit,
    secondsSecondDigit,
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
    secondsSecondDigit,
  } = getTimeObj(time);

  return [
    truncate && minutesFirstDigit === "0" ? "" : minutesFirstDigit,
    minutesSecondDigit,
    ":",
    secondsFirstDigit,
    secondsSecondDigit,
  ].join("");
};

export const parseViscolors = (text: string): string[] => {
  const entries = text.split("\n");
  const regex = /^\s*(\d+)\s*,?\s*(\d+)\s*,?\s*(\d+)/;
  const colors = [...DEFAULT_SKIN.colors];
  entries
    .map((line) => regex.exec(line))
    .filter(Boolean)
    .map((matches) => (matches as RegExpExecArray).slice(1, 4).join(","))
    .map((rgb, i) => {
      colors[i] = `rgb(${rgb})`;
    });
  return colors;
};

const SECTION_REGEX = /^\s*\[(.+?)\]\s*$/;
const PROPERTY_REGEX = /^\s*([^;][^=]*)\s*=\s*(.*)\s*$/;

export const parseIni = (text: string): IniData => {
  let section: string, match;
  return text.split(/[\r\n]+/g).reduce((data: IniData, line) => {
    if ((match = line.match(PROPERTY_REGEX)) && section != null) {
      const key = match[1].trim().toLowerCase();
      const value = match[2]
        // Ignore anything after a second `=`
        // TODO: What if this is inside quotes or escaped?
        .replace(/\=.*$/g, "")
        .trim()
        // Strip quotes
        // TODO: What about escaped quotes?
        // TODO: What about unbalanced quotes?
        .replace(/(^")|("$)|(^')|('$)/g, "");
      data[section][key] = value;
    } else if ((match = line.match(SECTION_REGEX))) {
      section = match[1].trim().toLowerCase();
      data[section] = {};
    }
    return data;
  }, {});
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const sum = (values: number[]): number =>
  values.reduce((total, value) => total + value, 0);

export function base64FromDataArray(dataArray: Uint8Array): string {
  return window.btoa(
    Array.from(dataArray)
      .map((byte) => String.fromCharCode(byte))
      .join("")
  );
}

export const base64FromArrayBuffer = (arrayBuffer: ArrayBuffer): string => {
  return base64FromDataArray(new Uint8Array(arrayBuffer));
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

const rebound =
  (oldMin: number, oldMax: number, newMin: number, newMax: number) =>
  (oldValue: number): number =>
    percentToRange(toPercent(oldMin, oldMax, oldValue), newMin, newMax);

// Convert an .eqf value to a 0-100
export const normalizeEqBand = rebound(1, 64, 0, 100);

// Convert a 0-100 to an .eqf value
export const denormalizeEqBand = rebound(0, 100, 1, 64);

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

export function replaceAtIndex<T>(arr: T[], index: number, newValue: T): T[] {
  return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)];
}

export function debounce(func: Function, delay: number): Function {
  let timeout: number;
  let callbackArgs: any[] = [];

  return function (context: Object, ...args: any[]): void {
    callbackArgs = args;

    if (timeout != null) {
      clearTimeout(timeout);
    }
    timeout = window.setTimeout(() => {
      func.apply(context, callbackArgs);
    }, delay);
  };
}

// Trailing edge only throttle
export function throttle(func: Function, delay: number): Function {
  let timeout: number | null = null;
  let callbackArgs: any[] = [];

  return function (context: Object, ...args: any[]): void {
    callbackArgs = args;

    if (!timeout) {
      timeout = window.setTimeout(() => {
        func.apply(context, callbackArgs);
        timeout = null;
      }, delay);
    }
  };
}

let counter = 0;
export function uniqueId() {
  return counter++;
}

export function objectForEach<V>(
  obj: { [key: string]: V },
  cb: (value: V, key: string) => void
): void {
  Object.keys(obj).forEach((key) => cb(obj[key], key));
}

export function objectMap<V, N>(
  obj: { [key: string]: V },
  cb: (value: V, key: string) => N
): { [key: string]: N } {
  const modified: { [key: string]: N } = {};
  Object.keys(obj).forEach((key) => (modified[key] = cb(obj[key], key)));
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

export const calculateBoundingBox = (windows: WindowInfo[]) => {
  if (windows.length === 0) {
    return null;
  }
  const windowSizes = windows.map((w) => ({
    left: w.x,
    top: w.y,
    bottom: w.y + w.height,
    right: w.x + w.width,
  }));
  return windowSizes.reduce((b, w) => ({
    left: Math.min(b.left, w.left),
    top: Math.min(b.top, w.top),
    bottom: Math.max(b.bottom, w.bottom),
    right: Math.max(b.right, w.right),
  }));
};

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
      document.documentElement!.scrollWidth,
      document.body.offsetWidth,
      document.documentElement!.offsetWidth,
      document.body.clientWidth,
      document.documentElement!.clientWidth
    ),
    height: Math.max(
      document.body.scrollHeight,
      document.documentElement!.scrollHeight,
      document.body.offsetHeight,
      document.documentElement!.offsetHeight,
      document.body.clientHeight,
      document.documentElement!.clientHeight
    ),
  };
}

export function getScreenSize(): { width: number; height: number } {
  return {
    width: window.screen.width,
    height: window.screen.height,
  };
}

type PosEvent =
  | MouseEvent
  | TouchEvent
  | React.MouseEvent<HTMLElement>
  | React.TouchEvent<HTMLElement>;

function getPos(e: PosEvent): { clientX: number; clientY: number } {
  switch (e.type) {
    case "touchstart":
    case "touchmove": {
      const touch =
        (e as TouchEvent).targetTouches[0] ?? (e as TouchEvent).touches[0];
      if (touch == null) {
        // Investigating https://github.com/captbaritone/webamp/issues/1105
        throw new Error("Unexpected touch event with zero touch targets.");
      }
      return touch;
    }
    case "mousedown":
    case "mousemove": {
      return e as MouseEvent;
    }
    default:
      throw new Error(`Unexpected event type: ${e.type}`);
  }
}

export function getX(e: PosEvent) {
  return getPos(e).clientX;
}

export function getY(e: PosEvent) {
  return getPos(e).clientY;
}

export function weakMapMemoize<T extends object, R>(
  func: (value: T) => R
): (value: T) => R {
  const cache = new WeakMap();
  return (value: T) => {
    if (!cache.has(value)) {
      cache.set(value, func(value));
    }
    return cache.get(value);
  };
}
