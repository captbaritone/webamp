import GuiObj from "./GuiObj";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Clayoutstatus.2F.3E
export default class LayoutStatus extends GuiObj {
  static GUID = "7fd5f21048dfacc45154a0a676dc6c57";

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

  callme(str: string) {
    console.log("callme:", str);
  }
}
