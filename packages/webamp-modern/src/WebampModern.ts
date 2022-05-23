// This module is imported early here in order to avoid a circular dependency.
import JSZip from "jszip";
import { classResolver } from "./skin/resolver";
import {
  getSkinEngineClass,
  getSkinEngineClassByContent,
  SkinEngine,
} from "./skin/SkinEngine";
import { UIRoot } from "./UIRoot";
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

let DIV_UNIQUER = 0; // for CSS unique, avoid interferer with other webamp instance

export class Webamp5 extends WebAmpModern {
  _options: Options;
  _parent: HTMLElement;
  _uiRoot: UIRoot;

  constructor(parent: HTMLElement, options: Options = {}) {
    super(parent, options);
    this._parent = parent || document.body;
    this._options = { ...DEFAULT_OPTIONS, ...options };
    DIV_UNIQUER++;
    this._uiRoot = new UIRoot(`ui-root-${DIV_UNIQUER}`);
    parent.appendChild(this._uiRoot.getRootDiv());
    this.switchSkin(this._options.skin);
    for (const song of this._options.tracks) {
      this._uiRoot.playlist.enqueuefile(song);
    }
  }

  async switchSkin(skinPath: string) {
    //* getting skin engine is complicated:
    //* SkinEngine is not yet instanciated during looking for a skinEngine.
    //* If file extension is know then we loop for registered Engines
    //* But sometime (if its a `.zip` or a path `/`), we need to detect by
    //* if a file exist, with a name is expected by skinEngine

    this._uiRoot.reset()
    this._parent.appendChild(this._uiRoot.getRootDiv());

    let skinFetched = false;
    let SkinEngineClass = getSkinEngineClass(skinPath);
    if (SkinEngineClass == null) {
      await this._loadSkinPathToUiroot(skinPath, this._uiRoot);
      skinFetched = true;
      SkinEngineClass = await getSkinEngineClassByContent(skinPath, this._uiRoot);
    }
    if (SkinEngineClass == null) {
      throw new Error(`Skin not supported`);
    }

    //? success found a skin-engine
    this._uiRoot.SkinEngineClass = SkinEngineClass;
    if (!skinFetched) await this._loadSkinPathToUiroot(skinPath, this._uiRoot);
    const parser: SkinEngine = new SkinEngineClass(this._uiRoot);
    // await parser.parseSkin();
    await parser.buildUI();

    // loadSkin(this._parent, skinPath);
  }

  private async _loadSkinPathToUiroot(skinPath: string, uiRoot: UIRoot) {
    const response = await fetch(skinPath);
    if (response.status == 404) {
      throw new Error(`Skin does not exist`);
    }
    if (response.headers.get("content-type") == "application/octet-stream") {
      // const response = await fetch(skinPath);
      const skinZipBlob = await response.blob();

      const zip = await JSZip.loadAsync(skinZipBlob);
      uiRoot.setZip(zip);
    } else {
      uiRoot.setZip(null);
      const slash = skinPath.endsWith("/") ? "" : "/";
      uiRoot.setSkinDir(skinPath + slash);
    }
  }

  playSong(songurl: string /* or track */): void {}

  onLogMessage(callback: (message: string) => void) {
    this._uiRoot.on("onlogmessage", callback);
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
