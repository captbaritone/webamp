import ConfigPersistent from "./makiClasses/ConfigPersistent";

class PrivateConfig extends ConfigPersistent {
  // _sections: Map<string, Map<string, string|number>> = new Map();
  // _sections: { [section: string]: { [key: string]: string | number } };
  // _configTree: { [section: string]: { [key: string]: string | number } };

  getStorageName(): string {
    return '_PRIVATE-CONFIG_';
  }

  // constructor() {
    
  //   // Retrieve the object from storage
  //   const cookies = localStorage.getItem("_privateConfig_");
  //   if (cookies) {
  //     this._sections = JSON.parse(cookies);
  //   } else {
  //     this._sections = {};
  //   }
  // }

  // _saveState = debounce(() => {
  //   // Put the object into storage
  //   localStorage.setItem("_privateConfig_", JSON.stringify(this._sections));
  // }, 100);

  // _getSection(section: string) {
  //   if (this._configTree[section] == null) {
  //     this._configTree[section] = {};
  //   }
  //   return this._configTree[section];
  // }

  getPrivateInt(section: string, item: string, defvalue: number): number {
    let value: string = this.getValue(section, item);
    // if not found, create new one
    if (value == null) {
      value = this.setValue(section, item, String(defvalue));
    }
    return Number(value);
  }

  setPrivateInt(section: string, item: string, value: number): number {
    const strValue: string = this.setValue(section, item, String(value))
    return Number(strValue);
  }

  getPrivateString(section: string, item: string, defvalue: string): string {
    let value: string = this.getValue(section, item);
    // if not found, create new one
    if (value == null) {
      value = this.setValue(section, item, defvalue);
    }
    return value
  }

  setPrivateString(section: string, item: string, value: string): string {
    return this.setValue(section, item, String(value))
  }
}

// function debounce<Params extends any[]>(
//   func: (...args: Params) => any,
//   timeout: number
// ): (...args: Params) => void {
//   let timer: NodeJS.Timeout;
//   return (...args: Params) => {
//     clearTimeout(timer);
//     timer = setTimeout(() => {
//       func(...args);
//     }, timeout);
//   };
// }

const PRIVATE_CONFIG = new PrivateConfig();

export default PRIVATE_CONFIG;
