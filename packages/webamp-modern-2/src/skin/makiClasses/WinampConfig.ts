import ConfigItem from "./ConfigItem";

const _items: { [key: string]: ConfigItem } = {};

export default class WinampConfig {
  static GUID = "b2ad3f2b4e3131ed95e96dbcbb55d51c";
  // _items : {[key:string]: ConfigItem} = {};

  getgroup(config_group_guid: string): WinampConfigGroup {
    return new WinampConfigGroup();
  }
}

export class WinampConfigGroup {
  static GUID = "fc17844e4518c72bf9a868a080baa530";

  getbool(itemName: string): boolean {
    return true;
  }

  getint(itemName: string): number {
    return 0;
  }

  getstring(itemName: string): string {
    return "";
  }
}

// Global Singleton for now
// export const Config = new ConfigClass();
// export Config;
