import { ensureVmInt, num, px } from "../../utils";
import Layer from "./Layer";

//? Images is used by classic skin to change background of Volume & Balance only.
// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Cimages.2F.3E
export default class Images extends Layer {
  static GUID = "OFFICIALLY-NO-GUID";
  _currentFrame: number = 0;
  _frameCount: number;
  _frameHeight: number;
  _source: string;

  getElTag(): string {
    return "animatedlayer";
  }

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "source":
        this._source = value.toLowerCase();
        break;
      case "images":
        this._image = value;
        this._renderBackground();
        break;
      case "imagesspacing":
        this._frameHeight = num(value);
        break;
      default:
        return false;
    }
    return true;
  }

  init() {
    super.init();
    this._frameCount =
      Math.ceil(this._getImageHeight() / this._frameHeight) - 1;
    if (this._source == "volume") {
      //TODO: make disposable:
      this._uiRoot.audio.onVolumeChanged(this.updateVolume);
      this.updateVolume();
    } else if (this._source == "balance") {
      //TODO: make disposable:
      this._uiRoot.audio.onBalanceChanged(this.updateBalance);
      this.updateBalance();
    }
  }

  updateVolume = () => {
    const vol = this._uiRoot.audio.getVolume(); //0..1
    this.gotoFrame(vol * this._frameCount);
  };

  updateBalance = () => {
    const balance = this._uiRoot.audio.getBalance(); //0..1
    this.gotoFrame(balance * this._frameCount);
  };

  _getImageHeight(): number {
    const bitmap = this._uiRoot.getBitmap(this._image);
    if (bitmap) {
      return bitmap.getHeight();
    }
    return null;
  }

  gotoFrame(framenum: number) {
    this._currentFrame = Math.ceil(framenum);
    this._renderFrame();
  }

  _renderFrame() {
    this._div.style.backgroundPositionY = px(
      -(this._currentFrame * this._frameHeight)
    );
  }

  draw() {
    super.draw();
    this._renderFrame();
    this._div.setAttribute("data-obj-name", "AnimatedLayer");
  }
}
