// This module is imported early here in order to avoid a circular dependency.
import { classResolver } from "./skin/resolver";
import { loadSkin } from "./skin/skinLoader";
import UI_ROOT from "./UIRoot";

function hack() {
  // Without this Snowpack will try to treeshake out resolver causing a circular
  // dependency.
  classResolver("A funny joke about why this is needed.");
}

interface Options {
  /**
   * initial skin
   * Example: `skin: "assets/WinampModern566.wal",`
   */
  skin?: string;

  /**
   * initial music tracks
   * Example: `tracks: ["/assets/song1.mp3", "https://example.com/song2.mp3"]
   */
  tracks?: string[];
}

const DEFAULT_OPTIONS: Options = {
  skin: "assets/WinampModern566.wal",
  tracks: []
};

export class Webamp {
  _options: Options;
  _container: HTMLElement;

  constructor(container: HTMLElement, options: Options = {}) {
    this._container = container || document.body;
    this._options = { ...DEFAULT_OPTIONS, ...options };
    this.switchSkin(this._options.skin);
    for(const song of this._options.tracks){
      UI_ROOT.playlist.enqueuefile(song);
    }
  }

  async switchSkin(skinPath: string) {
    await loadSkin(this._container, skinPath);
  }

  playSong(songurl: string /* or track */) {
    
  }
}
