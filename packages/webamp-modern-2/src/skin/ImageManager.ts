import JSZip from "jszip";
import { getCaseInsensitiveFile } from "../utils";

export default class ImageManager {
  _urlCache: Map<string, string>;
  _sizeCache: Map<string, { width: number; height: number }>;
  constructor(private _zip: JSZip) {
    this._urlCache = new Map();
    this._sizeCache = new Map();
  }

  async getUrl(filePath: string): Promise<string> {
    if (!this._urlCache.has(filePath)) {
      const zipFile = getCaseInsensitiveFile(this._zip, filePath);
      const imgBlob = await zipFile.async("blob");
      const imgUrl = await getUrlFromBlob(imgBlob);
      this._urlCache.set(filePath, imgUrl);
    }
    return this._urlCache.get(filePath);
  }

  async getSize(url: string): Promise<{ width: number; height: number }> {
    if (!this._sizeCache.has(url)) {
      const size = await getImageSize(url);
      this._sizeCache.set(url, size);
    }
    return this._sizeCache.get(url);
  }
}

// This is intentionally async since we may want to sub it out for an async
// function in a node environment
async function getUrlFromBlob(blob: Blob): Promise<string> {
  // We initiallay used `URL.createObjectURL(blob)` here, but it had an issue
  // where, when used as a background imaged, they would take more than one
  // frame to load resulting in a white flash when switching background iamges.
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      // @ts-ignore This API is not very type-friendly.
      resolve(e.target.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function loadImage(
  imgUrl: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => {
      resolve(img);
    });
    img.addEventListener("error", (e) => {
      reject(e);
    });
    img.src = imgUrl;
  });
}

async function getImageSize(
  imgUrl: string
): Promise<{ width: number; height: number }> {
  const { width, height } = await loadImage(imgUrl);
  return { width, height };
}
