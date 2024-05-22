import GuiObj from "./GuiObj";
// import { UIRoot } from "../../UIRoot";
import Group from "./Group";
// import { px, toBool, clamp } from "../../utils";
// import Button from "./Button";
import Layer from "./Layer";
import { getWa5Popup } from "./menuWa5";
import PopupMenu from "./PopupMenu";
import { ICLoseablePopup, destroyActivePopup, generatePopupDiv, setActivePopup } from "./MenuItem";
import { findAction, updateActions } from "./menuWa5actions";

let ACTIVE_MENU_GROUP: string = ''
// let ACTIVE_MENU: Menu = null;

/*function destroyActivePopup() {
  console.log('globalWindowClick')
  if (ACTIVE_MENU != null) {
    ACTIVE_MENU.doCloseMenu()
  }
  ACTIVE_MENU_GROUP = ''
}

let globalClickInstalled = false;
function installGlobalClickListener() {
  setTimeout(() => {  // using promise to prevent immediately executing of globalWindowClick 
    installGlobalMouseDown(destroyActivePopup);  // call globalWindowClick on any GuiObj
    if (!globalClickInstalled) {
      document.addEventListener("mousedown", destroyActivePopup); // call globalWindowClick on document
      globalClickInstalled = true;
    }
  }, 500);
}
function uninstallGlobalClickListener() {
  if (globalClickInstalled) {
    document.removeEventListener("mousedown", destroyActivePopup);
    globalClickInstalled = false;
  }

  uninstallGlobalMouseDown(destroyActivePopup)
}*/
// http://wiki.winamp.com/wiki/XML_GUI_Objects#?
export default class Menu extends Group implements ICLoseablePopup {
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
  _popup: PopupMenu;
  _popupDiv: HTMLElement;

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

  doClosePopup() {
    this._showButton(this._elNormal);
    this._div.classList.remove("open");
    // ACTIVE_MENU = null;
    // document.removeEventListener("mousedown", globalWindowClick);
    // uninstallGlobalMouseDown(globalWindowClick)
    // uninstallGlobalClickListener()
    // ACTIVE_MENU_GROUP = ''
  }

  onLeftButtonDown(x: number, y: number) {
    // super.onLeftButtonDown(x, y);
    // this._showButton(this._elDown);
    //? toggle dropdown visibility
    if (ACTIVE_MENU_GROUP != this._menuGroupId) {
      ACTIVE_MENU_GROUP = this._menuGroupId;
      destroyActivePopup()
      // setTimeout(() => {
      //   installGlobalMouseDown(globalWindowClick);
      // }, 500);
      // installGlobalClickListener()
      setActivePopup(this)

    } else {
      ACTIVE_MENU_GROUP = null;
      // if (ACTIVE_MENU != null) {
      //   ACTIVE_MENU.doCloseMenu()
      // }
      destroyActivePopup()
    }
    this.onEnterArea()
  }
  onEnterArea() {
    // super.onEnterArea();
    if (ACTIVE_MENU_GROUP == this._menuGroupId) {
      // if (ACTIVE_MENU != null) {
      //   ACTIVE_MENU.doCloseMenu()
      // }
      destroyActivePopup()
      this._showButton(this._elDown);
      this._div.classList.add("open");

      // ACTIVE_MENU = this;
      setActivePopup(this)
    } else {
      this._showButton(this._elHover);
    }
  }
  onLeaveArea() {
    // super.onLeaveArea();
    if (ACTIVE_MENU_GROUP != this._menuGroupId) {
      this._showButton(this._elNormal);
      // this._div.classList.remove("open");
    }
  }


  setup() {
    super.setup();
    // this.resolveButtonsAction();
    // this._uiRoot.vm.dispatch(this, "onstartup", []);
    this.getparentlayout().registerShortcuts(this._popup)
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


    if (this._menuId.startsWith('WA5:')) {
      const [, popupId] = this._menuId.split(':')
      this._popup = getWa5Popup(popupId, this._uiRoot);
      
      this.invalidatePopup()
      // function menuClick(id:number){
      //   console.log('menu clicked:', id)
      // }
    }
  }

  /**
   * update the checkmark, enabled/disabled, etc
   */
  invalidatePopup() {
    const self = this;
    if (this._popup) {

      // destroy old DOM
      if(this._popupDiv){
        this._popupDiv.remove()
      }

      updateActions(this._popup, this._uiRoot); // let winamp5 menus reflect the real config/condition

      const menuItemClick = (id: number) => {
        console.log('menu clicked:', id);
        const action = findAction(id);
        const invalidateRequired = action.onExecute(self._uiRoot);
        if(invalidateRequired) self.invalidatePopup();  
      }
      
      this._popupDiv = generatePopupDiv(this._popup, menuItemClick);
      // } else {
      // this._popupDiv = document.createElement("div");
      // this._popupDiv.classList.add("fake-popup");
      // }
      this._popupDiv.classList.add("popup");
      // this._appendChildrenToDiv(this._popup);
      this._div.appendChild(this._popupDiv);
    }
  }
}
