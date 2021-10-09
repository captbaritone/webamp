// TODO: Persist this to local state?
class PrivateConfig {
  _sections: Map<string, Map<string, number>> = new Map();
  _getSection(section: string) {
    if (!this._sections.has(section)) {
      this._sections.set(section, new Map());
    }
    return this._sections.get(section);
  }
  getPrivateInt(section: string, item: string, defvalue: number) {
    return this._getSection(section).get(item) ?? defvalue;
  }

  setPrivateInt(section: string, item: string, value: number) {
    return this._getSection(section).set(item, value);
  }
}

const PRIVATE_CONFIG = new PrivateConfig();

export default PRIVATE_CONFIG;
