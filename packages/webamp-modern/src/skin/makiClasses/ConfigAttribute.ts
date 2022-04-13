import BaseObject from "./BaseObject";

export default class ConfigAttribute extends BaseObject {
  static GUID = "24dec2834a36b76e249ecc8c736c6bc4";
  _default: string;
  _value: string;

  constructor(name:string, defaultValue: string) {
    super();
    this._id = name;
    this._default = defaultValue;
    // this._value = ''
  }
  
  getdata():string{
    //   return '';
      return this._value || this._default || '';
  }
  setdata(value:string){
      this._value = value;
  }
  ondatachanged(){
    //   this._value = value;
  }
}
