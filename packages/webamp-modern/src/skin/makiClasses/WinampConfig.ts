import { UIRoot } from "../../UIRoot";
import BaseObject from "./BaseObject";
// import { CONFIG } from "./Config";
import ConfigItem from "./ConfigItem";

const _items: { [key: string]: ConfigItem } = {};

export default class WinampConfig extends BaseObject {
  static GUID = "b2ad3f2b4e3131ed95e96dbcbb55d51c";
  _uiRoot: UIRoot;
  // _items : {[key:string]: ConfigItem} = {};

  constructor(uiRoot: UIRoot) {
    super();
    this._uiRoot = uiRoot;
  }

  getgroup(config_group_guid: string): WinampConfigGroup {
    const cfg = this._uiRoot.CONFIG.getitembyguid(config_group_guid);
    return new WinampConfigGroup(cfg);
  }
}

export class WinampConfigGroup {
  static GUID = "fc17844e4518c72bf9a868a080baa530";
  _cfg: ConfigItem;
  _uiRoot: UIRoot;

  constructor(cfg: ConfigItem) {
    this._cfg = cfg;
  }

  getstring(itemName: string): string {
    return this._cfg.getValue(itemName);
  }

  getbool(itemName: string): boolean {
    return this.getstring(itemName) == "1" ? true : false;
  }

  getint(itemName: string): number {
    return parseInt(this.getstring(itemName) || "0");
  }

  setstring(itemName: string, itemValue: string) {
    //TODO: integrate with ConfigAttribute, so changing value will trigger onchanged.
    this._cfg.setValue(itemName, itemValue);
  }

  setbool(itemName: string, itemValue: boolean) {
    this._cfg.setValue(itemName, itemValue ? "1" : "0");
  }

  setint(itemName: string) {
    //WRONG API?
  }
}

// Global Singleton
// export const WINAMP_CONFIG: WinampConfig = new WinampConfig();
