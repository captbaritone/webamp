import ImageManager from "../ImageManager";

export class ImageManagerKjofol extends ImageManager {
  // arr: Uint8Array; // borrowed from MakiFile
  // i: number;

  async getBlob(filePath: string): Promise<Blob> {
    // kjofol need special thread to remove gAMA,CHRM
    // (Gamma chunk & Chroma chunk of PNG file)

    if (!filePath.toLowerCase().endsWith(".png")) {
      return await super.getBlob(filePath);
    }

    const blobPart = [];
    const rawData: ArrayBuffer = await this._uiRoot.getFileAsBytes(filePath);
    const arr = new Uint8Array(rawData); // 8bit array
    let i = 0;

    const readInt32BE = (): number => {
      const offset = i >>> 0;
      i += 4;

      return (
        arr[offset + 3] |
        (arr[offset + 2] << 8) |
        (arr[offset + 1] << 16) |
        (arr[offset + 0] << 24)
      );
    };

    const chr = String.fromCharCode;
    const readChunk = (): string => {
      const offset = i >>> 0;
      i += 4;

      return (
        chr(arr[offset + 0]) +
        chr(arr[offset + 1]) +
        chr(arr[offset + 2]) +
        chr(arr[offset + 3])
      );
    };

    //========= REAL SCANNING ============
    const allowedChunks = ["IHDR", "IDAT", "IEND", "PLTE"];
    let start = 0;
    i = 8; // png signature
    blobPart.push(arr.slice(start, i));
    while (i < arr.length) {
      start = i;
      const data_size = readInt32BE();
      const chunk_sign = readChunk();
      i += data_size; // content of data
      i += 4; // content of CRC32

      if (allowedChunks.includes(chunk_sign)) {
        blobPart.push(arr.slice(start, i));
      }
    }

    const blob = new Blob(blobPart);
    return blob;
  }
}
