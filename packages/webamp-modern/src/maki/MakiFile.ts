// Holds a buffer and a pointer. Consumers can consume bytesoff the end of the
// file. When we want to run in the browser, we can refactor this class to use a
// typed array: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays
export default class MakiFile {
  _arr: Uint8Array;
  _i: number;
  constructor(data: ArrayBuffer) {
    this._arr = new Uint8Array(data);
    this._i = 0;
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

  readUInt32LE(): number {
    const int = this.peekUInt32LE();
    this._i += 4;
    return int;
  }

  peekUInt32LE(): number {
    const offset = this._i >>> 0;

    return (
      (this._arr[offset] |
        (this._arr[offset + 1] << 8) |
        (this._arr[offset + 2] << 16)) +
      this._arr[offset + 3] * 0x1000000
    );
  }

  readUInt16LE(): number {
    const offset = this._i >>> 0;
    this._i += 2;
    return this._arr[offset] | (this._arr[offset + 1] << 8);
  }

  readUInt8(): number {
    const int = this._arr[this._i];
    this._i++;
    return int;
  }

  readStringOfLength(length: number): string {
    let ret = "";
    const end = Math.min(this._arr.length, this._i + length);

    for (let i = this._i; i < end; ++i) {
      ret += String.fromCharCode(this._arr[i]);
    }
    this._i += length;
    return ret;
  }

  readString(): string {
    return this.readStringOfLength(this.readUInt16LE());
  }

  getPosition(): number {
    return this._i;
  }
}
