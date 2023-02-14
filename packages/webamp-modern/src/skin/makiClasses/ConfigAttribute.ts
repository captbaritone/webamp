import { Emitter } from "../../utils";
import BaseObject from "./BaseObject";
import ConfigItem from "./ConfigItem";

export default class ConfigAttribute extends BaseObject {
  static GUID = "24dec2834a36b76e249ecc8c736c6bc4";
  _configItem: ConfigItem;
  _eventListener: Emitter;
  
  constructor(configItem: ConfigItem, name: string) {
    super();
    this._configItem = configItem;
    this._id = name;
    this._eventListener = new Emitter();
    // this.on('datachanged', this.ondatachanged.bind(this))
    // this.on('datachanged', this.ondatachanged.bind(this))
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
    // console.log('getData:',this._id, '=',this._configItem.getValue(this._id))
    return this._configItem.getValue(this._id);
  }
  setdata(value: string) {
    // console.log('setData:',this._id, '=',value)
    this._configItem.setValue(this._id, value);
    this.trigger("datachanged");
    this.ondatachanged()
  }
  ondatachanged() {
    // console.log(' -- triggering onDataChanged...'+ this._id, this._configItem.getValue(this._id))
    this._configItem._uiRoot.vm.dispatch(this, "ondatachanged");
    // console.log('triggered: onDataChanged.')
  }
}
