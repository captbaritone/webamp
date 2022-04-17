import UI_ROOT from "../../UIRoot";
import { num, toBool } from "../../utils";
import { AUDIO_PLAYING } from "../AudioPlayer";
import GuiObj from "./GuiObj";

type ColorTriplet = string;

class VisPainter {
  _vis: Vis;

  constructor(vis: Vis) {
    this._vis = vis;
    this.prepare();
  }

  prepare() {}

  paintFrame(ctx: CanvasRenderingContext2D) {}

  dispose() {}
}

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Cvis.2F.3E
export default class Vis extends GuiObj {
  static GUID = "ce4f97be4e1977b098d45699276cc933";
  _canvas: HTMLCanvasElement = document.createElement("canvas");
  _painter: VisPainter;
  _animationRequest: number = null;
  // (int) One of three values for which mode to display:
  // "0" is no display,
  // "1" is spectrum,
  // "2" is oscilloscope. Default is to read from a config item. When the user clicks on the vis, it will cycle between its three modes.
  _mode: number = 1;
  _colorBands: ColorTriplet[] = []; // 1..16
  _colorBandPeak: ColorTriplet = "255,255,255";
  _colorOsc: ColorTriplet[] = []; // 1..5
  _peaks: boolean = true;
  _oscStyle: string;
  _bandwidth: string;
  // _destroying: boolean = false; // set true when deinit

  constructor() {
    super();
    this._painter = new NoVisualizer(this);
    UI_ROOT.audio.on("statchanged", this.audioStatusChanged);
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

  init() {
    this.setmode(1)
    super.init();
    this.audioStatusChanged();
  }

  deinit() {
    super.deinit();
    this._stopVisualizer();
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
    // uninteruptable painting requires _painter to be always available
    const oldPainter = this._painter;
    this._painter = new PainterType(this);

    if (oldPainter) {
      oldPainter.dispose();
    }
  }

  // disposable
  audioStatusChanged = () => {
    // to avoid multiple loop, we always stop the old painting loop
    this._stopVisualizer();

    // start the new loop
    const playing = UI_ROOT.audio.getState() == AUDIO_PLAYING;
    if (playing) {
      this._startVisualizer();
    }
  };

  _startVisualizer() {
    // Kick off the animation loop
    const ctx = this._canvas.getContext("2d");
    if (ctx == null) {
      return;
    }
    ctx.imageSmoothingEnabled = false;
    const loop = () => {
      this._painter.paintFrame(ctx);
      this._animationRequest = window.requestAnimationFrame(loop);
    };
    loop();
  }

  _stopVisualizer() {
    if (this._animationRequest != null) {
      window.cancelAnimationFrame(this._animationRequest);
      this._animationRequest = null;
    }
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

  paintFrame(ctx: CanvasRenderingContext2D) {
    if (!this._cleared) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      this._cleared = true;
    }
  }
}

class BarPainter extends VisPainter {
  prepare() {}

  paintFrame(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (var i = 0; i < 600; i++) {
      var x = Math.floor(Math.random() * ctx.canvas.width - 17);
      var y = Math.floor(Math.random() * ctx.canvas.height - 17);
      var radius = Math.floor(Math.random() * 20);

      var r = Math.floor(Math.random() * 255);
      var g = Math.floor(Math.random() * 255);
      var b = Math.floor(Math.random() * 255);

      ctx.beginPath();
      ctx.arc(x, y, radius, Math.PI * 2, 0, false);
      ctx.fillStyle = "rgba(" + r + "," + g + "," + b + ",1)";
      ctx.fill();
      ctx.closePath();
    }
  }
}
class WavePainter extends VisPainter {
  prepare() {}

  paintFrame(ctx: CanvasRenderingContext2D) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 5;
    for (var i = 0; i < 30; i += 1) {
      var r = Math.floor(Math.random() * 255);
      var g = Math.floor(Math.random() * 255);
      var b = Math.floor(Math.random() * 255);

      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + ",1)";
      ctx.stroke();
    }
  }
}
