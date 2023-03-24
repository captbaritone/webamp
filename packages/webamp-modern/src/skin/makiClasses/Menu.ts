import GuiObj from "./GuiObj";
// import { UIRoot } from "../../UIRoot";
import Group from "./Group";
// import { px, toBool, clamp } from "../../utils";
// import Button from "./Button";
import Layer from "./Layer";
import { getWa5Popup } from "./menuWa5";
import { generatePopupDiv } from "./PopupMenu";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#?
export default class Menu extends Group {
  static GUID = "73c00594401b961f24671b9b6541ac27";
  //static GUID "73C00594-961F-401B-9B1B-672427AC4165";
  _normalId: string;
  _hoverId: string;
  _downId: string;
  _menuId: string;
  _menuGroupId: string;
  _prevMenuId: string;
  _nextMenuId: string;
  _elNormal: GuiObj;
  _elHover: GuiObj;
  _elDown: GuiObj;
  _elImage: Layer;
  _popup: HTMLElement;

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

  getmenu(): string {
    return this._menuId;
  }
  setmenu(menuId: string) {
    this._menuId = menuId;
  }

  getmenugroup(): string {
    return this._menuGroupId;
  }
  setmenugroup(groupId: string) {
    this._menuGroupId = groupId;
  }
  setnormalid(id: string) {
    this._normalId = id.toLowerCase();
  }
  setdownid(id: string) {
    this._downId = id.toLowerCase();
  }
  sethoverid(id: string) {
    this._hoverId = id.toLowerCase();
  }

  _showButton(el: GuiObj) {
    for (const obj of [this._elNormal, this._elHover, this._elDown]) {
      if (obj) {
        if (obj == el) {
          obj.show();
        } else {
          obj.hide();
        }
      }
    }
  }
  _setButtonWidth(w: string) {
    for (const obj of [this._elNormal, this._elHover, this._elDown]) {
      if (obj) {
        obj.setXmlAttr("w", w);
      }
    }
  }
  onLeftButtonDown(x: number, y: number) {
    super.onLeftButtonDown(x, y);
    this._showButton(this._elDown);
  }
  onEnterArea() {
    super.onEnterArea();
    this._showButton(this._elHover);
    this._div.classList.add("open");
  }
  onLeaveArea() {
    super.onLeaveArea();
    this._showButton(this._elNormal);
    this._div.classList.remove("open");
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
      } else if (obj._id == this._hoverId) {
        this._elHover = obj;
      } else if (obj._id == this._downId) {
        this._elDown = obj;
      } else if (obj instanceof Layer && obj._image) {
        // obj._div.style.position = 'relative'
        this._elImage = obj;
        this.setXmlAttr("relatw", "0");
        const w = this._elImage.getwidth().toString();
        this.setXmlAttr("w", w);
        this._setButtonWidth(w);
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
    this._div.style.pointerEvents = "all";
    // if (this._vertical) {
    //   this._div.classList.add("vertical");
    // } else {
    //   this._div.classList.remove("vertical");
    // }

   
    if(this._menuId.startsWith('WA5:')){
      const [,popupId] = this._menuId.split(':')
      const popupMenu = getWa5Popup(popupId)
      // function menuClick(id:number){
      //   console.log('menu clicked:', id)
      // }
      this._popup = generatePopupDiv(popupMenu, (id:number) => console.log('menu clicked:', id))
    } else {
      this._popup = document.createElement("div");
      this._popup.classList.add("fake-popup");
    }
    this._popup.classList.add("popup");
    // this._appendChildrenToDiv(this._popup);
    this._div.appendChild(this._popup);
  }
}
