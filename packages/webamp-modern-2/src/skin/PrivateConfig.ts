// TODO: Persist this to local state?
class PrivateConfig {
  _sections: Map<string, Map<string, string>> = new Map();
  _getSection(section: string) {
    if (!this._sections.has(section)) {
      this._sections.set(section, new Map());
    }
    return this._sections.get(section);
  }
  getPrivateInt(section: string, item: string, defvalue: number):number {
    const value:string = this._getSection(section).get(item);
    return value? parseInt(value) : defvalue ;
  }

  setPrivateInt(section: string, item: string, value: number) {
    return this._getSection(section).set(item, value.toString());
  }

  getPrivateString(section: string, item: string, defvalue: string): string {
    return this._getSection(section).get(item) ?? defvalue;
  }


}

const PRIVATE_CONFIG = new PrivateConfig();

export default PRIVATE_CONFIG;
