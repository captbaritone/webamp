import Group from "./Group";
import { findLast, num, px, removeAllChildNodes, toBool } from "../../utils";
import { XmlElement } from "@rgrove/parse-xml";
import GuiObj from "./GuiObj";
import SkinParser from "../SkinEngine_WAL";

export default class GroupXFade extends Group {
  static GUID = "OFFICIALLY-NO-GUID";
  _speed: number = null;
  _activeChild: GuiObj = null;

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
    actionTarget: string | null = null,
    source: GuiObj = null
  ): boolean {
    if (action.toLowerCase().startsWith("switchto;")) {
      this._uiRoot.vm.dispatch(this, "onaction", [
        { type: "STRING", value: action },
        { type: "STRING", value: param },
        { type: "INT", value: 0 },
        { type: "INT", value: 0 },
        { type: "INT", value: 0 },
        { type: "INT", value: 0 },
        { type: "OBJECT", value: source },
      ]);
      return true;
    }
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
    // hide current page
    if (this._activeChild) this._fadeOut(this._activeChild);

    let child = findLast(this._children, (c) => c.getId() == group_id);
    if (child == null) {
      const dummyNode = new XmlElement("dummy", {
        id: group_id,
        w: "0",
        h: "0",
        relatw: "1",
        relath: "1",
        alpha: "0",
      });
      //TODO: Find a way to reuse skinParser instead create new one
      const parser = new SkinParser(this._uiRoot);
      child = await parser.group(dummyNode, this);
      child.draw();
      child.init();
      this._div.appendChild(child.getDiv());
    }
    await this._fadeIn(child);
    this._activeChild = child;
  }

  // hide slowly
  async _fadeOut(child: GuiObj) {
    child._div.classList.add("fading-out");
    child.setalpha(0);
    setTimeout(() => {
      child._div.classList.remove("fading-out");
      child.hide(); //set display=none to completely disabling mouse event
    }, this._speed * 1500);
  }
  //show slowly
  async _fadeIn(child: GuiObj) {
    child.show();
    child.setalpha(255);
  }

  draw() {
    super.draw();
    this._div.classList.add("x-fade");
    this._div.style.setProperty("--fade-in-speed", `${this._speed}s`);
    this._div.style.setProperty("--fade-out-speed", `${this._speed / 2}s`);
  }
}
