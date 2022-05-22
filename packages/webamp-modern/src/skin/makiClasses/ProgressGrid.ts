import Grid from "./Grid";
import { UIRoot } from "../../UIRoot";
import { px } from "../../utils";

export default class ProgressGrid extends Grid {
  static GUID = "OFFICIALLY-NO-GUID";
  _disposeDisplaySubscription: () => void | null = null;

  constructor(uiRoot: UIRoot) {
    super(uiRoot);
    this._disposeDisplaySubscription = this._uiRoot.audio.onCurrentTimeChange(
      () => {
        this._middle.style.width = `${
          this._uiRoot.audio.getCurrentTimePercent() * 100
        }%`;
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
    super.draw();
    this._div.style.removeProperty("display");
  }
}
