import Grid from "./Grid";
import UI_ROOT from "../../UIRoot";
import { px } from "../../utils";

// http://wiki.winamp.com/wiki/XML_GUI_Objects
export default class ProgressGrid extends Grid {
//   static GUID = "5ab9fa1545579a7d5765c8aba97cc6a6";
_disposeDisplaySubscription: () => void | null = null;

  constructor(){
      super();
      this._disposeDisplaySubscription = UI_ROOT.audio.onCurrentTimeChange(
        () => {
            this._middle.style.width = `${UI_ROOT.audio.getCurrentTimePercent()*100}%`;
        }
      );
  }
  
  setXmlAttr(key: string, value: string): boolean {
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "orientation":
        break;
      default:
        return false;
    }
    return true;
  }

  draw() {
      super.draw()
      this._div.style.removeProperty('display')
  }

}
