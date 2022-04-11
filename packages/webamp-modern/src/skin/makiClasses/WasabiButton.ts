import UI_ROOT from "../../UIRoot";
import Button from "./Button";

export default class WasabiButton extends Button {
  //   static GUID = "unknown";

  getElTag(): string {
    return "button";
  }

  constructor() {
    super();
    this.registerDimensions();
  }

  setXmlAttr(key: string, value: string): boolean {
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "text":
        this._div.innerText = value;
        break;
      default:
        return false;
    }
    return true;
  }

  registerDimensions() {
    UI_ROOT.addHeight("button-border-top", "wasabi.button.top");
    UI_ROOT.addHeight("button-border-bottom", "wasabi.button.bottom");
    UI_ROOT.addWidth("button-border-left", "wasabi.button.left");
    UI_ROOT.addWidth("button-border-right", "wasabi.button.right");
  }

  draw() {
    super.draw();
    this._div.classList.remove("webamp--img");
    this._div.classList.add("wasabi");
    this._div.setAttribute("data-obj-name", "WasabiButton");
  }

  /*
  extern ToggleButton.onToggle(Boolean onoff);
  extern int TOggleButton.getCurCfgVal()
  */
}
