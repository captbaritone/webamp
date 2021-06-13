import JSZip, { JSZipObject } from "jszip";

export function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

export function getCaseInsensitiveFile(
  zip: JSZip,
  filePath: string
): JSZipObject | null {
  return zip.file(new RegExp(filePath, "i"))[0] ?? null;
}

export function num(str: string | void): number | null {
  return str == null ? null : Number(str);
}

export function px(size: number): string {
  return `${size}px`;
}

export function toBool(str: string) {
  assert(str === "0" || str === "1", 'Expected bool value to be "0" or "1".');
  return str === "1";
}
