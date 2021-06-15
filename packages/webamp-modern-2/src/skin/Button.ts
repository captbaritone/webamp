import GuiObj from "./GuiObj";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Cbutton.2F.3E_.26_.3Ctogglebutton.2F.3E
export default class Button extends GuiObj {
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

  /*
  extern Button.onActivate(int activated);
  extern Button.onLeftClick();
  extern Button.onRightClick();
  extern Button.setActivated(Boolean onoff);
  extern Button.setActivatedNoCallback(Boolean onoff);
  extern Boolean Button.getActivated();
  extern Button.leftClick();
  extern Button.rightClick();e
  */
}
