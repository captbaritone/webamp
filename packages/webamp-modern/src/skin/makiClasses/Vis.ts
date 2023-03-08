import { UIRoot } from "../../UIRoot";
import { debounce, num, toBool, unimplemented } from "../../utils";
import { AUDIO_PLAYING } from "../AudioPlayer";
import GammaGroup from "../GammaGroup";
import GuiObj from "./GuiObj";

type ColorTriplet = string;

/**
 * Base class of AVS (animation frame renderer engine)
 */
export class VisPaintHandler {
  _vis: Vis;

  constructor(vis: Vis) {
    this._vis = vis;
    // this.prepare();
  }

  /**
   * Attemp to build cached bitmaps for later use while render a frame.
   * Purpose: fast rendering in animation loop
   */
  prepare() {}

  /**
   * Called once per frame rendiring
   */
  paintFrame() {}

  /**
   * Attemp to cleanup cached bitmaps
   */
  dispose() {}

  /**
   * called if it is an AVS.
   * @param action vis_prev | vis_next | vis_f5 (fullscreen) |
   */
  doAction(action:string, param:string){}
}

// type VisPaintHandlerClass = {new(vis: Vis): VisPaintHandler;};
type VisPaintHandlerClass = typeof VisPaintHandler;
const VISPAINTERS: {[key:string]: VisPaintHandlerClass} = {}; 
export function registerPainter(key: string, painterclass: VisPaintHandlerClass) {
  VISPAINTERS[key] = painterclass;
}

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Cvis.2F.3E
export default class Vis extends GuiObj {
  static GUID = "ce4f97be4e1977b098d45699276cc933";
  _canvas: HTMLCanvasElement = document.createElement("canvas");
  _painter: VisPaintHandler;
  _animationRequest: number = null;
  // (int) One of three values for which mode to display:
  // "0" is no display,
  // "1" is spectrum,
  // "2" is oscilloscope. Default is to read from a config item. When the user clicks on the vis, it will cycle between its three modes.
  _mode: string = '1';
  _colorBands: ColorTriplet[] = []; // 1..16
  _colorBandPeak: ColorTriplet = "255,255,255";
  _colorOsc: ColorTriplet[] = []; // 1..5
  _coloring: string;
  _peaks: boolean = true;
  _oscStyle: string;
  _bandwidth: string;
  _gammagroup: string;
  _realtime: boolean = true;

  constructor(uiRoot: UIRoot) {
    super(uiRoot);
    while (this._colorBands.length < 16) {
      this._colorBands.push("255,255,255");
    }
    this._painter = new NoVisualizerHandler(this);
    this._uiRoot.audio.on("statchanged", this.audioStatusChanged);
    this._uiRoot.on("colorthemechanged", this._colorThemeChanged);
  }

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    value = value.toLowerCase()

    switch (key) {
      case "mode":
        this.setmode(value);
        break;
      case "gammagroup":
        this._gammagroup = value;
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
        const cobaIndex = parseInt(key.substring(9)) - 1;
        this._colorBands[cobaIndex] = value;
        break;
      case "colorallbands":
        // color spectrum band #
        for (var i = 0; i < 16; i++) {
          this._colorBands[i] = value;
        }
        break;
      case "coloring":
        // Change coloring method for spectroscope ("Normal", "Fire" or "Line").
        this._coloring = value;
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
        const coOcIndex = parseInt(key.substring(8)) - 1;
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
    this._rebuildPainter();
    return true;
  }

  init() {
    this.setmode(this._mode); // in case xml doesn't define mode.
    super.init();
    this.audioStatusChanged();
  }

  dispose() {
    super.dispose();
    this._stopVisualizer();
  }

  /**
   * Called when any a color changed.
   * Debounce = avoid too many changes in a range time (100ms here)
   */
  _rebuildPainter = debounce(() => {
    if (this._painter) {
      this._painter.prepare();
      // const ctx = this._canvas.getContext("2d");
      // if (ctx == null) {
      //   return;
      // }
      this._painter.paintFrame();
    }
  }, 100);

  _colorThemeChanged = (newGammaId: string) => {
    this._rebuildPainter();
  };

  setmode(mode: string) {
    this._mode = mode;
    const painterClass = VISPAINTERS[mode] || VISPAINTERS['0'] /* NoVisualizerHandler */;
    this._setPainter( painterClass )
    // return 
    // switch (mode) {
    //   case '1':
    //     // "1" is spectrum,
    //     this._setPainter(BarPaintHandler);
    //     break;
    //   case '2':
    //     // "2" is oscilloscope.
    //     this._setPainter(WavePaintHandler);
    //     break;
    //   default:
    //     // "0" is no display,
    //     this._setPainter(NoVisualizerHandler);
    //     break;
    // }
  }

  getmode(): number {
    return parseInt('0'+ this._mode); // so we support non numeral use. eg: 'butterchurn'
  }

  nextmode() {
    let newMode = this.getmode() + 1;
    if (newMode > 2) {
      newMode = 0;
    }
    this.setmode(String(newMode));
  }

  _setPainter(PainterType: typeof VisPaintHandler) {
    // uninteruptable painting requires _painter to be always available
    const oldPainter = this._painter;
    this._painter = new PainterType(this);

    this.audioStatusChanged(); // stop loop of old painter, preparing new painter.

    if (oldPainter) {
      oldPainter.dispose();
    }
  }

  // disposable
  audioStatusChanged = () => {
    // to avoid multiple loop, we always stop the old painting loop
    this._stopVisualizer();

    // start the new loop
    const playing = this._uiRoot.audio.getState() == AUDIO_PLAYING;
    if (playing) {
      this._startVisualizer();
    }
  };

  _startVisualizer() {
    // Kick off the animation loop
    // const ctx = this._canvas.getContext("2d");
    // if (ctx == null) {
    //   return;
    // }
    // ctx.imageSmoothingEnabled = false;
    this._rebuildPainter();
    const loop = () => {
      this._painter.paintFrame();
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

  /*extern Vis.onFrame(); */
  setrealtime(onoff: boolean) {
    this._realtime = unimplemented(onoff);
  }
  getrealtime(): boolean {
    return this._realtime;
  }

  _renderWidth() {
    super._renderWidth();
    this._canvas.style.width = this._div.style.width;
    this._canvas.setAttribute("width", `${parseInt(this._div.style.width)}`);
  }

  _renderHeight() {
    super._renderHeight();
    this._canvas.style.height = this._div.style.height;
    this._canvas.setAttribute("height", `${parseInt(this._div.style.height)}`);
  }

  draw() {
    super.draw();
    this._canvas.setAttribute('id', this.getId()+'-canvas');
    this._div.appendChild(this._canvas);
  }
}

//========= visualizer implementations ==========

class NoVisualizerHandler extends VisPaintHandler {

  prepare() {
    const ctx = this._vis._canvas.getContext('2d')
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}
registerPainter('0', NoVisualizerHandler)

//? =============================== BAR PAINTER ===============================
const NUM_BARS = 20;
const PIXEL_DENSITY = 1;
const BAR_PEAK_DROP_RATE = 0.01;
type  PaintBarFunction = (
  ctx: CanvasRenderingContext2D,
  barIndex: number,
  barHeight: number,
  peakHeight: number
) => void;

function octaveBucketsForBufferLength(bufferLength: number): number[] {
  const octaveBuckets = new Array(NUM_BARS).fill(0);
  const minHz = 200;
  const maxHz = 22050;
  const octaveStep = Math.pow(maxHz / minHz, 1 / NUM_BARS);

  octaveBuckets[0] = 0;
  octaveBuckets[1] = minHz;
  for (let i = 2; i < NUM_BARS - 1; i++) {
    octaveBuckets[i] = octaveBuckets[i - 1] * octaveStep;
  }
  octaveBuckets[NUM_BARS - 1] = maxHz;

  for (let i = 0; i < NUM_BARS; i++) {
    const octaveIdx = Math.floor((octaveBuckets[i] / maxHz) * bufferLength);
    octaveBuckets[i] = octaveIdx;
  }

  return octaveBuckets;
}

class BarPaintHandler extends VisPaintHandler {
  _analyser: AnalyserNode;
  _barWidth: number;
  _color: string = "rgb(255,255,255)";
  _colorPeak: string = "rgb(255,255,255)";
  // Off-screen canvas for pre-rendering a single bar gradient
  _bar: HTMLCanvasElement = document.createElement("canvas");
  _peak: HTMLCanvasElement = document.createElement("canvas");
  _barPeaks: number[] = new Array(NUM_BARS).fill(0);
  _barPeakFrames: number[] = new Array(NUM_BARS).fill(0);
  _bufferLength: number;
  _octaveBuckets: number[];
  _dataArray: Uint8Array;
  _ctx : CanvasRenderingContext2D;
  paintBar : PaintBarFunction;

  constructor(vis: Vis) {
    super(vis);
    this._analyser = this._vis._uiRoot.audio.getAnalyser();
    this._bufferLength = this._analyser.frequencyBinCount;
    this._octaveBuckets = octaveBucketsForBufferLength(this._bufferLength);
    this._dataArray = new Uint8Array(this._bufferLength);
  }

  prepare() {
    const vis = this._vis;
    const groupId = vis._gammagroup;
    const gammaGroup = this._vis._uiRoot._getGammaGroup(groupId);
    this._barWidth = Math.ceil(vis._canvas.width / NUM_BARS);

    //? paint peak
    this._peak.height = 1;
    this._peak.width = 1;
    var ctx = this._peak.getContext("2d");
    ctx.fillStyle = `rgb(${this._vis._colorBandPeak})`;
    ctx.fillRect(0, 0, 1, 1);

    //? paint bar
    this._bar.height = vis._canvas.height;
    this._bar.width = 1;
    var ctx = this._bar.getContext("2d");
    const grd = ctx.createLinearGradient(0, 0, 0, vis._canvas.height);
    for (let i = 0; i < vis._colorBands.length; i++) {
      grd.addColorStop(
        (1 / (vis._colorBands.length - 1)) * i,
        gammaGroup.transformColor(vis._colorBands[i])
      );
    }

    ctx.strokeStyle = this._color;
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 1, vis._canvas.height);
    ctx.imageSmoothingEnabled = false;
    this._ctx = this._vis._canvas.getContext('2d')
    if(this._vis._coloring=='fire'){
      this.paintBar = this.paintBarFire.bind(this)
    } else {
      this.paintBar = this.paintBarNormal.bind(this)
    }
  }

  paintFrame() {
    if(!this._ctx) return;
    const ctx = this._ctx
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = this._color;

    this._analyser.getByteFrequencyData(this._dataArray);
    const heightMultiplier = h / 256;
    const xOffset = this._barWidth + PIXEL_DENSITY; // Bar width, plus a pixel of spacing to the right.
    for (let j = 0; j < NUM_BARS - 1; j++) {
      const start = this._octaveBuckets[j];
      const end = this._octaveBuckets[j + 1];
      let amplitude = 0;
      amplitude /= end - start;
      for (let k = start; k < end; k++) {
        amplitude = Math.max(amplitude, this._dataArray[k]);
      }

      // The drop rate should probably be normalized to the rendering FPS, for now assume 60 FPS
      let barPeak =
        this._barPeaks[j] -
        BAR_PEAK_DROP_RATE * Math.pow(this._barPeakFrames[j], 2);
      if (barPeak < amplitude) {
        barPeak = amplitude;
        this._barPeakFrames[j] = 0;
      } else {
        this._barPeakFrames[j] += 1;
      }
      this._barPeaks[j] = barPeak;

      this.paintBar(
        ctx,
        j /* * xOffset */,
        amplitude * heightMultiplier,
        barPeak * heightMultiplier
      );
    }
  }

  paintBarNormal(
    ctx: CanvasRenderingContext2D,
    barIndex: number,
    barHeight: number,
    peakHeight: number
  ) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    var x = Math.round(this._barWidth * barIndex);
    var r = this._barWidth - 2;
    var x2 = Math.round(this._barWidth * (barIndex + 1)) - 2;
    var y = h - barHeight;

    // ctx.drawImage(this._bar, 0, y, 1, h - y, x, y, x2 - x + 1, h - y);
    ctx.drawImage(
      this._bar, 
      0, y, 
      1, h - y, 
      x, y, 
      x2 - x + 1, h - y);

    if (this._vis._peaks) {
      const peakY = h - peakHeight;
      ctx.drawImage(this._peak, 0, 0, 1, 1, x, peakY, x2 - x + 1, 1);
    }
  }

  paintBarFire(
    ctx: CanvasRenderingContext2D,
    barIndex: number,
    barHeight: number,
    peakHeight: number
  ) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    var x = Math.round(this._barWidth * barIndex);
    var r = this._barWidth - 2;
    var x2 = Math.round(this._barWidth * (barIndex + 1)) - 2;
    var y = h - barHeight;

    // ctx.drawImage(this._bar, x, y, x2 - x + 1, h - y);
    ctx.drawImage(
      this._bar, 
      0, 0,
      this._bar.width, h - y,
      x, y, 
      x2 - x + 1, h - y
      );

    if (this._vis._peaks) {
      const peakY = h - peakHeight;
      ctx.drawImage(this._peak, 0, 0, 1, 1, x, peakY, x2 - x + 1, 1);
    }
  }
}
registerPainter('1', BarPaintHandler)

//? =============================== OSCILOSCOPE PAINTER ===============================

class WavePaintHandler extends VisPaintHandler {
  _ctx : CanvasRenderingContext2D;
  prepare() {
    this._ctx = this._vis._canvas.getContext('2d')
  }

  paintFrame() {
    if(!this._ctx) return;
    const ctx = this._ctx
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
registerPainter('2', WavePaintHandler)