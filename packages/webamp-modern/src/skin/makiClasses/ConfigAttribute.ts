// import UI_ROOT from "../../UIRoot";
import { Emitter } from "../../utils";
import BaseObject from "./BaseObject";
import ConfigItem from "./ConfigItem";

export default class ConfigAttribute extends BaseObject {
  static GUID = "24dec2834a36b76e249ecc8c736c6bc4";
  _configItem: ConfigItem;
  _eventListener: Emitter = new Emitter();

  constructor(configItem: ConfigItem, name: string) {
    super();
    this._configItem = configItem;
    this._id = name;
  }

  getparentitem(): ConfigItem {
    return this._configItem;
  }
  getattributename(): string {
    return this._id;
  }

  // shortcut of this.Emitter
  on(event: string, callback: Function): Function {
    return this._eventListener.on(event, callback);
  }
  trigger(event: string, ...args: any[]) {
    this._eventListener.trigger(event, ...args);
  }
  off(event: string, callback: Function) {
    this._eventListener.off(event, callback);
  }

  getdata(): string {
    return this._configItem.getValue(this._id);
  }
  setdata(value: string) {
    this._configItem.setValue(this._id, value);
    this.trigger("datachanged");
  }
  ondatachanged() {
    UI_ROOT.vm.dispatch(this, "ondatachanged");
  }
}
