import GuiObj from "./GuiObj";

// Maybe this?
// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3CWasabi:StandardFrame:Status.2F.3E
export default class Status extends GuiObj {
  static GUID = "0f08c9404b23af39c4b8f38059bb7e8f";
  setXmlAttr(key: string, value: string): boolean {
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      default:
        return false;
    }
    return true;
  }
}
