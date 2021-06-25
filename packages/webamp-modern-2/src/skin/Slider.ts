import GuiObj from "./GuiObj";
import { VM } from "./VM";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Cslider.2F.3E_.26_.3CWasabi:HSlider.2F.3E_.26_.3CWasabi:VSlider.2F.3E
export default class Slider extends GuiObj {
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

  // extern Int Slider.getPosition();
  getposition(): number {
    return 0;
  }

  // extern Slider.onPostedPosition(int newpos);
  onsetposition(newPos: number) {
    VM.dispatch(this, "onsetposition", [{ type: "INT", value: newPos }]);
  }

  /*
  extern Slider.onSetPosition(int newpos);
  extern Slider.onSetFinalPosition(int pos);
  extern Slider.setPosition(int pos);
  extern Slider.lock(); // locks descendant core collbacks
  extern Slider.unlock(); // unloads the
  */
}
