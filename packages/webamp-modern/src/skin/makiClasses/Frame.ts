import GuiObj from "./GuiObj";
// import { UIRoot } from "../../UIRoot";
// import Group from "./Group";
// import { px, toBool, clamp } from "../../utils";
// import Button from "./Button";
import Layer from "./Layer";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3CWasabi:Frame.2F.3E
export default class Frame extends GuiObj {
  static GUID = "e2bbc14d417384f6ebb2b3bd5055662f";
  _position: number = 0;
  _resizable: boolean = true;   //? Set this flag to allow the user to change the position of the framedivider. 
  _from: string;    //?  the edge. 'l' | 't' | 'r' | 'b'
  _width: number;   //?  How many pixels from the chosen edge to start.
  _height: number;  //?  How many pixels from the chosen edge to start.
  //* don't be confused with _minimumWidth & _maximumWidth !
  _minWidth: number;    //? The minimum amount of pixels you are able to move the poppler if resizable (If you go below this value the poppler will snap to 0).
  _maxwidth: number;    //? The maximum amount of pixels you are able to move the poppler if resizable.
  _leftlId: string;
  _rightId: string;
  _topId: string;
  _bottomId: string;

  getElTag(): string {
    return "frame2";
  }

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }

    switch (key.toLowerCase()) {
      case "normal":
        this.setnormalid(value);
        break;
      case "hover":
        this.sethoverid(value);
        break;
      case "down":
        this.setdownid(value);
        break;
      case "next":
        this._nextMenuId = value.toLowerCase();
        break;
      case "prev":
        this._prevMenuId = value.toLowerCase();
        break;
      case "menu":
        this.setmenu(value);
        break;
      case "menugroup":
        this.setmenugroup(value);
        break;
      default:
        return false;
    }
    return true;
  }

  getposition(): number {
    return this._position
  }
  setposition(position: number) {
    this._position = position;
  }

  getmenu(): string {
    return this._menuId;
  }
  setmenu(menuId:string) {
    this._menuId = menuId;
  }

  getmenugroup(): string {
    return this._menuGroupId;
  }
  setmenugroup(groupId:string) {
    this._menuGroupId = groupId;
  }
  setnormalid(id :string){
    this._normalId = id.toLowerCase();
  }
  setdownid(id :string){
    this._downId = id.toLowerCase();
  }
  sethoverid(id :string){
    this._hoverId = id.toLowerCase();
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
      if (obj._id == this._normalId) {
        this._elNormal = obj;
      }
      else if (obj._id == this._hoverId) {
        this._elHover = obj;
      }
      else if (obj._id == this._downId) {
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
    // this.resolveButtonsAction();
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
