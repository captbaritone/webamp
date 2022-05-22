import { registerSkinEngine, SkinEngine } from "./SkinEngine";

export class SkinEngineWAL extends SkinEngine {
  static canProcess = (filePath: string): boolean => {
    return filePath.endsWith('.wal');
  };

  static identifyByFile = (filePath: string): string => {
    return "skin.xml";
  };

  static priority: number = 1;
}

registerSkinEngine(SkinEngineWAL)