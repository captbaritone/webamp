import UI_ROOT from "../../UIRoot";
import { assert, px, removeAllChildNodes, toBool } from "../../utils";
import GuiObj from "./GuiObj";
import Group from "./Group";

// > A container is a top level object and it basically represents a window.
// > Nothing holds a container. It is an object that holds multiple related
// > layouts. Each layout represents an appearance for that window. You can design
// > different layouts for each window but only one can be visible at a time.
//
// -- http://wiki.winamp.com/wiki/Modern_Skin
export default class WindowHolder extends Group {
//   static GUID = "38603665461B42a7AA75D83F6667BF73";
  
  constructor() {
    super();
  }

//   setXmlAttr(_key: string, value: string): boolean {
//     const key = _key.toLowerCase();
//     if (super.setXmlAttr(key, value)) {
//       return true;
//     }
//     switch (key) {
//       case "name":
//         this._name = value;
//         break;
//       case "id":
//         this._id = value.toLowerCase();
//         break;
//       case "default_visible":
//         this._visible = toBool(value);
//         break;
//       default:
//         return false;
//     }
//     return true;
//   }

}
