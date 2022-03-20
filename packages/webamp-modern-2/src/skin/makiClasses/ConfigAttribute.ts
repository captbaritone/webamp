// import XmlObj from "../XmlObj";

export default class ConfigAttribute  {
  static GUID = "24dec2834a36b76e249ecc8c736c6bc4";
  _name : string;
  _default: string;
  _value: string;

  constructor(name:string, defaultValue: string) {
//   constructor() {
    // super();
    this._name = name;
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
