import BaseObject from "./BaseObject";
import { UIRoot } from "../../UIRoot";

export default class Application extends BaseObject {
  static GUID = "b8e867b04da72715db53baa5acfefca1";
  _uiRoot: UIRoot;

  constructor(uiRoot: UIRoot) {
    super();
    this._uiRoot = uiRoot;
  }

  /**
    Path where Winamp stores it's settings (studio.xnf, winamp.ini, etc)
  */
  getsettingspath():string {    
    // in windows, should be C:\users\mename\Application Data\WACUP
    return './'
  }
}
