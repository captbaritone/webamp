import JSZip from "jszip";
import { getCaseInsensitiveFile } from "../utils";

export default class ImageManager {
  _urlCache: Map<string, string>;
  _imgCache: Map<string, HTMLImageElement>;
  _sizeCache: Map<string, { width: number; height: number }>;
  constructor(private _zip: JSZip) {
    this._urlCache = new Map();
    this._sizeCache = new Map();
    this._imgCache = new Map();
  }

  async getUrl(filePath: string): Promise<string | null> {
    if (!this._urlCache.has(filePath)) {
      const zipFile = getCaseInsensitiveFile(this._zip, filePath);
      if (zipFile == null) {
        return null;
      }
      const imgBlob = await zipFile.async("blob");
      const imgUrl = await getUrlFromBlob(imgBlob);
      this._urlCache.set(filePath, imgUrl);
    }
    return this._urlCache.get(filePath);
  }

  async getSize(url: string): Promise<{ width: number; height: number }> {
    if (!this._sizeCache.has(url)) {
      const size = await this.getImage(url);
      this._sizeCache.set(url, size);
    }
    return this._sizeCache.get(url);
  }

  async getImage(url: string): Promise<HTMLImageElement> {
    if (!this._imgCache.has(url)) {
      // TODO: We could cache this
      const img = await loadImage(url);
      this._imgCache.set(url, img);
    }
    return this._imgCache.get(url);
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

async function loadImage(imgUrl: string): Promise<HTMLImageElement> {
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
