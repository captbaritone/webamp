// This module is imported early here in order to avoid a circular dependency.
import JSZip from "jszip";
import {
  FileExtractor,
  PathFileExtractor,
  ZipFileExtractor,
} from "./skin/FileExtractor";
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

    this._uiRoot.reset();
    this._parent.appendChild(this._uiRoot.getRootDiv());

    let skinFetched = false;
    let SkinEngineClass = null;

    //? usually the file extension is explicitly for SkinEngine. eg: `.wal`
    let SkinEngineClasses = await getSkinEngineClass(skinPath);

    //? when file extension is ambiguous eg. `.zip`, several
    //? skinEngines are supporting, but only one is actually working with.
    //? lets detect:
    if (SkinEngineClasses.length > 1) {
      await this._loadSkinPathToUiroot(skinPath, this._uiRoot, null);
      skinFetched = true;
      SkinEngineClass = await getSkinEngineClassByContent(
        SkinEngineClasses,
        skinPath,
        this._uiRoot
      );
    } else {
      SkinEngineClass = SkinEngineClasses[0];
    }
    if (SkinEngineClass == null) {
      throw new Error(`Skin not supported`);
    }

    //? success found a skin-engine
    this._uiRoot.SkinEngineClass = SkinEngineClass;
    const parser: SkinEngine = new SkinEngineClass(this._uiRoot);
    if (!skinFetched)
      await this._loadSkinPathToUiroot(skinPath, this._uiRoot, parser);
    // await parser.parseSkin();
    await parser.buildUI();

    // loadSkin(this._parent, skinPath);
  }

  /**
   * Time to load the skin file
   * @param skinPath url string
   * @param uiRoot
   * @param skinEngine An instance of SkinEngine
   */
  private async _loadSkinPathToUiroot(
    skinPath: string,
    uiRoot: UIRoot,
    skinEngine: SkinEngine
  ) {
    let response: Response;
    let fileExtractor: FileExtractor;
    //? pick one of correct fileExtractor

    if (skinPath.endsWith("/")) {
      fileExtractor = new PathFileExtractor();
    } else {
      response = await fetch(skinPath);
      if (response.status == 404) {
        throw new Error(`Skin does not exist`);
      }
      if (skinEngine != null) {
        fileExtractor = skinEngine.getFileExtractor();
      }
    }
    if (fileExtractor == null) {
      if (response.headers.get("content-type").startsWith("application/")) {
        fileExtractor = new ZipFileExtractor();
      } else {
        fileExtractor = new PathFileExtractor();
      }
    }

    await fileExtractor.prepare(skinPath, response);
    // const skinZipBlob = await response.blob();

    //   const zip = await JSZip.loadAsync(skinZipBlob);
    //   uiRoot.setZip(zip);
    // } else {
    //   uiRoot.setZip(null);
    //   const slash = skinPath.endsWith("/") ? "" : "/";
    //   uiRoot.setSkinDir(skinPath + slash);
    // }
    uiRoot.setFileExtractor(fileExtractor);
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
