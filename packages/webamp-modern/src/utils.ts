import JSZip, { JSZipObject } from "jszip";

export function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

// While developing I want to clarify some assumptions. These are things which
// don't need to break the world, but I would like to know if/when my
// assumptions are invalidated.
// In the future these can be turned into warnings.
export function assume(condition: boolean, message: string) {
  if (!condition) {
    console.warn(message);
  }
  return condition;
}

export function getCaseInsensitiveFile(
  zip: JSZip,
  filePath: string
): JSZipObject | null {
  const normalized = filePath.replace(/[\/\\]/g, `[/\\\\]`);
  const files = zip.file(new RegExp(normalized, "i"));
  if (files && files.length > 1) {
    // console.log('asking',filePath,'got files:', files);
    const requestName = filePath.split("/").pop().toLowerCase();
    for (let i = 0; i < files.length; i++) {
      const responseName = files[i].name.split("/").pop().toLowerCase();
      if (responseName == requestName) {
        return files[i];
      }
    }
    return zip.file(new RegExp(`^${normalized}$`, "i"))[0] ?? null;
  }
  return files[0] ?? null;
}

export function num(str: string | void): number | null {
  return str == null ? null : Number(str);
}

export function px(size: number): string {
  return `${size}px`;
}

export function relative(size: number): string {
  if (size === 0) return "100%";
  return `calc(100% + ${size}px)`;
}

export function toBool(str: string) {
  str = str.toLowerCase();
  assume(
    str === "0" || str === "1" || str === "false" || str === "true",
    `Expected bool value to be "0" or "1", but it was "${str}".`
  );
  if (!isNaN(parseInt(str))) {
    return parseInt(str) > 0;
  }
  return str === "1" || str === "true";
}

let id = 0;
export function getId(): number {
  return id++;
}

// TODO: Delete this once we have proper type coersion in the VM.
export function ensureVmInt(num: number): number {
  return Math.floor(num);
}

export function clamp(num: number, min: number, max: number): number {
  return Math.max(min, Math.min(num, max));
}
// same as clamp, but goto next/prev instead floor/ceil.
export function circular(num: number, min: number, max: number): number {
  assert(min < max, "illegal circular parameter.");
  while (num < min) {
    // -2 < 0
    num = max + num;
  }
  while (num > max) {
    //   10 > 5
    num = num - max; // = 10 - 5
  }
  // return Math.max(min, Math.min(num, max));
  assert(num >= min && num <= max, "stupid in math, boss?");
  return num;
}

export function normalizeDomId(id: string) {
  return id.replace(/[^a-zA-Z0-9]/g, "-");
}

export function removeAllChildNodes(parent: Element) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

export function integerToTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = String(Math.abs(Math.floor(seconds % 60))).padStart(2, "0");
  return `${mins}:${secs}`;
}

export function findLast<T>(
  arr: T[],
  predicate: (value: T) => boolean
): T | undefined {
  for (let i = arr.length - 1; i >= 0; i--) {
    const value = arr[i];
    if (predicate(value)) {
      return value;
    }
  }
}

export function getUrlQuery(location: Location, variable: string): string {
  return new URL(location.href).searchParams.get(variable);
}

export function debounce<Params extends any[]>(
  func: (...args: Params) => any,
  timeout: number
): (...args: Params) => void {
  let timer: NodeJS.Timeout;
  return (...args: Params) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
}

export const throttle = (fn: Function, wait: number = 300) => {
  let inThrottle: boolean,
    lastFn: ReturnType<typeof setTimeout>,
    lastTime: number;
  return function (this: any) {
    const context = this,
      args = arguments;
    if (!inThrottle) {
      inThrottle = true;
      fn.apply(context, args);
      lastTime = Date.now();
    } else {
      clearTimeout(lastFn);
      lastFn = setTimeout(() => {
        if (Date.now() - lastTime >= wait) {
          fn.apply(context, args);
          lastTime = Date.now();
        }
      }, Math.max(wait - (Date.now() - lastTime), 0));
    }
  };
};

export function unimplemented(value: any): any {
  return value;
}

/**
 * parse color string into byte values.
 * @param hex only a valid html : '#XXXXXX'
 * @returns an object with respected keys of: r,g,b.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Purpuse: to hold eventListeners
 */
export class Emitter {
  _cbs: { [event: string]: Array<Function> } = {};

  // call this to register a callback to a specific event
  on(event: string, cb: Function): Function {
    if (this._cbs[event] == null) {
      this._cbs[event] = [];
    }
    this._cbs[event].push(cb);

    // return a function for later unregistering
    return () => {
      //TODO: consider using this.off(), or integrate both
      this._cbs[event] = this._cbs[event].filter((c) => c !== cb);
    };
  }

  // remove an registered callback from a specific event
  off(event: string, cb: Function) {
    if (this._cbs[event] == null) {
      return;
    }
    const cbs = this._cbs[event];
    const index = cbs.indexOf(cb, 0);
    if (index > -1) {
      cbs.splice(index, 1);
    }
  }

  // call this to run registered callbacks of an event
  trigger(event: string, ...args: any[]) {
    const subscriptions = this._cbs[event];
    if (subscriptions == null) {
      return;
    }
    for (const cb of subscriptions) {
      cb(...args);
    }
  }
}
