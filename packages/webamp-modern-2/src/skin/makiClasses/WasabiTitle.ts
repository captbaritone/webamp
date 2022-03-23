// import Text from "./Text";
import UI_ROOT from "../../UIRoot";
import { num, px, relative } from "../../utils";
import Group from "./Group";

export default class WasabiTitleBar extends Group {
  static GUID = "7DFD324437514e7cBF4082AE5F3ADC33";
  _padtitleleft: number = 0;
  _padtitleright: number = 0;

  setXmlAttr(_key: string, value: string): boolean {
    const lowerkey = _key.toLowerCase();
    // console.log('wasabi:frame.key=',lowerkey,':=', value)
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
    this._div.style.left = this._relatx=='1' ? relative(this._padtitleleft + this._x ?? 0) : px(this._padtitleleft + this._x ?? 0);
    // this._div.setAttribute('pad-left', this._padtitleleft.toString())
  }
  
  _renderWidth() {
    // this._div.setAttribute('pad-right', this._padtitleright.toString())
    // this._div.setAttribute('_width', this._width.toString())
    // this._div.setAttribute('_width_', this.getwidth().toString())
    // if(this._autowidthsource) return;
    this._div.style.width = this._relatw=='1' ? relative(-this._padtitleleft + -this._padtitleright + this._width??0) : px(-this._padtitleright + this.getwidth());
  }


  init() {
    super.init()
    UI_ROOT.vm.dispatch(this, "onresize", [
      { type: "INT", value: 0 },
      { type: "INT", value: 0 },
      { type: "INT", value: this.getwidth() },
      { type: "INT", value: this.getheight() },
    ]);
  }
  
}
