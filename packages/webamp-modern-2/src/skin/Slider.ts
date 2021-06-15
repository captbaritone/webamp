import GuiObj from "./GuiObj";

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

  /*
  extern Slider.onSetPosition(int newpos);
  extern Slider.onPostedPosition(int newpos);
  extern Slider.onSetFinalPosition(int pos);
  extern Slider.setPosition(int pos);
  extern Int Slider.getPosition();
  extern Slider.lock(); // locks descendant core collbacks
  extern Slider.unlock(); // unloads the
  */
}
