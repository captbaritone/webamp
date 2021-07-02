import GuiObj from "./GuiObj";
import * as Utils from "../utils";
import UI_ROOT from "../UIRoot";
import TrueTypeFont from "./TrueTypeFont";
import BitmapFont from "./BitmapFont";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Ctext.2F.3E_.26_.3CWasabi:Text.2F.3E
export default class Text extends GuiObj {
  _display: string;
  _text: string;
  _bold: boolean;
  _forceupcase: boolean;
  _forceuppercase: boolean;
  _forcelocase: boolean;
  _forcelowercase: boolean;
  _align: string;
  _font: string;
  _fontSize: number;
  _color: string;
  _ticker: boolean;
  setXmlAttr(key: string, value: string): boolean {
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "display":
        // (str) Either a specific system display string or the string identifier of a text feed. Setting this value will override the text parameter. See below.
        this._display = value;
        this._renderText();
        break;
      case "text":
        // (str) A static string to be displayed.
        this._text = value;
        this._renderText();
        break;
      case "bold":
        // (str) A static string to be displayed.
        this._bold = Utils.toBool(value);
        break;
      case "forceupcase":
        // (bool) Force the system to make the display string all uppercase before display.
        this._forceupcase = Utils.toBool(value);
        break;
      case "forceuppercase":
        // (bool) Force the system to make the display string all uppercase before display.
        this._forceuppercase = Utils.toBool(value);
        break;
      case "font":
        // (id) The id of a bitmapfont or truetypefont element. If no element with that id can be found, the OS will be asked for a font with that name instead.
        this._font = value;
        this._renderText();
        break;
      case "align":
        // (str) One of the following three possible strings: "left" "center" "right" -- Default is "left."
        this._align = value;
        break;
      case "fontsize":
        // (int) The size to render the chosen font.
        this._fontSize = Utils.num(value);
        break;
      case "color":
        // (int[sic?]) The comma delimited RGB color of the text.
        this._color = value;
        break;
      case "ticker":
        /// (bool) Setting this flag causes the object to scroll left and right if the text does not fit the rectangular area of the text object.
        this._ticker = Utils.toBool(value);
        break;
      /*
antialias - (bool) Setting this flag causes the text to be rendered antialiased if possible.
default - (str) A parameter alias for text.
align - (str) One of the following three possible strings: "left" "center" "right" -- Default is "left."
valign - (str) One of the following three possible strings: "top" "center" "bottom" -- Default is "top."
shadowcolor - (int) The comma delimited RGB color for underrendered shadow text.
shadowx - (int) The x offset of the shadowrender.
shadowy - (int) The y offset of the shadowrender.
timeroffstyle - (int) How to display an empty timer: "0" = "  : ", "1" = "00:00", and "2"="" (if one is displaying time)
timecolonwidth - (int) How many extra pixels wider or smaller should the colon be when displaying time. Default is -1.
nograb - (bool) Setting this flag will cause the text object to ignore left button down messages. Default is off.
showlen - (bool) Setting this flag will cause the text display to be appended with the length in minutes and seconds of the current song. Default is off.
forcefixed - (bool) Force the system to attempt to render the display string with fixed-width font spacing.
forcelocase - (bool) Force the system to make the display string all lowercase before display.
forcelowercase - (bool) Force the system to make the display string all lowercase before display.
wrap - (bool) Setting this flag will cause the text to wrap in its rectangular space. Default is off.
dblclickaction - (str) A string in the form "SWITCH;layout" where layout is the id of a layout in this object's parent container. No other actions function on this object. This action is deprecated.
offsetx - (int) Extra pixels to be added to or subtracted from the calculated x value for the display string to render.
offsety - (int) Extra pixels to be added to or subtracted from the calculated x value for the display string to render.
*/
      default:
        return false;
    }
    return true;
  }

  getText() {
    if (this._display) {
      switch (this._display.toLowerCase()) {
        case "pe_info":
          return "pe_info";
        case "vid_info":
          return "vid_info";
        case "time":
          return "1:58";
        case "songlength":
          return "5:58";
        case "songname":
          return "Niente da Caprie (3";
        case "songinfo":
          return "112kbps stereo 44.";
        case "componentbucket":
          return "componentbucket";
        default:
          throw new Error(`Unknown text display name: "${this._display}".`);
      }
    }
    return this._text ?? "";
  }

  // extern Text.setText(String txt); // changes the display/text="something" param
  settext(txt: string) {
    if (this._text != txt) {
      this._text = txt;
      this._renderText();
    }
  }
  // overrides the display/text parameter with a custom string, set "" to cancel
  setalternatetext(txt: string) {
    // TODO
  }

  _renderText() {
    this._div.innerHTML = "";
    if (this._font) {
      const font = UI_ROOT.getFont(this._font);
      if (font instanceof TrueTypeFont) {
        this._div.innerText = this.getText();
        this._div.style.fontFamily = font.getFontFamily();
      } else if (font instanceof BitmapFont) {
        this._div.style.whiteSpace = "nowrap";
        if (this.getText() != null) {
          for (const char of this.getText().split("")) {
            this._div.appendChild(font.renderLetter(char));
          }
        }

        //
      } else if (font == null) {
        this._div.innerText = this.getText();
        this._div.style.fontFamily = "Ariel";
      } else {
        throw new Error("Unexpected font");
      }
    }
  }

  draw() {
    super.draw();
    this._renderText();
    this._div.style.overflow = "hidden";
    if (this._bold) {
      this._div.style.fontWeight = "bold";
    }
    if (this._align) {
      this._div.style.textAlign = this._align;
    }

    /*
    if (this._color) {
      console.log(this._color);
      const color = UI_ROOT.getColor(this._color);
      console.log({ color });
      this._div.style.color = color.getRbg();
    }
    */

    this._div.style.fontSize = Utils.px(this._fontSize ?? 14);
  }

  /*
  
extern String Text.getText();
extern int Text.getTextWidth();
extern Text.onTextChanged(String newtxt);
  */
}
