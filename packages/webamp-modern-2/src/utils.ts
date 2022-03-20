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
  return zip.file(new RegExp(normalized, "i"))[0] ?? null;
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
  assert(
    str === "0" || str === "1",
    `Expected bool value to be "0" or "1", but it was "${str}".`
  );
  return str === "1";
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
  const secs = String(Math.round(seconds % 60)).padStart(2, "0");
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

export class Emitter {
  _cbs: { [event: string]: Array<() => void> } = {};
  on(event: string, cb: () => void) {
    if (this._cbs[event] == null) {
      this._cbs[event] = [];
    }
    this._cbs[event].push(cb);
    return () => {
      this._cbs[event] = this._cbs[event].filter((c) => c !== cb);
    };
  }
  trigger(event: string) {
    const subscriptions = this._cbs[event];
    if (subscriptions == null) {
      return;
    }
    for (const cb of subscriptions) {
      cb();
    }
  }
}
