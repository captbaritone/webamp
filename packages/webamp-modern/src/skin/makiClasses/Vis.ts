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
  doAction(action: string, param: string) {}
}

// type VisPaintHandlerClass = {new(vis: Vis): VisPaintHandler;};
type VisPaintHandlerClass = typeof VisPaintHandler;
const VISPAINTERS: { [key: string]: VisPaintHandlerClass } = {};
export function registerPainter(
  key: string,
  painterclass: VisPaintHandlerClass
) {
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
  _mode: string = "1";
  _colorBands: ColorTriplet[] = []; // 1..16
  _colorBandPeak: ColorTriplet = "255,255,255";
  _colorOsc: ColorTriplet[] = []; // 1..5
  _coloring: string = "normal";
  _peaks: boolean = true;
  _oscStyle: string;
  _bandwidth: string = "wide";
  _gammagroup: string;
  _realtime: boolean = true;

  constructor(uiRoot: UIRoot) {
    super(uiRoot);
    while (this._colorBands.length < 16) {
      this._colorBands.push("255,255,255");
    }
    while (this._colorOsc.length < 5) {
      this._colorOsc.push("255,255,255");
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
    value = value.toLowerCase();

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
    const painterClass =
      VISPAINTERS[mode] || VISPAINTERS["0"]; /* NoVisualizerHandler */
    this._setPainter(painterClass);
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
    return parseInt("0" + this._mode); // so we support non numeral use. eg: 'butterchurn'
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
    this._canvas.setAttribute("id", this.getId() + "-canvas");
    this._div.appendChild(this._canvas);
  }
}

//========= visualizer implementations ==========

class NoVisualizerHandler extends VisPaintHandler {
  prepare() {
    const ctx = this._vis._canvas.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}
registerPainter("0", NoVisualizerHandler);

//? =============================== BAR PAINTER ===============================
const NUM_BARS = 20;
const PIXEL_DENSITY = 1;
const BAR_PEAK_DROP_RATE = 0.01;
type PaintFrameFunction = () => void;
type PaintBarFunction = (
  ctx: CanvasRenderingContext2D,
  // barIndex: number,
  x1: number,
  x2: number,
  barHeight: number,
  peakHeight: number
) => void;

function octaveBucketsForBufferLength(
  bufferLength: number,
  barCount: number = NUM_BARS
): number[] {
  const octaveBuckets = new Array(barCount).fill(0);
  const minHz = 200;
  const maxHz = 22050;
  const octaveStep = Math.pow(maxHz / minHz, 1 / barCount);

  octaveBuckets[0] = 0;
  octaveBuckets[1] = minHz;
  for (let i = 2; i < barCount - 1; i++) {
    octaveBuckets[i] = octaveBuckets[i - 1] * octaveStep;
  }
  octaveBuckets[barCount - 1] = maxHz;

  for (let i = 0; i < barCount; i++) {
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
  _ctx: CanvasRenderingContext2D;
  paintBar: PaintBarFunction;
  paintFrame: PaintFrameFunction;

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
    this._ctx = this._vis._canvas.getContext("2d");

    if (this._vis._bandwidth == "wide") {
      this.paintFrame = this.paintFrameWide.bind(this);
      this._octaveBuckets = octaveBucketsForBufferLength(this._bufferLength);
    } else {
      // thin
      const w = this._vis._canvas.width;
      this._barPeaks = new Array(w).fill(0);
      this._barPeakFrames = new Array(w).fill(0);
      this._octaveBuckets = octaveBucketsForBufferLength(this._bufferLength, w);
      this.paintFrame = this.paintFrameThin.bind(this);
    }

    if (this._vis._coloring == "fire") {
      this.paintBar = this.paintBarFire.bind(this);
    } else {
      this.paintBar = this.paintBarNormal.bind(this);
    }
  }

  paintFrameWide() {
    if (!this._ctx) return;
    const ctx = this._ctx;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = this._color;

    this._analyser.getByteFrequencyData(this._dataArray);
    const heightMultiplier = h / 256;
    // const xOffset = this._barWidth + PIXEL_DENSITY; // Bar width, plus a pixel of spacing to the right.
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

      var x1 = Math.round(this._barWidth * j);
      var x2 = Math.round(this._barWidth * (j + 1)) - 2;

      this.paintBar(
        ctx,
        // j /* * xOffset */,
        x1,
        x2,
        amplitude * heightMultiplier,
        barPeak * heightMultiplier
      );
    }
  }

  /**
   * drawing 1pixel width bars
   */
  paintFrameThin() {
    if (!this._ctx) return;
    const ctx = this._ctx;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = this._color;

    this._analyser.getByteFrequencyData(this._dataArray);
    const heightMultiplier = h / 256;
    for (let j = 0; j < w - 1; j++) {
      // const start = Math.round(j/w * this._dataArray.length);
      // const end = Math.round((j+1)/w * this._dataArray.length );
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

      // var x1 = Math.round(this._barWidth * j);
      // var x2 = Math.round(this._barWidth * (j + 1)) - 2;

      this.paintBar(
        ctx,
        // j /* * xOffset */,
        j,
        j,
        amplitude * heightMultiplier,
        barPeak * heightMultiplier
      );
    }
  }

  paintBarNormal(
    ctx: CanvasRenderingContext2D,
    // barIndex: number,
    x: number,
    x2: number,
    barHeight: number,
    peakHeight: number
  ) {
    // const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    // var x = Math.round(this._barWidth * barIndex);
    // var r = this._barWidth - 2;
    // var x2 = Math.round(this._barWidth * (barIndex + 1)) - 2;
    var y = h - barHeight;

    // ctx.drawImage(this._bar, 0, y, 1, h - y, x, y, x2 - x + 1, h - y);
    ctx.drawImage(this._bar, 0, y, 1, h - y, x, y, x2 - x + 1, h - y);

    if (this._vis._peaks) {
      const peakY = h - peakHeight;
      ctx.drawImage(this._peak, 0, 0, 1, 1, x, peakY, x2 - x + 1, 1);
    }
  }

  paintBarFire(
    ctx: CanvasRenderingContext2D,
    // barIndex: number,
    x: number,
    x2: number,
    barHeight: number,
    peakHeight: number
  ) {
    // const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    // var x = Math.round(this._barWidth * barIndex);
    // var r = this._barWidth - 2;
    // var x2 = Math.round(this._barWidth * (barIndex + 1)) - 2;
    var y = h - barHeight;

    // ctx.drawImage(this._bar, x, y, x2 - x + 1, h - y);
    ctx.drawImage(
      this._bar,
      0,
      0,
      this._bar.width,
      h - y,
      x,
      y,
      x2 - x + 1,
      h - y
    );

    if (this._vis._peaks) {
      const peakY = h - peakHeight;
      ctx.drawImage(this._peak, 0, 0, 1, 1, x, peakY, x2 - x + 1, 1);
    }
  }
}
registerPainter("1", BarPaintHandler);

//? =============================== OSCILOSCOPE PAINTER ===============================
type PaintWavFunction = (x: number, y: number, colorIndex: number) => void;
// Return the average value in a slice of dataArray
function sliceAverage(
  dataArray: Uint8Array,
  sliceWidth: number,
  sliceNumber: number
): number {
  const start = sliceWidth * sliceNumber;
  const end = start + sliceWidth;
  let sum = 0;
  for (let i = start; i < end; i++) {
    sum += dataArray[i];
  }
  return sum / sliceWidth;
}

function slice1st(
  dataArray: Uint8Array,
  sliceWidth: number,
  sliceNumber: number
): number {
  const start = sliceWidth * sliceNumber;
  // const end = start + sliceWidth;
  // let sum = 0;
  // for (let i = start; i < end; i++) {
  //   sum += dataArray[i];
  // }
  return dataArray[start];
}

class WavePaintHandler extends VisPaintHandler {
  _analyser: AnalyserNode;
  _bufferLength: number;
  _lastX: number = 0;
  _lastY: number = 0;
  _dataArray: Uint8Array;
  _ctx: CanvasRenderingContext2D;
  _pixelRatio: number; // 1 or 2
  // Off-screen canvas for drawing perfect pixel (no blured lines)
  _bar: HTMLCanvasElement = document.createElement("canvas");
  _16h: HTMLCanvasElement = document.createElement("canvas"); // non-stretched
  paintWav: PaintWavFunction;
  _datafetched: boolean = false;
  _colors: string[];

  constructor(vis: Vis) {
    super(vis);
    this._analyser = this._vis._uiRoot.audio.getAnalyser();
    this._bufferLength = this._analyser.fftSize;
    // this._octaveBuckets = octaveBucketsForBufferLength(this._bufferLength);
    this._dataArray = new Uint8Array(this._bufferLength);

    //* see https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio#monitoring_screen_resolution_or_zoom_level_changes
    this._pixelRatio = window.devicePixelRatio || 1;
  }
  prepare() {
    const vis = this._vis;
    const groupId = vis._gammagroup;
    const gammaGroup = this._vis._uiRoot._getGammaGroup(groupId);

    this._16h.width = 1;
    this._16h.height = 16;
    this._16h.setAttribute("width", "72");
    this._16h.setAttribute("height", "16");

    //? paint bar
    this._bar.width = 1;
    this._bar.height = 5;
    this._bar.setAttribute("width", "1");
    this._bar.setAttribute("height", "5");
    var ctx = this._bar.getContext("2d");
    for (let y = 0; y < 5; y++) {
      ctx.fillStyle = gammaGroup.transformColor(vis._colorOsc[y]);
      // console.log("ctx.fillStyle:", ctx.fillStyle);
      ctx.fillRect(0, y, 1, y + 1);
    }

    this._ctx = vis._canvas.getContext("2d");
    this._ctx.imageSmoothingEnabled = false;
    // @ts-ignore
    this._ctx.mozImageSmoothingEnabled = false;
    // @ts-ignore
    this._ctx.webkitImageSmoothingEnabled = false;
    // @ts-ignore
    this._ctx.msImageSmoothingEnabled = false;
    // Just use one of the viscolors for now

    if (this._vis._oscStyle == "dots") {
      this.paintWav = this.paintWavDot.bind(this);
    } else if (this._vis._oscStyle == "solid") {
      this.paintWav = this.paintWavSolid.bind(this);
    } else {
      this.paintWav = this.paintWavLine.bind(this);
    }
    this._datafetched = false;
  }

  paintFrame() {
    if (!this._ctx) return;
    this._analyser.getByteTimeDomainData(this._dataArray);
    // this._analyser.getFloatTimeDomainData(this._dataArray);
    this._dataArray = this._dataArray.slice(0, 576);
    const bandwidth = this._dataArray.length;

    //* to save and see in excel (bar chart)
    if (!this._datafetched) {
      // console.log(JSON.stringify(Array.from(this._dataArray)))
      this._datafetched = true;
    }

    const using16temporaryCanvas = this._vis._canvas.height != 16;

    if (using16temporaryCanvas) {
      this._ctx = this._16h.getContext("2d");
    }
    let width = this._ctx.canvas.width;
    const height = this._ctx.canvas.height;
    this._ctx.clearRect(0, 0, width, height);

    const sliceWidth = Math.floor(/* this._bufferLength */ bandwidth / width);

    // Iterate over the width of the canvas in fixed 72 pixels.
    for (let j = 0; j <= width; j++) {
      // const amplitude = sliceAverage(this._dataArray, sliceWidth, j);
      const amplitude = slice1st(this._dataArray, sliceWidth, j);
      const [y, colorIndex] = this.rangeByAmplitude(amplitude);
      const x = j * PIXEL_DENSITY;

      this.paintWav(x, y, colorIndex);
    }

    if (using16temporaryCanvas) {
      const canvas = this._vis._canvas;
      const visCtx = canvas.getContext("2d");
      visCtx.clearRect(0, 0, canvas.width, canvas.height);
      visCtx.drawImage(
        this._16h,
        0,
        0, // sx,sy
        72,
        16, // sw,sh
        0,
        0, //dx,dy
        canvas.width,
        canvas.height //dw,dh
      );
    }
  }

  /**
   *
   * @param amplitude 0..255
   * @returns xy.Y(top to bottom), colorOscIndex
   */
  rangeByAmplitude(amplitude: number): [number, number] {
    //odjasdjflasjdf;lasjdf;asjd;fjasd;fsajdf
    if (amplitude >= 184) {
      return [0, 3];
    }
    if (amplitude >= 176) {
      return [1, 3];
    }
    if (amplitude >= 168) {
      return [2, 2];
    }
    if (amplitude >= 160) {
      return [3, 2];
    }
    if (amplitude >= 152) {
      return [4, 1];
    }
    if (amplitude >= 144) {
      return [5, 1];
    }
    if (amplitude >= 136) {
      return [6, 0];
    }
    if (amplitude >= 128) {
      return [7, 0];
    }
    if (amplitude >= 120) {
      return [8, 1];
    }
    if (amplitude >= 112) {
      return [9, 1];
    }
    if (amplitude >= 104) {
      return [10, 2];
    }
    if (amplitude >= 96) {
      return [11, 2];
    }
    if (amplitude >= 88) {
      return [12, 3];
    }
    if (amplitude >= 80) {
      return [13, 3];
    }
    if (amplitude >= 72) {
      return [14, 4];
    }
    // if(amplitude>=56){return [15, 4]}
    return [15, 4];
  }
  paintWavLine(x: number, y: number, colorIndex: number) {
    if (x === 0) this._lastY = y;

    let top = y;
    let bottom = this._lastY;
    this._lastY = y;

    if (bottom < top) {
      [bottom, top] = [top, bottom];
    }
    // const h = bottom - top + 1;

    for (y = top; y <= bottom; y++) {
      this._ctx.drawImage(
        this._bar,
        0,
        colorIndex, // sx,sy
        1,
        1, // sw,sh
        x,
        y, //dx,dy
        1,
        1 //dw,dh
      );
    }
  }

  paintWavDot(x: number, y: number, colorIndex: number) {
    this._ctx.drawImage(
      this._bar,
      0,
      colorIndex, // sx,sy
      1,
      1, // sw,sh
      x,
      y, //dx,dy
      1,
      1 //dw,dh
    );
  }

  paintWavSolid(x: number, y: number, colorIndex: number) {
    var top, bottom;
    if (y >= 8) {
      top = 8;
      bottom = y;
    } else {
      top = y;
      bottom = 7;
    }
    // const h = bottom - top + 1;
    for (y = top; y <= bottom; y++) {
      this._ctx.drawImage(
        this._bar,
        0,
        colorIndex, // sx,sy
        1,
        1, // sw,sh
        x,
        y, //dx,dy
        1,
        1 //dw,dh
      );
    }
  }
}
registerPainter("2", WavePaintHandler);
