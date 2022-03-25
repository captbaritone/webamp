import Group from "./Group";
import { findLast, num, px, removeAllChildNodes, toBool } from "../../utils";
import UI_ROOT from "../../UIRoot";
import { XmlElement } from "@rgrove/parse-xml";

export default class GroupXFade extends Group {
  _speed: number = null;

  getElTag(): string {
    return "group";
  }

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }

    switch (key) {
      case "speed":
        this._speed = num(value);
        break;
      case "groupid":
        // this._speed = num(value);
        console.log("xFade new groupid", value);
        this._switchTo(value.toLowerCase());
        break;
      default:
        return false;
    }
    return true;
  }

  handleAction(
    action: string,
    param: string | null = null,
    actionTarget: string | null = null
  ) {
    // if(action.toLowerCase().startsWith('switchto;')){
    //     UI_ROOT.vm.dispatch(this, 'onaction', [

    //     ])
    // }
    switch (action.toLowerCase()) {
      case "groupid":
        // this._switchTo(action.toLowerCase());
        return true;
      case "switchto":
        // switchto seem as controlled by maki,
        // which in turn call setXmlParam("groupid", grp)
        // so we do nothing here
        break;
    }
    return false;
  }

  init() {
    super.init();
  }

  async _switchTo(group_id: string) {
    // clear
    removeAllChildNodes(this._div);
    let child = findLast(this._children, (c) => c.getId() == group_id);
    if (child == null) {
      const dummyNode = new XmlElement("dummy", {
        id: group_id,
        w: "0",
        h: "0",
        relatw: "1",
        relath: "1",
      });
      child = await UI_ROOT._parser.group(dummyNode, this);
      child.draw()
      child.init();
    }
    this._div.appendChild(child.getDiv())
  }

  draw() {
    super.draw();
    this._div.classList.add("x-fade");
  }
}
