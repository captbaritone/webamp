import JSZip from "jszip";
import { getCaseInsensitiveFile } from "../utils";

// https://png-pixel.com/
const DEFAULT_IMAGE_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==";

export default class ImageManager {
  _urlCache: Map<string, string> = new Map();
  _imgCache: Map<string, HTMLImageElement> = new Map();
  _cssVarCache: Map<string, string> = new Map();
  constructor(private _zip: JSZip) {}

  async getUrl(filePath: string): Promise<string | null> {
    if (!this._urlCache.has(filePath)) {
      const zipFile = getCaseInsensitiveFile(this._zip, filePath);
      if (zipFile == null) {
        return null;
      }
      const imgBlob = await zipFile.async("blob");
      const imgUrl = await getUrlFromBlob(imgBlob);
      // const img = await this.getImage(imgUrl);
      // const transformedUrl = transformImage(img);
      this._urlCache.set(filePath, imgUrl);
    }
    return this._urlCache.get(filePath);
  }

  async getImage(filePath: string): Promise<HTMLImageElement | null> {
    if (!this._imgCache.has(filePath)) {
      // TODO: We could cache this
      const url = (await this.getUrl(filePath)) ?? DEFAULT_IMAGE_URL;
      const img = await loadImage(url);
      this._imgCache.set(filePath, img);
    }
    return this._imgCache.get(filePath);
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
