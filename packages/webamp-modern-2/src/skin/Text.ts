import GuiObj from "./GuiObj";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Ctext.2F.3E_.26_.3CWasabi:Text.2F.3E
export default class Text extends GuiObj {
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
  
extern Text.setText(String txt); // changes the display/text="something" param
extern Text.setAlternateText(String txt); // overrides the display/text parameter with a custom string, set "" to cancel
extern String Text.getText();
extern int Text.getTextWidth();
extern Text.onTextChanged(String newtxt);
  */
}
