import fs from "fs";
import _temp from "temp";
import fetch from "node-fetch";
import util from "util";
import child_process from "child_process";
import path from "path";

export const exec = util.promisify(child_process.exec);

const temp = _temp.track();

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function truncate(str: string, len: number): string {
  const overflow = str.length - len;
  if (overflow < 0) {
    return str;
  }

  const half = Math.floor((len - 1) / 2);

  const start = str.slice(0, half);
  const end = str.slice(-half);
  return `${start} ########### ${end}`;
}

export function chunk<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

export function flatten<T>(matrix: T[][]): T[] {
  const flat: T[] = [];
  matrix.forEach((arr) => {
    flat.push(...arr);
  });
  return flat;
}

export const MD5_REGEX = /([a-fA-F0-9]{32})/;
export const TWEET_SNOWFLAKE_REGEX = /([0-9]{19})/;

export function throwAfter(message, ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}

export async function withUrlAsTempFile<T>(
  url: string,
  filename: string,
  cb: (file: string) => Promise<T>
): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}.`);
  }
  const result = await response.buffer();
  return withBufferAsTempFile(result, filename, cb);
}

export async function withBufferAsTempFile<T>(
  buffer: Buffer,
  filename: string,
  cb: (file: string) => Promise<T>
): Promise<T> {
  const tempDir = temp.mkdirSync();
  const tempFile = path.join(tempDir, filename);
  fs.writeFileSync(tempFile, buffer);
  const r = await cb(tempFile);
  fs.unlinkSync(tempFile);
  fs.rmdirSync(tempDir);
  return r;
}
