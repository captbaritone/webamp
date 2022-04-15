import BaseObject from "./BaseObject";

export type SectionValues = { [key: string]: string };
export default class ConfigPersistent extends BaseObject {
  // _configTree: { [key: string]: string };
  _configTree: { [section: string]: SectionValues };


  getStorageName(): string {
    // inheritor should give a real name.
    // below is for placeholder only
    return `${this.getclassname()}.${this.getId() || "~"}`;
  }

  constructor() {
    super();
    this.loadStorage();
  }

  loadStorage() {
    // Retrieve the object from storage
    const cookies = window.localStorage.getItem(this.getStorageName());
    if (cookies) {
      this._configTree = JSON.parse(cookies);
    } else {
      this._configTree = {};
    }
  }

  getSectionValues(section: string): SectionValues {
    if (this._configTree[section] == null) {
      this._configTree[section] = {};
    }
    return this._configTree[section];
  }

  getValue(section: string, key: string): string {
    return this.getSectionValues(section)[key];
  }

  setValue(section:string, key: string, value: string): string {
    if (this.getValue(section,key) != value) {
      this._configTree[section][key] = value;
      this._saveState();
    }
    return value;
  }

  _saveState = debounce(() => {
    // Put the object into storage
    window.localStorage.setItem(
      this.getStorageName(),
      JSON.stringify(this._configTree)
    );
  }, 500);
}

function debounce<Params extends any[]>(
  func: (...args: Params) => any,
  timeout: number
): (...args: Params) => void {
  let timer: NodeJS.Timeout;
  return (...args: Params) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
}
