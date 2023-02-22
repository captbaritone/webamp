import { FileExtractor } from "../FileExtractor";
import { navitem } from "./navitem";

type Chunk = {
  start: number;
  end: number;
  size: number;
};

export default class SgfFileExtractor extends FileExtractor {
  _arr: Uint8Array;
  _i: number;
  _toc: { [key: string]: Chunk } = {}; // table of content

  // ======================== API ========================
  async prepare(skinPath: string, response: Response) {
    const buffer = await response.arrayBuffer();
    this._arr = new Uint8Array(buffer);
    this.buildTOC();
    console.log("Sonique!:", Object.keys(this._toc));
  }

  async getFileAsString(filePath: string): Promise<string> {
    const blob = await this.getFileAsBlob(filePath);
    if (!blob) return null;
    return new Promise((resolve, reject) => {
      var reader = new FileReader();

      reader.onload = function () {
        resolve(reader.result as string);
      };
      reader.onerror = function (e) {
        reject(e);
      };

      reader.readAsBinaryString(blob);

      // const img = new Image();
      // img.addEventListener("load", () => {
      //   resolve(img);
      // });
      // img.addEventListener("error", (e) => {
      //   reject(e);
      // });
      // img.src = imgUrl;
    });
  }

  async getFileAsBytes(filePath: string): Promise<ArrayBuffer> {
    const blob = await this.getFileAsBlob(filePath);
    if (!blob) return null;
    return await blob.arrayBuffer();
    // return new Promise((resolve, reject) => {
    //   var reader = new FileReader();

    //   reader.onload = function () {
    //     resolve(reader.result as ArrayBuffer);
    //   };
    //   reader.onerror = function (e) {
    //     reject(e);
    //   };

    //   reader.readAsBinaryString(blob);
    // });
  }

  async getFileAsBlob(filePath: string): Promise<Blob> {
    console.log("getting ", filePath);
    if (filePath == "/png/navitem") {
      return navitem();
    }
    const chunk = this._toc[filePath];
    if (!chunk) return null;
    const part = this._arr.slice(chunk.start, chunk.end);
    const blob = new Blob([part]);
    return blob;
  }

  buildTOC() {
    this.seek(0x0c);
    const dataAddress = this.readInt32LE();
    this.seek(16 * 6, true); // I don't know why empty space
    while (this.tell() < dataAddress) {
      // s, = unpack('%ss' % (16*5), this.read(16*5))
      const fileName = this.readString(16 * 5);
      // s = s.decode('utf-8').strip('\x00')

      this.seek(4, true);
      const chunkStart = this.readInt32LE();
      const chunkSize = this.readInt32LE();

      this._toc[fileName] = {
        start: chunkStart,
        size: chunkSize,
        end: chunkStart + chunkSize,
      };
      this.seek(8, true); // I don't know why empty space
    }
  }

  //? simulate python seek
  seek(n: number, relative: boolean = false) {
    if (relative) {
      this._i += n;
    } else {
      this._i = n;
    }
  }

  //? simulate python tell
  tell(): number {
    return this._i;
  }

  readInt32LE(): number {
    const offset = this._i >>> 0;
    this._i += 4;

    return (
      this._arr[offset] |
      (this._arr[offset + 1] << 8) |
      (this._arr[offset + 2] << 16) |
      (this._arr[offset + 3] << 24)
    );
  }

  readString(length: number): string {
    let ret = "";
    const end = Math.min(this._arr.length, this._i + length);

    for (let i = this._i; i < end; ++i) {
      const byte = this._arr[i];
      if (byte != 0) {
        ret += String.fromCharCode(byte);
      }
    }
    this._i += length;
    return ret;
  }
}
