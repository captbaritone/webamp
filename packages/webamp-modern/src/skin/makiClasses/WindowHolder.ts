import Group from "./Group";
import GuiObj from "./GuiObj";
import Avs from "./Avs";
import { XmlElement } from "@rgrove/parse-xml";

export default class WindowHolder extends Group {
  static GUID = "403abcc04bd66f22c810a48b47259329";
  _hold: string; //GUID being held
  _heldObj: GuiObj;

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "hold":
        this._hold = value.toLowerCase();
        this._buildConent();
        break;
      default:
        return false;
    }
    return true;
  }

  getguid(): string {
    return this._hold;
  }
  getcontent(): GuiObj {
    return this._heldObj;
  }
  _buildConent() {
    const id = this._uiRoot.guid2alias(this._hold);
    switch (id) {
      case "avs":
        const gui = new Avs(this._uiRoot);
        const spec = new XmlElement("dummy", { fitparent: "1" });
        gui.setXmlAttributes(spec.attributes);
        this.addChild(gui);
        this._heldObj = gui;
        break;
    }
  }
  getcomponentname(): string {
    if (this._heldObj) {
      return this._heldObj._name;
    }
    return "";
  }
}
