import GuiObj from "./GuiObj";
import { UIRoot } from "../../UIRoot";
import Group from "./Group";
import { px, toBool, clamp } from "../../utils";
import Button from "./Button";
import Layer from "./Layer";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#?
// eslint-disable-next-line rulesdir/proper-maki-types
export default class Menu extends GuiObj {
  static GUID = "73c00594f40961bb191bac2724674165";
  //static GUID = "73C00594-961F-401B-9B1B-672427AC4165";
  _normal: string;
  _hover: string;
  _down: string;
  _elNormal: GuiObj;
  _elHover: GuiObj;
  _elDown: GuiObj;
  _elImage: Layer;

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }

    switch (key.toLowerCase()) {
      case "normal":
        this._normal = value.toLowerCase();
        break;
      case "hover":
        this._hover = value.toLowerCase();
        break;
      case "down":
        this._down = value.toLowerCase();
        break;
      default:
        return false;
    }
    return true;
  }



  _showButton(el:GuiObj){
    for (const obj of [this._elNormal, this._elHover, this._elDown]) {
      if (obj){
        if (obj == el){
          obj.show()
        } else {
          obj.hide()
        }
      }
    }
  }
  _setButtonWidth(w: string){
    for (const obj of [this._elNormal, this._elHover, this._elDown]) {
      if (obj){
        obj.setXmlAttr('w', w)
      }
    }
  }
  onLeftButtonDown(x: number, y: number){
    super.onLeftButtonDown(x,y)
    this._showButton(this._elDown);
  }
  onEnterArea(){
    super.onEnterArea()
    this._showButton(this._elHover);
  }
  onLeaveArea(){
    super.onLeaveArea()
    this._showButton(null);
  }


  init() {
    super.init();
    // this.resolveButtonsAction();
    // this._uiRoot.vm.dispatch(this, "onstartup", []);
  }
  resolveButtonsAction() {
    //console.log('found img')
    // debugger;
    for (const obj of this.getparent()._children) {
      if (obj._id == this._normal) {
        this._elNormal = obj;
      }
      else if (obj._id == this._hover) {
        this._elHover = obj;
      }
      else if (obj._id == this._down) {
        this._elDown = obj;
      }
      else if ((obj instanceof Layer) && obj._image) {
        // obj._div.style.position = 'relative'
        this._elImage = obj;
        this.setXmlAttr('relatw', '0')
        const w = this._elImage.getwidth().toString();
        this.setXmlAttr('w', w)
        this._setButtonWidth(w)
      }
    }
  }  

  
  draw() {
    // debugger;
    this.resolveButtonsAction();
    // if(this._elImage){
    //   this.setXmlAttr('relatw', '0')
    //   const w = this._elImage.getwidth().toString();
    //   this.setXmlAttr('w', w)
    //   this._setButtonWidth(w)
    // }
    super.draw();
    // if (this._vertical) {
    //   this._div.classList.add("vertical");
    // } else {
    //   this._div.classList.remove("vertical");
    // }
  }
}
