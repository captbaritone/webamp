import GuiObj from "./GuiObj";
import { UIRoot } from "../../UIRoot";
import TrueTypeFont from "../TrueTypeFont";
import BitmapFont from "../BitmapFont";
import {
  integerToTime,
  removeAllChildNodes,
  num,
  px,
  toBool,
  clamp,
} from "../../utils";
import Timer from "./Timer";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Ctext.2F.3E_.26_.3CWasabi:Text.2F.3E
export default class Text extends GuiObj {
  static GUID = "efaa867241fa310ea985dcb74bcb5b52";
  _display: string;
  _displayValue: string = "";
  _displayHandler: DisplayHandler; //pasive handler
  _disposeDisplaySubscription: Function;
  _disposeTrackChangedSubscription: Function;
  _text: string;
  _bold: boolean;
  _forceuppercase: boolean;
  _forcelowercase: boolean;
  _align: string = "left";
  _valign: string = "center";
  _font_id: string;
  _font_obj: TrueTypeFont | BitmapFont;
  _fontSize: number;
  _color: string;
  _ticker: string = "off"; // "scroll" | "bounce" | "off"
  _paddingX: number = 2;
  _timeColonWidth: number | null = null;
  _textWrapper: HTMLElement;
  _scrollTimer: Timer;
  _scrollDirection: -1 | 1;
  _scrollPaused: boolean = false;
  _scrollLeft: number = 0; // logically, not visually
  _textFullWidth: number; //calculated, not runtime by css
  _shadowColor: string;
  _shadowX: number = 0;
  _shadowY: number = 0;
  _drawn: boolean = false; // needed to check has parents

  constructor(uiRoot: UIRoot) {
    super(uiRoot);
    this._uiRoot = uiRoot;
    this._textWrapper = document.createElement("wrap");
    this._div.appendChild(this._textWrapper);
  }

  setXmlAttr(key: string, value: string): boolean {
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key.toLowerCase()) {
      case "display":
        // (str) Either a specific system display string or the string identifier of a text feed. Setting this value will override the text parameter. See below.
        this._setDisplay(value);
        break;
      case "text":
      case "default":
        // (str) A static string to be displayed.
        // console.log('THETEXT', value)
        this._text = value;
        this._renderText();
        break;
      case "bold":
        // (str) A static string to be displayed.
        this._bold = toBool(value);
        this._prepareCss();
        break;
      case "forceupcase":
      case "forceuppercase":
        // (bool) Force the system to make the display string all uppercase before display.
        this._forceuppercase = toBool(value);
        this._prepareCss();
        this._renderText();
        break;
      case "font":
        // (id) The id of a bitmapfont or truetypefont element. If no element with that id can be found, the OS will be asked for a font with that name instead.
        this._font_id = value;
        this._autoDetectFontType();
        this.ensureFontSize();
        this._prepareCss();
        break;
      case "align":
        // (str) One of the following three possible strings: "left" "center" "right" -- Default is "left."
        this._align = value;
        this._prepareCss();
        break;

      case "valign":
        // (str) One of the following three possible strings: "top" "center" "bottom" -- Default is "center."
        this._valign = value;
        this._prepareCss();
        break;

      case "fontsize":
        // (int) The size to render the chosen font.
        this._fontSize = num(value);
        this.ensureFontSize();
        this._invalidateFullWidth();
        this._prepareCss();
        break;
      case "color":
        // (int[sic?]) The comma delimited RGB color of the text.
        this._color = value;
        this._prepareCss();
        break;
      case "ticker":
        /// (bool) Setting this flag causes the object to scroll left and right if the text does not fit the rectangular area of the text object.
        if (value == "0") value = "off";
        this._ticker = value.toLowerCase();
        break;
      case "timecolonwidth":
        // (int) How many extra pixels wider or smaller should the colon be when displaying time. Default is -1.
        this._timeColonWidth = num(value);
        this._prepareCss();
        this._renderText();
        break;

      case "shadowcolor":
        // (int) The comma delimited RGB color for underrendered shadow text.
        this._shadowColor = value;
        this._prepareCss();
        break;
      case "shadowx":
        // (int) The x offset of the shadowrender.
        this._shadowX = num(value);
        this._prepareCss();
        break;
      case "shadowy":
        // (int) The x offset of the shadowrender.
        this._shadowY = num(value);
        this._prepareCss();
        break;

      /*
antialias - (bool) Setting this flag causes the text to be rendered antialiased if possible.
default - (str) A parameter alias for text.
align - (str) One of the following three possible strings: "left" "center" "right" -- Default is "left."
timeroffstyle - (int) How to display an empty timer: "0" = "  : ", "1" = "00:00", and "2"="" (if one is displaying time)
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

  _autoDetectFontType() {
    if (this._font_id) {
      this._font_obj = this._uiRoot.getFont(this._font_id);
      if (!this._font_obj) {
        const newFont = new TrueTypeFont();
        newFont._inlineFamily = this._font_id;
        this._uiRoot.addFont(newFont);
        this._font_obj = newFont;
      }
    }
  }

  // only applicable for TrueType Font
  _autoDetectColor() {
    if (this._color) {
      if (this._color.split(",").length == 3) {
        this._div.style.color = `rgb(${this._color})`;
        return;
      }
      const color = this._uiRoot.getColor(this._color);
      if (color) {
        this._div.style.color = `var(${color.getCSSVar()}, ${color.getRgb()})`;
      }
    }
  }

  ensureFontSize() {
    if (this._font_obj instanceof TrueTypeFont && this._fontSize) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      context.font = `${this._fontSize}px ${
        this._font_obj.getFontFamily() || "Arial"
      }`;
      const metrics = context.measureText("IWjgyFH");
      const fontHeight =
        metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

      this._fontSize =
        this._fontSize * (1 - (1.0 * fontHeight - this._fontSize) / (1.0 * this._fontSize));
    }
  }

  init() {
    super.init();
    if (this._ticker && this._ticker != "off") {
      this._prepareScrolling();
    }
    this._div.addEventListener("click", this._onClick);
    if(this._displayHandler!=null){
      this._displayHandler.init()
    } 
  }

  _onClick = () => {
    if (this._display.toLowerCase() == "time") {
      this._uiRoot.audio.toggleRemainingTime();
      this.setDisplayValue(integerToTime(this._uiRoot.audio.getCurrentTime()));
    }
  };

  _setDisplay(display: string) {
    if (display.toLowerCase() === this._display?.toLowerCase()) {
      return;
    }
    if (this._disposeDisplaySubscription != null) {
      this._disposeDisplaySubscription();
    }
    if (this._disposeTrackChangedSubscription != null) {
      this._disposeTrackChangedSubscription();
    }
    this._display = display;
    switch (this._display.toLowerCase()) {
      case "":
        this._displayValue = "";
        break;
      case "pe_info":
        this._displayValue = "pe_info";
        break;
      case "vid_info":
        this._displayValue = "vid_info";
        break;
      case "time":
        this._disposeDisplaySubscription =
          this._uiRoot.audio.onCurrentTimeChange(() => {
            this.setDisplayValue(
              integerToTime(this._uiRoot.audio.getCurrentTime())
            );
          });
        this.setDisplayValue(
          integerToTime(this._uiRoot.audio.getCurrentTime())
        );
        break;
      case "songlength":
        this._displayValue = "5:58";
        break;
      case "songname":
      case "songtitle":
        this._displayValue = this._uiRoot.playlist.getCurrentTrackTitle();
        this._disposeTrackChangedSubscription = this._uiRoot.playlist.on(
          "trackchange",
          () => {
            this._displayValue = this._uiRoot.playlist.getCurrentTrackTitle();
            this._renderText();
          }
        );
        break;
      case "songbitrate":
      case "songsamplerate":
      case "songinfo":
        this._displayValue = "112kbps stereo 44.";
        break;
      case "componentbucket":
        this._displayValue = "componentbucket";
        break;
      case "custom": // not winamp api
        // needed by a custom DisplayHandler
        break;
      default:
        throw new Error(`Unknown text display name: "${this._display}".`);
    }
    this._renderText();
  }

  setDisplayValue(newValue: string) {
    if (newValue !== this._displayValue) {
      this._displayValue = newValue;
      this._renderText();
      this._uiRoot.vm.dispatch(this, "ontextchanged", [
        { type: "STRING", value: this.gettext() },
      ]);
    }
  }

  ontextchanged(s: string) {
    this._uiRoot.vm.dispatch(this, "ontextchanged", [
      { type: "STRING", value: this.gettext() },
    ]);
  }

  gettext(): string {
    if ((this._text || "").startsWith(":") && this._drawn) {
      const layout = this.getparentlayout();
      if (layout) {
        return layout.getcontainer()._name || this._text;
      }
    }
    if (this._display) {
      if (this._display == 'songinfo'){
        const track =  this._uiRoot.playlist.currentTrack()        
        if(track){
          const m = track.metadata;
          return `${m.bitrate}kbps ${m.channelMode} ${Math.floor(m.sampleRate / 1000)}khz`
        }
      }

      return this._displayValue;
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

  //to speedup animation like text-scrolling, we spit rendering processes.
  //This function is only rendering static styles
  _prepareCss() {
    if (!this._font_obj && this._font_id) {
      this._font_obj = this._uiRoot.getFont(this._font_id);
    }
    const font = this._font_obj;
    if (font instanceof BitmapFont) {
      this._textWrapper.setAttribute("font", "BitmapFont");
      //? font-size
      this._div.style.setProperty(
        "--fontSize",
        (this._fontSize || "~").toString()
      );
      //? text-align
      if (this._align != "center") {
        this._div.style.setProperty("--align", this._align);
      } else {
        this._div.style.removeProperty("--align");
      }
      //? vertical align
      if (this._valign != "center") {
        this._div.style.setProperty(
          "--valign",
          this._valign == "top" ? "flex-start" : "flex-end"
        );
      } else {
        this._div.style.removeProperty("--valign");
      }
      //? margin
      this._div.style.setProperty(
        "--hspacing",
        px(font.getHorizontalSpacing())
      );

      this.setBackgroundImage(font);
      this._div.style.backgroundSize = "0"; //disable parent background, because only children will use it
      this._div.style.lineHeight = px(this._div.getBoundingClientRect().height);
      this._div.style.setProperty("--charwidth", px(font._charWidth));
      this._div.style.setProperty("--charheight", px(font._charHeight));
    } else {
      this._autoDetectColor();
      if (this._shadowColor) {
        this._div.style.textShadow = `${this._shadowX}px ${this._shadowY}px rgb(${this._shadowColor})`;
      }
      if (font instanceof TrueTypeFont) {
        this._textWrapper.setAttribute("font", "TrueType");

        this._div.style.fontFamily = font.getFontFamily();
        this._div.style.fontSize = px(this._fontSize ?? 11);
        // this._div.style.lineHeight = px(this._fontSize ?? 11);
        // this._div.style.lineHeight = px(this._div.getBoundingClientRect().height);
        this._div.style.lineHeight = '1';
        this._div.style.textTransform = this._forceuppercase
          ? "uppercase"
          : "none";
        if (this._bold) {
          this._div.style.fontWeight = "bold";
        }
        if (this._align) {
          this._div.style.textAlign = this._align;
        }
      } else if (font == null) {
        this._div.style.setProperty("--fontMode", "Null");
        this._div.style.fontFamily = "Arial";
      } else {
        throw new Error("Unexpected font");
      }
    }
  }

  _renderText() {
    //TODO: invalidating text width is only important when srolling?
    if(this._ticker != "off")
      this._invalidateFullWidth();

    const font = this._font_obj;
    if (font instanceof BitmapFont) {
      this._renderBitmapFont(font);
    } else {
      // console.log('THETEXT', this.gettext())
      // this._textWrapper.innerHTML = '<pre>'+ this.gettext().replace(/[\n\r]/g,'<br/>') + '</pre>';
      // this._textWrapper.innerHTML = '<div>'+ this.gettext().replace(/[\n]/g,'<br/>') + '</div>';
      // this._textWrapper.innerHTML = '<pre>'+ this.gettext() + '</pre>';
      this._textWrapper.innerText = this.gettext();
      //? workaround of titlebar.text
      // this._div.style.lineHeight = this._div.style.height;
    }
  }

  _useColonWidth() {
    if (this._timeColonWidth == null || this._display == null) {
      return false;
    }
    switch (this._display.toLowerCase()) {
      case "time":
      case "timeelapsed":
      case "timeremaining":
        return true;
    }
    return false;
  }

  _renderBitmapFont(font: BitmapFont) {
    removeAllChildNodes(this._textWrapper);
    this._div.style.whiteSpace = "nowrap";
    const useColonWidth = this._useColonWidth();
    if (this.gettext() != null) {
      for (const char of this.gettext().split("")) {
        const charNode = font.renderLetter(char);
        // TODO: This is quite hacky.
        if (char === ":" && useColonWidth) {
          charNode.style.width = px(this._timeColonWidth);
        }
        this._textWrapper.appendChild(charNode);
      }
    }
  }

  _renderBitmapFont1(font: BitmapFont) {
    this._div.style.whiteSpace = "nowrap";
    let s = "";
    for (const char of this.gettext().split("")) {
      s += `<i>${char}</i>`;
    }
    this._div.innerHTML = s;
  }

  // it is needed for scrolltext.
  _invalidateFullWidth() {
    const font = this._font_obj;
    if (font instanceof BitmapFont) {
      this._textFullWidth = this._getBitmapFontTextWidth(font);
    } else {
      this._textFullWidth = this._getTrueTypeTextWidth(font);
    }
    this._div.style.setProperty("--full-width", px(this._textFullWidth));
  }

  getautowidth(): number {
    this._invalidateFullWidth();
    let textWidth = this._textFullWidth;
    if (this._relatw == "1") {
      textWidth += this._w * -1;
    }
    return textWidth;
  }

  gettextwidth(): number {
    return this.getautowidth();
  }

  _getBitmapFontTextWidth(font: BitmapFont): number {
    const charWidth = font._charWidth;
    return this.gettext().length * charWidth + this._paddingX * 2;
  }

  _getTrueTypeTextWidth(font: TrueTypeFont): number {
    /**
     * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
     *
     * @param {String} text The text to be rendered.
     * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
     *
     * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
     */
    const self = this;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = `${this._fontSize || 11}px ${
      (font && font.getFontFamily()) || "Arial"
    }`;
    const metrics = context.measureText(this.gettext());
    return metrics.width + self._paddingX * 2;
  }

  draw() {
    this._drawn = true;
    super.draw();
    this._renderText();

    // this._div.style.removeProperty("line-height");
    this._div.classList.add("webamp--img");
  }

  _prepareScrolling() {
    this._scrollDirection = -1;
    const timer = (this._scrollTimer = new Timer(this._uiRoot));
    timer.setdelay(50);
    timer.setOnTimer(() => {
      this.doScrollText();
    });
    timer.start();
  }

  doScrollText() {
    const curL = this._scrollLeft;
    const step = 1; //pixel
    const idle = 20; //when overflow
    const container = this._div.getBoundingClientRect();
    const wrapperWidth = this._textFullWidth;
    if (wrapperWidth <= container.width) return;
    var l = curL + step * this._scrollDirection;
    if (l + wrapperWidth < container.width - step * idle) {
      // too left
      this._scrollDirection *= -1; //? flip dir!
      l = curL + step * this._scrollDirection;
    } else if (l > step * idle) {
      // too right
      this._scrollDirection *= -1; //? flip dir!
      l = curL + step * this._scrollDirection;
    }
    this._scrollLeft = l;
    l = clamp(l, -(wrapperWidth - container.width), 0);
    this._textWrapper.style.left = px(Math.round(l));
  }

  dispose() {
    if (this._disposeDisplaySubscription != null) {
      this._disposeDisplaySubscription();
    }
    if(this._displayHandler!=null){
      this._displayHandler.dispose()
    } 
  }

  /*
  
extern String Text.getText();
extern int Text.getTextWidth();
extern Text.onTextChanged(String newtxt);
  */

  /**
   * 
   * @param Handler a class inherited from DisplayHandler
   */
  setDisplayHandler(Handler: DisplayHandlerClass){
    
    if(this._displayHandler!=null){
      this._displayHandler.dispose()
    } 
    this._displayHandler = new Handler(this); 
  }
}

type DisplayHandlerClass = typeof DisplayHandler;

export class DisplayHandler {
  _text: Text;
  _uiRoot: UIRoot;
  _subscription: Function;

  constructor(text: Text) {
    this._text = text;
    this._uiRoot = text._uiRoot;
    this._subscription = () => {}; // deFault empty
  }

  init(): void {
    //* possible add a hook to uiRoot
    //* to update text, call: 
    //*   `this._text.setDisplayValue(newTextValue)`
  }

  dispose(): void {
    this._subscription();
  }
}