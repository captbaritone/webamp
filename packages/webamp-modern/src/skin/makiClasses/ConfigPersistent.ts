import BaseObject from "./BaseObject";

export default class ConfigPersistent extends BaseObject {
  _configTree: { [key: string]: string };

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

  getValue(key: string): string {
    return this._configTree[key];
  }

  setValue(key: string, value: string): string {
    if (this._configTree[key] != value) {
      this._configTree[key] = value;
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
