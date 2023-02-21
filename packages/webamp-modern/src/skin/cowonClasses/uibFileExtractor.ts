import { FileExtractor } from "../FileExtractor";

type Chunk = {
  fileName?: string;
  // written: number;
  size: number;
  start?: number;
  // end?: number;
  at?: number; // chunk address location
  // address?: number;
  // saddress?: string; // in hex to crosscheck
  saddress2?: string; // in hex to crosscheck
};

export default class UibFileExtractor extends FileExtractor {
  _arr: Uint8Array;
  _i: number;
  _toc: { [key: string]: Chunk } = {}; // table of content

  // ======================== API ========================
  async prepare(skinPath: string, response: Response) {
    const buffer = await response.arrayBuffer();
    this._arr = new Uint8Array(buffer);
    this.buildTOC();
    // const info = Object.values(this._toc).map((toc) => [
    //   toc.at.toString(16),
    //   toc.fileName,
    // ]);
    const info = Object.values(this._toc);
    console.log("Cowon-JetAudio!:", info);
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
    const chunk = this._toc[filePath];
    if (!chunk) return null;
    const part = this._arr.slice(chunk.start, chunk.size + chunk.start - 1);
    const magic = "BM"; // [0x42,0x4d]
    const fileSize = Uint32Array.from([chunk.size + 0x0e, 0, 0x0436]);
    const blob = new Blob([magic, fileSize, part], { type: "image/bmp" });
    return blob;
  }

  buildTOC() {
    const block = this._arr;
    const fileSize = block.length;
    //? read config;
    // skip for now

    //? read bitmap locations
    this.seek(0x454); //seem as permanent address
    this.readInt32LE(); //posibly the UIB version

    while (this.tell() < fileSize) {
      const at = this.tell();
      const start = this.readInt32LE();
      const size = this.readInt32LE();
      if (size == 0) {
        break;
      }
      const fileName = at.toString(16);

      this._toc[fileName] = {
        at,
        fileName,
        size,
        // end: chunkStart + chunkSize,
        // address,
        start,
        // saddress: address.toString(16),
      };
      // this.seek(8, true); // I don't know why empty space
    }

    //?detect jsc====================
    let start = 0;
    while (this._i < fileSize && this.read() != 0x3c) {
      /* "<" */
    }
    start = this.tell() - 1;
    while (this._i < fileSize && this.readInt32LE() != 0) {
      this._i += 16 * 8;
    }
    const size = this.tell() - start;
    const fileName = "main.jsc";
    this._toc[fileName] = {
      // at,
      fileName,
      // written,
      size,
      // end: chunkStart + chunkSize,
      // address,
      start,
      // saddress: address.toString(16),
    };
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

  read(): number {
    return this._arr[this._i++];
  }
  reads(length: number): number[] {
    const result = [];
    for (var i = 0; i < length; i++) {
      result.push(this._arr[this._i]);
      this._i++;
    }
    return result;
  }

  readInt32LE(increment: boolean = true): number {
    const offset = this._i >>> 0;
    if (increment) {
      this._i += 4;
    }

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
      } else {
        break;
      }
    }
    this._i += length;
    return ret;
  }
}
