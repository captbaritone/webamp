import AUDIO_PLAYER from "../AudioPlayer";
import Layer from "./Layer";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3CAlbumArt.2F.3E
export default class AlbumArt extends Layer {
  static GUID = "6dcb05e448c28ac4f04993b14af50e91";

  constructor() {
    super();
    this._width = 0;
    this._height = 0;
    this._relatw = "1";
    this._relath = "1";
  }

  draw() {
    super.draw();
    this.refresh();
  }

  refresh() {
    const albumArtUrl = AUDIO_PLAYER._albumArtUrl;
    if (albumArtUrl != null) {
      this._div.style.pointerEvents = "all";
      this._div.style.backgroundImage = `url(${albumArtUrl})`;
      this._div.style.backgroundSize = "cover";
    } else {
      this._div.style.removeProperty("background-image");
    }
  }

  isloading(): number {
    return 1;
  }

  onAlbumArtLoaded(success: boolean) {
    return true; //TODO
  }

  isinvalid(): boolean {
    return false;
  }
}
