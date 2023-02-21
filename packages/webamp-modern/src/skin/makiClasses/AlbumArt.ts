import { UIRoot } from "../../UIRoot";
import AUDIO_PLAYER, { Track } from "../AudioPlayer";
import Layer from "./Layer";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3CAlbumArt.2F.3E
export default class AlbumArt extends Layer {
  static GUID = "6dcb05e448c28ac4f04993b14af50e91";
  _trackId: number = -1; // for loading image
  _hasPicture: boolean = false;

  constructor(uiRoot: UIRoot) {
    super(uiRoot);
    this._w = 0;
    this._h = 0;
    this._relatw = "1";
    this._relath = "1";
  }

  init(): void {
    super.init();

    this._uiRoot.playlist.on("trackchange", this._trackChanged);
  }

  _trackChanged = () => {
    let track: Track;
    if ((track = this._uiRoot.playlist.currentTrack())) {
      if (
        this._trackId != track.id ||
        (!this._hasPicture && track.metadata && track.metadata.image)
      ) {
        this._trackId = track.id;

        if (track.metadata && track.metadata.image) {
          const image = track.metadata.image;
          this._hasPicture = image != null;

          const albumArtUrl = URL.createObjectURL(
            new Blob([image.data as Uint8Array], { type: image.mime } /* (1) */)
          );
          this._div.style.backgroundImage = `url(${albumArtUrl})`;
        } else {
          this._hasPicture = false;
          this._div.style.removeProperty("background-image");
        }
      }
    }
  };

  draw() {
    super.draw();
    // this.refresh();
  }

  refresh() {
    const albumArtUrl = this._uiRoot.audio._albumArtUrl;
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
    return !this._hasPicture;
  }
}
