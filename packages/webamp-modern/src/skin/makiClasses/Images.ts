import UI_ROOT from "../../UIRoot";
import { ensureVmInt, num, px } from "../../utils";
import Layer from "./Layer";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Cimages.2F.3E
export default class Images extends Layer {
  //   static GUID = "6b64cd274c4b5a26a7e6598c3a49f60c";
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
        // this._renderBackground();
        break;
      case "images":
        this._image = value;
        this._renderBackground();
        break;
      case "imagesspacing":
        this._frameHeight = num(value);
        // this._renderHeight();
        break;
      default:
        return false;
    }
    return true;
  }

  init() {
    super.init();
    this._frameCount = Math.ceil( this._getImageHeight() / this._frameHeight)-1;
    if (this._source == "volume") {
        //TODO: make disposable:
        UI_ROOT.audio.onVolumeChanged(this.updateVolume);
        this.updateVolume()
    }
    else if (this._source == "balance") {
        //TODO: make disposable:
        UI_ROOT.audio.onBalanceChanged(this.updateBalance);
        this.updateBalance()
    }
  }

  updateVolume = () => {
    const vol = UI_ROOT.audio.getVolume(); //0..1
    this.gotoframe(vol * this._frameCount)
  }

  updateBalance = () => {
    const balance = UI_ROOT.audio.getBalance(); //0..1
    // console.log('balance:', balance)
    this.gotoframe(balance * this._frameCount)
  }

  _getImageHeight(): number {
    const bitmap = UI_ROOT.getBitmap(this._image);
    return bitmap.getHeight();
  }

//   getlength(): number {
//     // TODO: What about other orientations?
//     return this._getImageHeight() / (this._frameHeight || this.getheight());
//   }
  gotoframe(framenum: number) {
    this._currentFrame = Math.ceil(framenum);
    this._renderFrame();
    // UI_ROOT.vm.dispatch(this, "onframe", [
    //   { type: "INT", value: this._currentFrame },
    // ]);
  }
//   getcurframe(): number {
//     return this._currentFrame;
//   }

//   _getActualHeight(): number {
//     return this._height || this._div.getBoundingClientRect().height;
//   }

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
