import GuiObj from "./GuiObj";
import UI_ROOT from "../../UIRoot";
import { px } from "../../utils";

// http://wiki.winamp.com/wiki/XML_GUI_Objects
export default class Grid extends GuiObj {
//   static GUID = "5ab9fa1545579a7d5765c8aba97cc6a6";
  _image: string; // link to Bitmap._id
  _left  : HTMLElement; 
  _middle: HTMLElement;
  _right : HTMLElement;

  constructor(){
      super();
      this._left = document.createElement('left');
      this._middle = document.createElement('middle');
      this._right = document.createElement('right');
      this._div.appendChild(this._left)
      this._div.appendChild(this._middle)
      this._div.appendChild(this._right)
  }
  
  setXmlAttr(key: string, value: string): boolean {
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "middle":
        // this._image = value;
        // this._renderBackground();
        this._setBitmap(this._middle, value);
        break;
      case "left":
        this._setBitmap(this._left, value);
        break;
      case "right":
        this._setBitmap(this._right, value);
        break;
      default:
        return false;
    }
    return true;
  }

  // This shadows `getheight()` on GuiObj
  getheight(): number {
    if (this._height) {
      return this._height;
    }
    if (this._image != null) {
      const bitmap = UI_ROOT.getBitmap(this._image);
      if(bitmap) return bitmap.getHeight();
    }
    return super.getheight();
  }

  // This shadows `getwidth()` on GuiObj
  getwidth(): number {
    if (this._width) {
      return this._width;
    }
    if (this._image != null) {
      const bitmap = UI_ROOT.getBitmap(this._image);
      if(bitmap) return bitmap.getWidth();
    }
    return super.getwidth();
  }

  _renderBackground() {
    const bitmap = this._image != null ? UI_ROOT.getBitmap(this._image) : null;
    this.setBackgroundImage(bitmap);
  }

  _setBitmap(element: HTMLElement, bitmap_id: string) {
    const bitmap = UI_ROOT.getBitmap(bitmap_id);
    // this.setBackgroundImage(bitmap);
    if(bitmap){
        bitmap.setAsBackground(element);
        element.style.width = px(bitmap.getWidth());
    }
  }

  draw() {
    super.draw();
    // this._div.setAttribute("data-obj-name", "Layer");
    // this._div.style.pointerEvents = this._sysregion==-2 || this._ghost? 'none' : 'auto';
    this._div.style.pointerEvents = 'none';
    // this._div.style.overflow = "hidden";
    this._div.style.removeProperty("display");
    this._div.classList.add("webamp--img");
    this._renderBackground();
  }
  //setRegionFromMap(regionMap:Map, threshold:number)

  isinvalid():boolean {
    return false;
  }
}
