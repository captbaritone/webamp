import BaseObject from "./BaseObject";
import { UIRoot } from "../../UIRoot";
import { unimplemented } from "../../utils";

export default class Application extends BaseObject {
  static GUID = "b8e867b04da72715db53baa5acfefca1";
  _uiRoot: UIRoot;

  constructor(uiRoot: UIRoot) {
    super();
    this._uiRoot = uiRoot;
  }

  getapplicationname(): string{
    return 'WebAmp Modern'
  }

  getversionstring(): string{
    return unimplemented('5.66')
  }

  /**
    Path where Winamp stores it's settings (studio.xnf, winamp.ini, etc)
  */
  getsettingspath():string {    
    // in windows, should be C:\users\mename\Application Data\Winamp
    return unimplemented('./')
  }

  /**
    Path where winamp.exe (or studio.exe) lives
  */
  getapplicationpath():string {    
    // in windows, should be C:\Program Files\Winamp
    return unimplemented('./')
  }
}
