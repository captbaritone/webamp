import SkinParser from "./parse";
import { registerSkinEngine, SkinEngine } from "./SkinEngine";

export class SkinEngineWAL extends SkinEngine {
  static canProcess = (filePath: string): boolean => {
    return filePath.endsWith(".wal");
  };

  static identifyByFile = (filePath: string): string => {
    return "skin.xml";
  };

  static priority: number = 1;

  /**
   * The main method
   */
  async parseSkin() {
    //temporary, use old code
    //TODO: integrate parse.ts with this class
    this._uiRoot.logMessage("Parsing XML and initializing images...");
    const parser = new SkinParser(this._uiRoot);

    // This is always the same as the global singleton.
    const uiRoot = await parser.parse();

    uiRoot.loadTrueTypeFonts();

    const start = performance.now();
    uiRoot.enableDefaultGammaSet();
    const end = performance.now();
    console.log(`Loading initial gamma took: ${(end - start) / 1000}s`);

    this._uiRoot.logMessage("Rendering skin for the first time...");
    uiRoot.draw();
    uiRoot.init();

    this._uiRoot.logMessage("Initializing Maki...");
    for (const container of uiRoot.getContainers()) {
      container.init();
    }
    this._uiRoot.logMessage("");
  }
}

registerSkinEngine(SkinEngineWAL);
