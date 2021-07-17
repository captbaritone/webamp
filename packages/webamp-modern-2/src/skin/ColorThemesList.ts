import GuiObj from "./makiClasses/GuiObj";
import UI_ROOT from "../UIRoot";
import { removeAllChildNodes } from "../utils";

export default class ColorThemesList extends GuiObj {
  _select: HTMLSelectElement = document.createElement("select");

  constructor() {
    super();
    this._div.appendChild(this._select);
  }
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

  _renderGammaSets() {
    removeAllChildNodes(this._select);
    this._select.setAttribute("multiple", "1");
    this._select.style.position = "absolute";
    this._select.style.width = "100%";
    this._select.style.height = "100%";
    for (const key of UI_ROOT._gammaSets.keys()) {
      const option = document.createElement("option");
      option.value = key;
      option.innerText = key;
      this._select.appendChild(option);
    }
  }

  handleAction(
    action: string,
    param: string | null,
    actionTarget: string | null
  ) {
    switch (action) {
      case "colorthemes_switch":
        const selected = this._select.value;
        if (selected != null) {
          UI_ROOT.enableGammaSet(selected);
        }
        return true;
    }
    return false;
  }

  draw() {
    super.draw();
    this._div.setAttribute("data-obj-name", "ColorThemes:List");
    this._renderGammaSets();
  }
}
