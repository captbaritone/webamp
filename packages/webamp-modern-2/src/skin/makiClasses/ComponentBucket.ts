import GuiObj from "./GuiObj";
import UI_ROOT from "../../UIRoot";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Clayer.2F.3E
export default class CompnentBucket extends GuiObj {
  static GUID = "97aa3e4d4fa8f4d0f20a7b818349452a";
//   _image: string;
  
  

  getmaxheight(): number {
    return this._maximumHeight;
  }

  getmaxwidth(): number {
    return this._maximumWidth;
  }

  setscroll(x:number): number {
    return 10; //TODO setscroll to ._div
  }

  getscroll(): number {
    return 10; //TODO: Check by ._div.scroll
  }
  
  getnumchildren(): number {
    return this._children.length;
  }
  
  enumchildren(n: number): GuiObj {
    return this._children[n];
  }
  

}
