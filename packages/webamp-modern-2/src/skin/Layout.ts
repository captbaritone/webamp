import Group from "./Group";
import * as Utils from "../utils";
import Container from "./Container";
import Layer from "./Layer";

// > A layout is a special kind of group, which shown inside a container. Each
// > layout represents an appearance for that window. Layouts give you the ability
// > to design different looks for the same container (or window). However, only
// > one layout can be visible at a time. You must toggle among layouts you
// > defined. An example is the normal mode and windowshade mode in the Default
// > skin.
//
// -- http://wiki.winamp.com/wiki/Modern_Skin:_Container
export default class Layout extends Group {
  _parent: Container | null = null;

  setXmlAttr(key: string, value: string): boolean {
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "desktopalpha":
        this._desktopAlpha = Utils.toBool(value);
        break;
      default:
        return false;
    }
    return true;
  }

  setParent(container: Container) {
    this._parent = container;
  }
}
