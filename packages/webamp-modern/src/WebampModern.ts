// This module is imported early here in order to avoid a circular dependency.
import { classResolver } from "./skin/resolver";
import { loadSkin } from "./skin/skinLoader";
import UI_ROOT from "./UIRoot";
import { IWebampModern, Options, WebAmpModern } from "./WebampModernInteface";

function hack() {
  // Without this Snowpack will try to treeshake out resolver causing a circular
  // dependency.
  classResolver("A funny joke about why this is needed.");
}

const DEFAULT_OPTIONS: Options = {
  skin: "assets/WinampModern566.wal",
  tracks: [],
};

export class Webamp5 extends WebAmpModern {
  _options: Options;
  _container: HTMLElement;

  constructor(container: HTMLElement, options: Options = {}) {
    super(container, options);
    this._container = container || document.body;
    this._options = { ...DEFAULT_OPTIONS, ...options };
    this.switchSkin(this._options.skin);
    for (const song of this._options.tracks) {
      UI_ROOT.playlist.enqueuefile(song);
    }
  }

  switchSkin(skinPath: string): void {
    loadSkin(this._container, skinPath);
  }

  playSong(songurl: string /* or track */): void {}

  onLogMessage(callback: (message: string) => void) {
    UI_ROOT.on("onlogmessage", callback);
  }
}

declare global {
  interface Window {
    WebampModern: typeof WebAmpModern;
  }
}

// just copied from webamp classic
async function main() {
  window.WebampModern = Webamp5;
}
main();
