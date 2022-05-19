import UI_ROOT from "../../UIRoot";
import { integerToTime, num } from "../../utils";
import BitmapFont from "../BitmapFont";
import GuiObj from "../makiClasses/GuiObj";
import Text from "../makiClasses/Text";

export default class TimeFace extends Text {
  _displayValue: string = "";
  _digit: number = null;
  _disposeDisplaySubscription: Function;

  getElTag(): string {
    return "text";
  }

  setXmlAttr(key: string, value: string): boolean {
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key.toLowerCase()) {
      case "digit":
        // (str) Either a specific system display string or the string identifier of a text feed. Setting this value will override the text parameter. See below.
        this._digit = num(value);
        break;
    }
  }

  // init(): void {
  //   super.init();
  //   this._disposeDisplaySubscription = UI_ROOT.audio.onCurrentTimeChange(() => {
  //     this.setDisplayValue(integerToTime(UI_ROOT.audio.getCurrentTime()));
  //   });
  //   this.setDisplayValue(integerToTime(UI_ROOT.audio.getCurrentTime()));
  // }

  // _invalidateFullWidth() {
  //   if (this._digit != null && this._font_obj instanceof BitmapFont) {
  //     return this._font_obj._charWidth;
  //   }
  //   return super._invalidateFullWidth()
  // }
  _getBitmapFontTextWidth(font: BitmapFont): number {
    if (this._digit != null) {
      const charWidth = font._charWidth;
      return charWidth /* + this._paddingX */;
    }
    return super._getBitmapFontTextWidth(font);
  }

  setDisplayValue(newValue: string) {
    if (newValue !== this._displayValue) {
      const font = this._font_obj;
      this._displayValue = newValue;
      if (this._digit != null && font instanceof BitmapFont) {
        this._renderDigit(font);
        return;
      }
      // super.setDisplayValue(newValue)
      this._renderText();
    }
  }

  _renderDigit(font: BitmapFont) {
    let text = this.gettext();
    if (text != null) {
      text = text.replace(":", "");
      if (text.length < 4) {
        text = "0" + text;
      }
      const char = text[this._digit - 1];
      const charNode = font.renderLetter(char);
      this._textWrapper.replaceChildren(charNode);
    }
  }

  // _renderText() {
  //   this._div.textContent = this._displayValue;
  // }
}
