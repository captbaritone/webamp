import { UIRoot } from "../UIRoot";
import { getCaseInsensitiveFile } from "../utils";
import Bitmap from "./Bitmap";
import BitmapFont from "./BitmapFont";

// https://png-pixel.com/
const DEFAULT_IMAGE_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==";

export default class ImageManager {
  _uiRoot: UIRoot;
  _imagePlaceholder: boolean = false; // fallback to DEFAULT_IMAGE if file inaccessible?
  // _imagePlaceholder: boolean = true; // fallback to DEFAULT_IMAGE if file inaccessible?
  // _urlCache: Map<string, string> = new Map();
  _urlCache: { [key: string]: string } = {};
  // _imgCache: Map<string, HTMLImageElement> = new Map();
  _imgCache: { [key: string]: HTMLImageElement } = {};
  //_pathofBitmap = {}; //? file : true|false|null
  //_bitmaps: { [key: string]: Bitmap } = {}; //? Bitmap:file
  // _bitmapAlias = {}; //? file|id : true|false|null //for BitmapFont

  constructor(uiRoot: UIRoot) {
    this._uiRoot = uiRoot;
  }
  /**
   * cleanup resources
   */
  dispose() {}

  async getUrl(filePath: string): Promise<string | null> {
    if (!this._urlCache.hasOwnProperty(filePath)) {
      // const imgBlob = await this._uiRoot.getFileAsBlob(filePath);
      const imgBlob = await this.getBlob(filePath);
      if (imgBlob == null) {
        this._urlCache[filePath] = null;
        return null;
      }
      const imgUrl = await getUrlFromBlob(imgBlob);
      this._urlCache[filePath] = imgUrl;
    }
    return this._urlCache[filePath];
  }

  getCachedUrl(filePath: string): string {
    return this._urlCache[filePath];
  }

  async getBlob(filePath: string): Promise<Blob> {
    // kjofol need special thread to remove gAMA,CHRM
    // (Gamma & Chroma png chunk)
    // it maybe changed by ancestor
    return await this._uiRoot.getFileAsBlob(filePath);
  }

  /*isFilePathAdded(filePath: string) {
    return Object.keys(this._pathofBitmap).includes(filePath);
  }*/

  // Ensure we've loaded the image into our image loader.
  async loadUniquePaths(): Promise<Bitmap[]> {
    const bitmaps: Bitmap[] = [];

    //? Collect unique filepath
    const filesPath: string[] = [];
    for (const bitmap of Object.values(this._uiRoot.getBitmaps())) {
      //? ignore bitmap that already has _img
      if (!bitmap.loaded()) {
        if (!filesPath.includes(bitmap.getFile())) {
          filesPath.push(bitmap.getFile());
          bitmaps.push(bitmap);
        }
      }
    }
    //? union with font
    const fonts = this._uiRoot.getFonts();
    for (let i = fonts.length - 1; i >= 0; i--) {
      const font = fonts[i];
      //? ignore bitmap that already has _img
      if (
        font instanceof BitmapFont &&
        !font.useExternalBitmap() &&
        !font.getImg()
      ) {
        if (!filesPath.includes(font.getFile())) {
          filesPath.push(font.getFile());
          bitmaps.push(font);
        }
      }
    }

    await Promise.all(
      filesPath.map(async (filePath) => {
        return await this.getImage(filePath);
      })
    );
    return bitmaps;
  }

  async ensureBitmapsLoaded() {
    const bitmaps = await this.loadUniquePaths();

    return await Promise.all(
      bitmaps.map(async (bitmap) => {
        // console.log("IM.ensure:", bitmap.getId());
        // await this.setBimapImg(bitmap);
        // bitmap._img = await this.getImage(bitmap.getFile());
        // if (bitmap._img && bitmap._w == null && bitmap._h == null) {
        //   bitmap.setXmlAttr("w", String(bitmap._img.width));
        //   bitmap.setXmlAttr("h", String(bitmap._img.height));
        // }
        return bitmap.ensureImageLoaded(this);
      })
    );
  }

  /**
   *
   * @param filePath URI or caseInsensitive file name in zip
   * @param allowReturnNull if set to false and filePath is not
   * accessible then return defaultImage which is 1x1 transparent pixel
   * @returns <img> HtmlImageElement
   */
  async getImage(filePath: string): Promise<HTMLImageElement | null> {
    if (!this._imgCache.hasOwnProperty(filePath)) {
      // TODO: We could cache this
      const url = await this.getUrl(filePath);
      if (url != null) {
        const img = await loadImage(url);
        this._imgCache[filePath] = img;
      } else if (this._imagePlaceholder) {
        const img = await loadImage(DEFAULT_IMAGE_URL);
        this._imgCache[filePath] = img;
      } else {
        // const img = await loadImage(url);
        // this._imgCache[filePath] = img;
        this._imgCache[filePath] = null;
      }
    }
    return this._imgCache[filePath];
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

export async function loadImage(imgUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => {
      resolve(img);
    });
    img.addEventListener("error", (e) => {
      console.warn('cant load empty image:', imgUrl)
      reject(e);
    });
    img.src = imgUrl;
  });
}
