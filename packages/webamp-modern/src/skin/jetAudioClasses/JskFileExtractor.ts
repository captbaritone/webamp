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

export default class JskFileExtractor extends FileExtractor {
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
    console.log("JetAudio!:", info);
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
    const blob = new Blob([part]);
    return blob;
  }

  buildTOC() {
    const block = this._arr;
    const fileSize = block.length;
    //? find first .bmp
    this.seek(0x400); //? Root Entry
    while (true) {
      const i = this._i;
      let n = this.read();
      if (n == 0x2e) {
        if (
          block[i + 1] == 0x62 &&
          block[i + 2] == 0x6d &&
          block[i + 3] == 0x70
        ) {
          break;
        }
      }
      if (i >= fileSize) return;
    }
    let i = this._i; // i= @.bmp
    while (i > 0 && block[i - 1] >= 32) {
      i--;
    }
    const firstBmp = i - 8; // i= @default/path-to/az.bmp
    console.log("firstBmp:", firstBmp.toString(16));

    // return;
    //? fill chunks with names
    // let prevWritten = 0;
    // let prevAddress = 0;
    // let prevSize = 0;
    let first = true;
    this.seek(firstBmp);
    while (this.tell() < fileSize) {
      const at = this.tell();
      const written = this.readInt32LE();
      const size = this.readInt32LE();
      if (size == 0) {
        break;
      }
      const fileName = this.readString(0x100);
      const start = first ? at + written - 4 : 0;
      // prevWritten = written;
      // prevAddress = address;
      // prevSize = size;

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

    //?assure address
    const chunks = Object.values(this._toc);
    this.seek(chunks[0].start);
    for (const chunk of chunks) {
      while (true) {
        const i = this._i;
        let n = this.read();
        if (
          n == 0x42 &&
          this.read() == 0x4d &&
          this.readInt32LE(false) == chunk.size
        ) {
          // BM
          chunk.start = i;
          chunk.saddress2 = i.toString(16);
          this.seek(chunk.size - 8, true);
          break;
        }
        if (this.tell() >= fileSize) break;
      }
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
