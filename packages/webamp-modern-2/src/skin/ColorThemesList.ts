import GuiObj from "./makiClasses/GuiObj";
import UI_ROOT from "../UIRoot";
import { removeAllChildNodes, toBool } from "../utils";

export default class ColorThemesList extends GuiObj {
  _select: HTMLSelectElement = document.createElement("select");
  _nohscroll: boolean = false;
  _nocolheader: boolean = false;

  constructor() {
    super();
    this._div.appendChild(this._select);
    this._registerEvents();
  }
  setXmlAttr(key: string, value: string): boolean {
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    const _key = key.toLowerCase();
    switch (_key) {
      // see skin: D-Reliction
      case "nocolheader":
        this._nocolheader = toBool(value);
        break;
      case "nohscroll":
        this._nohscroll = toBool(value);
        break;
      default:
        return false;
    }
    return true;
  }

  _registerEvents() {
    this._select.addEventListener("dblclick", () => {
      this.handleAction("colorthemes_switch");
    });
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
      option.innerText = UI_ROOT._gammaNames[key];
      this._select.appendChild(option);
    }

    // Overflow
    this._select.style.overflowY = "scroll";
    if (this._nohscroll) {
      this._select.style.overflowX = "hidden";
    } else {
      this._select.style.overflowX = "scroll";
    }

    // column header
    if (this._nocolheader) {
      this._select.style.setProperty("--colheader", null);
    } else {
      this._select.style.setProperty("--colheader", "'Theme'");
    }

    this._select.value = UI_ROOT._activeGammaSetName;
    this._renderBoldSelection();
  }

  _renderBoldSelection() {
    Array.from(this._select.options).forEach((option_element) => {
      if (option_element.value === UI_ROOT._activeGammaSetName) {
        option_element.setAttribute("selected", "selected");
      } else {
        option_element.removeAttribute("selected");
      }
    });
  }

  handleAction(
    action: string,
    param: string | null = null,
    actionTarget: string | null = null
  ) {
    switch (action) {
      case "colorthemes_switch":
        const selected = this._select.value;
        if (selected != null) {
          UI_ROOT.enableGammaSet(selected);
          this._renderBoldSelection();
        }
        return true;
      case "colorthemes_previous":
        if(this._select.selectedIndex > 0) {
          this._select.selectedIndex--;
          return this.handleAction('colorthemes_switch')
        }
        break
      case "colorthemes_next":
        if(this._select.selectedIndex < this._select.options.length) {
          this._select.selectedIndex++;
          return this.handleAction('colorthemes_switch')
        }
        break
    }
    return false;
  }

  draw() {
    super.draw();
    this._div.setAttribute("data-obj-name", "ColorThemes:List");
    this._renderGammaSets();
  }
}
