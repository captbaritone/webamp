import Group from "./Group";
import UI_ROOT from "../../UIRoot";
import { num } from "../../utils";

export default class WasabiFrame extends Group {
  __inited: boolean = false;
  _content: string;
  _shade: string;
  _padtitleleft: string;
  _padtitleright: string;

  getElTag(): string {
    return "wasabiframe";
  }

  setXmlAttr(_key: string, value: string): boolean {
    const lowerkey = _key.toLowerCase();
    // console.log('wasabi:frame.key=',lowerkey,':=', value)
    if (super.setXmlAttr(lowerkey, value)) {
      return true;
    }
    switch (lowerkey) {
      case "content":
        this._content = value;
        break;
      case "shade":
        this._shade = value;
        break;
      case "padtitleleft":
        this._padtitleleft = value;
        break;
      case "padtitleright":
        this._padtitleright = value;
        break;
      default:
        return false;
    }
    return true;
  }

  init() {
    // console.error('wasabi:standard->> INITing:', this._content)
    if (this.__inited) return;
    this.__inited = true;

    super.init();
    // console.error('wasabi:standard->> sending onsetxuiparam:', this._content)
    // UI_ROOT.vm.dispatch(this._systemObjects[0], "onsetxuiparam", [
    // UI_ROOT.vm.dispatch(this, "onsetxuiparam", [
    //   {type: "STRING", value:'content'},
    //   {type:"STRING", value:this._content}
    // ]);

    for (const systemObject of this._systemObjects) {
      // systemObject.init();
      ["content", "padtitleleft", "padtitleright", "shade"].forEach((att) => {
        const myValue = this["_" + att];
        if (myValue != null) {
          UI_ROOT.vm.dispatch(systemObject, "onsetxuiparam", [
            { type: "STRING", value: att },
            { type: "STRING", value: myValue },
          ]);
        }
      });
    }
  }
}
