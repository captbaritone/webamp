import Button from "./Button";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Cbutton.2F.3E_.26_.3Ctogglebutton.2F.3E
export default class ToggleButton extends Button {
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
  extern ToggleButton.onToggle(Boolean onoff);
  extern int TOggleButton.getCurCfgVal()
  */
}
