import { num, toBool } from "../../utils";
import GuiObj from "./GuiObj";

type ColorTriplet = string;

class VisPainter {
  _vis: Vis;

  constructor(vis: Vis) {
    this._vis = vis;
    this.prepare();
  }

  prepare() {}

  paintFrame(canvasCtx: CanvasRenderingContext2D) {}

  dispose() {}
}

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Cvis.2F.3E
export default class Vis extends GuiObj {
  static GUID = "ce4f97be4e1977b098d45699276cc933";
  _canvas: HTMLCanvasElement = document.createElement("canvas");
  _painter: VisPainter;
  // (int) One of three values for which mode to display:
  // "0" is no display,
  // "1" is spectrum,
  // "2" is oscilloscope. Default is to read from a config item. When the user clicks on the vis, it will cycle between its three modes.
  _mode: number = 0;
  _colorBands: ColorTriplet[] = []; // 1..16
  _colorBandPeak: ColorTriplet = "255,255,255";
  _colorOsc: ColorTriplet[] = []; // 1..5
  _peaks: boolean = true;
  _oscStyle: string;
  _bandwidth: string;

  constructor() {
    super();
    this._painter = new NoVisualizer(this);
  }

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }

    switch (key) {
      case "mode":
        this.setmode(num(value));
        break;

      //? SPECTRUM -------------------------------------------
      case "colorband1":
      case "colorband2":
      case "colorband3":
      case "colorband4":
      case "colorband5":
      case "colorband6":
      case "colorband7":
      case "colorband8":
      case "colorband9":
      case "colorband10":
      case "colorband11":
      case "colorband12":
      case "colorband13":
      case "colorband14":
      case "colorband15":
      case "colorband16":
        // color spectrum band #
        const cobaIndex = parseInt(key) - 1;
        this._colorBands[cobaIndex] = value;
        break;
      case "colorallbands":
        // color spectrum band #
        for (var i = 0; i < 16; i++) {
          this._colorBands[i] = value;
        }
        break;
      case "colorbandpeak":
        // color the spectrum peak line.
        this._colorBandPeak = value;
        break;
      case "peaks":
        // (bool) Enable peaks for the spectrum.
        this._peaks = toBool(value);
        break;
      case "bandwidth":
        // (string) Change the style of the spectrum ("thin" or "wide").
        this._bandwidth = value;
        break;

      //? OSCILOSCOPE -------------------------------------------
      case "colorosc1":
      case "colorosc2":
      case "colorosc3":
      case "colorosc4":
      case "colorosc5":
        //  color oscilloscope section #
        const coOcIndex = parseInt(key);
        this._colorOsc[coOcIndex] = value;
        break;
      case "colorallosc":
        // color the whole oscilloscope.
        for (var i = 0; i < 5; i++) {
          this._colorOsc[i] = value;
        }
        break;
      case "oscstyle":
        //  (string) Change the style of the oscilloscope ("solid", "dots" or "lines").
        this._oscStyle = value;
        break;
      case "others":
        break;
      default:
        return false;
    }
    return true;
  }

  setmode(mode: number) {
    this._mode = mode;
    switch (mode) {
      case 1:
        // "1" is spectrum,
        this._setPainter(BarPainter);
        break;
      case 2:
        // "2" is oscilloscope.
        this._setPainter(WavePainter);
        break;
      default:
        // "0" is no display,
        this._setPainter(NoVisualizer);
        break;
    }
  }

  _setPainter(PainterType: typeof VisPainter) {
    if (this._painter) {
      this._painter.dispose();
    }
    this._painter = new PainterType(this);
  }

  /*extern Vis.onFrame();
extern Vis.setRealtime(Boolean onoff);
extern Boolean Vis.getRealtime();
extern Int Vis.getMode();
extern Vis.nextMode();*/

  _renderWidth() {
    super._renderWidth();
    this._canvas.style.width = this._div.style.width;
  }

  _renderHeight() {
    super._renderHeight();
    this._canvas.style.height = this._div.style.height;
  }

  draw() {
    super.draw();
    this._div.appendChild(this._canvas);
    // this._div.setAttribute("data-obj-name", "AnimatedLayer");
  }
}

//========= visualizer implementations ==========

class NoVisualizer extends VisPainter {
  _cleared: boolean = false;

  paintFrame(canvasCtx: CanvasRenderingContext2D) {
    if (!this._cleared) {
      canvasCtx.clearRect(
        0,
        0,
        canvasCtx.canvas.width,
        canvasCtx.canvas.height
      );
      this._cleared = true;
    }
  }
}

class BarPainter extends VisPainter {
  prepare() {}

  paintFrame(canvasCtx: CanvasRenderingContext2D) {
    canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);
  }
}
class WavePainter extends VisPainter {
  prepare() {}

  paintFrame(canvasCtx: CanvasRenderingContext2D) {
    canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);
  }
}
