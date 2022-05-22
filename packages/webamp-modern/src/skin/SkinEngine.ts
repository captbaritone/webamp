import { UIRoot } from "../UIRoot";

/**
 * In the world that multiple MP3 player are loaded in webpage,
 * we support multiple skin-formats
 */
export class SkinEngine {
  /**
   * Useful for quick detect by file extension
   * @param filePath full file address or URL
   * @returns True if this skin engine can parse the skin
   */
  static canProcess = (filePath: string): boolean => {
    return false;
  };

  /**
   * In case the skin can't be detected by file extension,
   * let detect by whether one file name is found
   * @param filePath file name url
   * @returns file name or file extension
   */
  static identifyByFile = (filePath: string): string => {
    return "skin.xml";
  };

  /**
   * Expected ordered index of skinEngine to avoid missleading,
   * In case of several skinEngines support same skin file
   */
  static priority: number = 100;
}

type SkinEngineClass = typeof SkinEngine;
const SKIN_ENGINES: SkinEngineClass[] = [];

export const registerSkinEngine = (Engine: SkinEngineClass) => {
  // if(SKIN_ENGINES.includes(Engine)){
  //   delete SKIN_ENGINES[Engine]
  // }
  SKIN_ENGINES.push(Engine)
}

/**
 * Pick a correct skinEngine clas that able to load skin by url
 * @param filePath file name url
 * @param uiRoot The instance used for check if the a file is available or not
 * @returns A class (not instance) that able to parse & load the skin
 */
export function getSkinEngineClass(filePath: string): SkinEngineClass {
  // const process = (Engine: SkinEngineClass) => {
  //   const engine = new Engine();
  // }

  SKIN_ENGINES.sort((a: SkinEngineClass, b: SkinEngineClass): number => {
    return a.priority - b.priority;
  });

  //? #1 ask by filename
  for (const Engine of SKIN_ENGINES) {
    if (Engine.canProcess(filePath)) return Engine;
  }
}

/**
 * Pick a correct skinEngine clas that able to load skin by url
 * @param filePath file name url
 * @param uiRoot The instance used for check if the a file is available or not
 * @returns A class (not instance) that able to parse & load the skin
 */
export function getSkinEngineClassByContent(filePath: string, uiRoot: UIRoot): SkinEngineClass {
  // const process = (Engine: SkinEngineClass) => {
  //   const engine = new Engine();
  // }

  SKIN_ENGINES.sort((a: SkinEngineClass, b: SkinEngineClass): number => {
    return a.priority - b.priority;
  });

  //? #2 ask by file is exists
  for (const Engine of SKIN_ENGINES) {
    const aFileName = Engine.identifyByFile(filePath);
    if(uiRoot.getFileAsString(aFileName)!=null){
      return Engine;
    }
  }
}
