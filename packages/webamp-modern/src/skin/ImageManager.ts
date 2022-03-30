import UI_ROOT from "../UIRoot";
import { getCaseInsensitiveFile } from "../utils";
import Bitmap from "./Bitmap";

// https://png-pixel.com/
const DEFAULT_IMAGE_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==";

export default class ImageManager {
  _urlCache: Map<string, string> = new Map();
  _imgCache: Map<string, HTMLImageElement> = new Map();
  _pathofBitmap = {}; //? file : true|false|null
  _bitmaps: { [key: string]: Bitmap } = {}; //? Bitmap:file
  _bitmapAlias = {}; //? file|id : true|false|null //for BitmapFont

  async getUrl(filePath: string): Promise<string | null> {
    if (!this._urlCache.has(filePath)) {
      const imgBlob = await UI_ROOT.getFileAsBlob(filePath);
      if (imgBlob == null) {
        return null;
      }
      const imgUrl = await getUrlFromBlob(imgBlob);
      this._urlCache.set(filePath, imgUrl);
    }
    return this._urlCache.get(filePath);
  }

  getCachedUrl(filePath: string): string {
    return this._urlCache.get(filePath);
  }

  addBitmap(bitmap: Bitmap) {
    const id = bitmap.getId();
    const filePath = bitmap.getFile();
    this._pathofBitmap[filePath] = false;
    this._bitmaps[id] = bitmap;
  }

  // Ensure we've loaded the image into our image loader.
  async loadUniquePaths() {
    for (const filePath of Object.keys(this._pathofBitmap)) {
      await this.getImage(filePath);
    }
  }
  async ensureBitmapsLoaded() {
    return Promise.all(
      Object.values(this._bitmaps).map(async (bitmap) => {
        await this.setBimapImg(bitmap);
        if (bitmap._img && bitmap._width == null && bitmap._height == null) {
          bitmap.setXmlAttr("w", String(bitmap._img.width));
          bitmap.setXmlAttr("h", String(bitmap._img.height));
        }
      })
    );
  }

  async setBimapImg(bitmap: Bitmap) {
    bitmap._img = await this.getImage(bitmap.getFile());
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
