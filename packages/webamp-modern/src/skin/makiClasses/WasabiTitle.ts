import { num, px, relative } from "../../utils";
import Group from "./Group";

export default class WasabiTitleBar extends Group {
  static GUID = "7DFD32444e7c3751AE8240BF33DC3A5F";
  _padtitleleft: number = 0;
  _padtitleright: number = 0;

  setXmlAttr(_key: string, value: string): boolean {
    const lowerkey = _key.toLowerCase();
    if (super.setXmlAttr(lowerkey, value)) {
      return true;
    }
    switch (lowerkey) {
      case "padtitleleft":
        this._padtitleleft = num(value);
        this._renderX();
        break;
      case "padtitleright":
        this._padtitleright = num(value);
        this._renderWidth();
        break;
      default:
        return false;
    }
    return true;
  }

  _renderX() {
    this._div.style.left =
      this._relatx == "1"
        ? relative(this._padtitleleft + this._x ?? 0)
        : px(this._padtitleleft + this._x ?? 0);
  }

  _renderWidth() {
    this._div.style.width =
      this._relatw == "1"
        ? relative(
            -this._padtitleleft + -this._padtitleright + this._w ?? 0
          )
        : px(-this._padtitleright + this.getwidth());
  }

  init() {
    super.init();
    this._uiRoot.vm.dispatch(this, "onresize", [
      { type: "INT", value: 0 },
      { type: "INT", value: 0 },
      { type: "INT", value: this.getwidth() },
      { type: "INT", value: this.getheight() },
    ]);
  }
}
