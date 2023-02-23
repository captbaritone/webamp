import ImageManager from "../ImageManager";

export class WmzImageManager extends ImageManager {
  //

  async getBlob(filePath: string): Promise<Blob> {
    // WinampClassic is loading resources from 2 source:
    // from .wmz and from /assets/winamp_classic/ path.
    // hence we need to assure that we load bitmap from zip
    return await this._uiRoot.getFileAsBlobZip(filePath);
  }
}
