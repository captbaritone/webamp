class PrivateConfig {
  // _sections: Map<string, Map<string, string|number>> = new Map();
  _sections: { [section: string]: { [key: string]: string | number } };

  constructor() {
    // Retrieve the object from storage
    const cookies = localStorage.getItem("_privateConfig_");
    if (cookies) {
      this._sections = JSON.parse(cookies);
    } else {
      this._sections = {};
    }
  }

  _saveState = debounce(() => {
    // Put the object into storage
    localStorage.setItem("_privateConfig_", JSON.stringify(this._sections));
  }, 100);

  _getSection(section: string) {
    if (this._sections[section] == null) {
      this._sections[section] = {};
    }
    return this._sections[section];
  }

  getPrivateInt(section: string, item: string, defvalue: number): number {
    const value: string | number = this._getSection(section)[item];
    // if not found, create new one
    if (value == null) {
      return this.setPrivateInt(section, item, defvalue);
    }
    return Number(value);
  }

  setPrivateInt(section: string, item: string, value: number): number {
    value = Number(value); // guard
    this._getSection(section)[item] = value;
    this._saveState();
    return value;
  }

  getPrivateString(section: string, item: string, defvalue: string): string {
    const value: string | number = this._getSection(section)[item];
    // if not found, create new one
    if (value == null) {
      return this.setPrivateString(section, item, defvalue);
    }
    return String(value);
  }

  setPrivateString(section: string, item: string, value: string): string {
    value = String(value); // guard
    this._getSection(section)[item] = value;
    this._saveState();
    return value;
  }
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

const PRIVATE_CONFIG = new PrivateConfig();

export default PRIVATE_CONFIG;
