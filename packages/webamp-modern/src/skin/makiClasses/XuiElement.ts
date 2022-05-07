import Group from "./Group";
import UI_ROOT from "../../UIRoot";
import { num } from "../../utils";

export default class XuiElement extends Group {
  __inited: boolean = false;

  _unhandledXuiParams: { key: string; value: string }[] = []; //https://github.com/captbaritone/webamp/pull/1161#discussion_r830527754
  //   _content: string;
  //   _shade: string;
  //   _padtitleleft: string;
  //   _padtitleright: string;

  getElTag(): string {
    return "group";
  }

  setXmlAttr(_key: string, value: string): boolean {
    const lowerkey = _key.toLowerCase();
    // console.log('wasabi:frame.key=',lowerkey,':=', value)
    if (super.setXmlAttr(lowerkey, value)) {
      return true;
    }
    this._unhandledXuiParams.push({ key: lowerkey, value });
    return true;
  }

  init() {
    if (this.__inited) return;
    this.__inited = true;

    super.init();

    for (const systemObject of this._systemObjects) {
      this._unhandledXuiParams.forEach(({ key, value }) => {
        UI_ROOT.vm.dispatch(systemObject, "onsetxuiparam", [
          { type: "STRING", value: key },
          { type: "STRING", value: value },
        ]);
      });
      //   ["content", "padtitleleft", "padtitleright", "shade"].forEach((att) => {
      //     const myValue = this["_" + att];
      //     if (myValue != null) {
      //       UI_ROOT.vm.dispatch(systemObject, "onsetxuiparam", [
      //         { type: "STRING", value: att },
      //         { type: "STRING", value: myValue },
      //       ]);
      //     }
      //   });
    }
    this._unhandledXuiParams = [];
  }
}
