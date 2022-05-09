import ConfigPersistent from "./makiClasses/ConfigPersistent";

class PrivateConfig extends ConfigPersistent {
  getStorageName(): string {
    return "_PRIVATE-CONFIG_";
  }

  getPrivateInt(section: string, item: string, defvalue: number): number {
    let value: string = this.getValue(section, item);
    // if not found, create new one
    if (value == null) {
      value = this.setValue(section, item, String(defvalue));
    }
    return Number(value);
  }

  setPrivateInt(section: string, item: string, value: number): number {
    const strValue: string = this.setValue(section, item, String(value));
    return Number(strValue);
  }

  getPrivateString(section: string, item: string, defvalue: string): string {
    let value: string = this.getValue(section, item);
    // if not found, create new one
    if (value == null) {
      value = this.setValue(section, item, defvalue);
    }
    return value;
  }

  setPrivateString(section: string, item: string, value: string): string {
    return this.setValue(section, item, String(value));
  }
}

const PRIVATE_CONFIG = new PrivateConfig();

export default PRIVATE_CONFIG;
