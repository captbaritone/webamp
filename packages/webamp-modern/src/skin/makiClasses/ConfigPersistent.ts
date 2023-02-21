import { debounce } from "../../utils";
import BaseObject from "./BaseObject";

export type SectionValues = { [key: string]: string };
export default abstract class ConfigPersistent extends BaseObject {
  _configTree: { [section: string]: SectionValues };

  getStorageName(): string {
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
    key = key.toLowerCase();
    return this.getSectionValues(section)[key];
  }

  setValue(section: string, key: string, value: string): string {
    key = key.toLowerCase();
    if (this.getValue(section, key) != value) {
      const values = this.getSectionValues(section);
      values[key] = value;
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
  }, 2000);
}
