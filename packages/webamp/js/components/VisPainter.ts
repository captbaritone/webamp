export interface Vis {
  canvas?: HTMLCanvasElement;
  colors: string[];
  analyser?: AnalyserNode;
  audioContext?: AudioContext; //butterchurn need it
  oscStyle?: "dots" | "solid" | "lines";
  bandwidth?: "wide" | "thin";
  coloring?: "fire" | "line" | "normal";
  peaks?: boolean;
  safalloff?: "slower" | "slow" | "moderate" | "fast" | "faster";
  sa_peak_falloff?: "slower" | "slow" | "moderate" | "fast" | "faster";
}
import { out_spectraldata, renderHeight, renderWidth, windowShade, PIXEL_DENSITY, doubled } from "./Vis";

let sapeaks = new Int16Array(76).fill(0);
let sadata2 = new Float32Array(76).fill(0);
let sadata = new Int16Array(76).fill(0);
let safalloff = new Float32Array(76).fill(0);  
let sample = new Float32Array(76).fill(0);
let barPeak = new Int16Array(76).fill(0); // Needs to be specified as Int16 else the peaks don't behave as they should
let i: number;
let uVar12: number;
let falloff: number; 
let peakfalloff: number;

let pushdown : number = 0;

let logged: boolean = false;

let colorssmall: string[] = [];
let colorssmall2: string[] = [];

/**
 * Base class of Visualizer (animation frame renderer engine)
 */
export class VisPaintHandler {
  _vis: Vis;
  _ctx: CanvasRenderingContext2D | null;

  constructor(vis: Vis) {
    this._vis = vis;
    this._ctx = vis.canvas!.getContext("2d");
    // this.prepare();
  }

  /**
   * Attempt to build cached bitmaps for later use while rendering a frame.
   * Purpose: fast rendering in animation loop
   */
  prepare() {}

  /**
   * Called once per frame rendering
   */
  paintFrame() {}

  /**
   * Attempt to cleanup cached bitmaps
   */
  dispose() {}
}

//? =============================== BAR PAINTER ===============================
type PaintFrameFunction = () => void;
type PaintBarFunction = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  x2: number,
  barHeight: number,
  peakHeight: number
) => void;

export class BarPaintHandler extends VisPaintHandler {
  _analyser: AnalyserNode;
  _color: string = "rgb(255,255,255)";
  _colorPeak: string = "rgb(255,255,255)";
  // Off-screen canvas for pre-rendering a single bar gradient
  _bar: HTMLCanvasElement = document.createElement("canvas");
  _peak: HTMLCanvasElement = document.createElement("canvas");
  _16h: HTMLCanvasElement = document.createElement("canvas"); // non-stretched
  _bufferLength: number;
  _dataArray: Uint8Array;
  // _ctx: CanvasRenderingContext2D;
  paintBar: PaintBarFunction;
  paintFrame: PaintFrameFunction;

  constructor(vis: Vis) {
    super(vis);
    this._analyser = this._vis.analyser!;
    this._bufferLength = this._analyser.frequencyBinCount;
    this._dataArray = new Uint8Array(this._bufferLength);

    colorssmall = [vis.colors[17], 
                  vis.colors[14], 
                  vis.colors[11], 
                  vis.colors[8], 
                  vis.colors[4]];
    colorssmall2 = [vis.colors[17], 
                    vis.colors[16], 
                    vis.colors[14], 
                    vis.colors[13], 
                    vis.colors[11],
                    vis.colors[10],
                    vis.colors[8],
                    vis.colors[7],
                    vis.colors[5],
                    vis.colors[4],];

    this._16h.width = 1;
    this._16h.height = 16;
    this._16h.setAttribute("width", "75");
    this._16h.setAttribute("height", "16");
    if (this._vis.bandwidth === "wide") {
      this.paintFrame = this.paintFrameWide.bind(this);
    } else {
      // thin
      // does call paintFrameWide but there is a check inside
      // that changes the bandwidth accordingly
      this.paintFrame = this.paintFrameWide.bind(this);
    }

    if (this._vis.coloring === "fire") {
      this.paintBar = this.paintBarFire.bind(this);
    } else if (this._vis.coloring === "line") {
      this.paintBar = this.paintBarLine.bind(this);
    } else {
      this.paintBar = this.paintBarNormal.bind(this);
    }

    if (this._vis.safalloff === "slower"){
      falloff = 3;
    } else if (this._vis.safalloff === "slow"){
      falloff = 6;
    } else if (this._vis.safalloff === "moderate"){
      falloff = 12;
    } else if (this._vis.safalloff === "fast"){
      falloff = 16;
    } else if (this._vis.safalloff === "faster"){
      falloff = 32;
    }

    if (this._vis.sa_peak_falloff === "slower"){
      peakfalloff = 1.05;
    } else if (this._vis.sa_peak_falloff === "slow"){
      peakfalloff = 1.1;
    } else if (this._vis.sa_peak_falloff === "moderate"){
      peakfalloff = 1.2;
    } else if (this._vis.sa_peak_falloff === "fast"){
      peakfalloff = 1.4;
    } else if (this._vis.sa_peak_falloff === "faster"){
      peakfalloff = 1.6;
    }
  }

  prepare() {
    const vis = this._vis;
    if (!vis.canvas) return;

    //? paint peak
    this._peak.height = 1;
    this._peak.width = 1;
    let ctx = this._peak.getContext("2d")!;
    ctx.fillStyle = vis.colors[23];
    ctx.fillRect(0, 0, 1, 1);

    // pushes vis down if not double size, winamp does this
    // BUG: does not take into account if the main window is visible
    // how can i know the state of individual windows?
    if (doubled){
      pushdown = 0;
    } else if(windowShade){
      pushdown = 0;
    } else {
      pushdown = 2;
    }

    //? paint bar
    this._bar.height = 16;
    this._bar.width = 1;
    this._bar.setAttribute("width", "1");
    this._bar.setAttribute("height", "16");
    ctx = this._bar.getContext("2d")!;
    for (let y = 0; y < 16; y++) {
      if (PIXEL_DENSITY === 2 && windowShade){
        ctx.fillStyle = colorssmall2[-y+9]
      } else {
        ctx.fillStyle = windowShade ? colorssmall[-y+4] : vis.colors[2 - pushdown - -y];
      }
      ctx.fillRect(0, y, 1, y + 1);
    }

    // this._ctx = this._vis.canvas.getContext("2d");
  }

  /**
   * ⬜⬜⬜ ⬜⬜⬜
   * 🟧🟧🟧
   * 🟫🟫🟫 🟧🟧🟧
   * 🟫🟫🟫 🟫🟫🟫
   * 🟫🟫🟫 🟫🟫🟫 ⬜⬜⬜
   * 🟫🟫🟫 🟫🟫🟫 🟧🟧🟧
   * 🟫🟫🟫 🟫🟫🟫 🟫🟫🟫
   * 1 bar = multiple pixels
   */
  /**
   * ⬜⬜
   * 🟧
   * 🟫🟧
   * 🟫🟫⬜⬜
   * 🟫🟫🟧
   * 🟫🟫🟫🟧⬜
   * 🟫🟫🟫🟫🟧
   * drawing 1pixel width bars
   */
  paintFrameWide() {
    if (!this._ctx) return;
    const ctx = this._ctx;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = this._color;

    let maxFreqIndex = 512;
    let logMaxFreqIndex = Math.log10(maxFreqIndex);
    let logMinFreqIndex = 0;

    let targetSize: number;
    let maxHeight: number;
    let maxWidth: number;
    if (PIXEL_DENSITY === 2){
      targetSize = 75;
      maxHeight = 10;
    } else {
      targetSize = windowShade ? 40 : 75;  
      maxHeight = windowShade ? 5 : 15;    
    }

    if (windowShade){
      if (PIXEL_DENSITY === 2){
        maxWidth = 75; // this is not 37*2, but if this was 74, we'd be missing a pixel
        // someone here at Nullsoft screwed up...? or thought 74 didn't look good, I don't know.
      } else {
        maxWidth = 37;
      }
    } else {
      maxWidth = 75;
    }

    // This is to roughly emulate the Analyzer in more modern versions of Winamp.
    // 2.x and early 5.x versions had a completely linear(?) FFT, if so desired the
    // scale variable can be set to 1.0

    // This factor controls the scaling from linear to logarithmic.
    // scale = 0.0 -> fully linear scaling
    // scale = 1.0 -> fully logarithmic scaling
    let scale = 0.95;  // Adjust this value between 0.0 and 1.0
    for (let x = 0; x < targetSize; x++) {
        // Linear interpolation between linear and log scaling
        let linearIndex = x / (targetSize - 1) * (maxFreqIndex - 1);
        let logScaledIndex = logMinFreqIndex + (logMaxFreqIndex - logMinFreqIndex) * x / (targetSize - 1);
        let logIndex = Math.pow(10, logScaledIndex);
        
        // Interpolating between linear and logarithmic scaling
        let scaledIndex = (1.0 - scale) * linearIndex + scale * logIndex;

        let index1 = Math.floor(scaledIndex);
        let index2 = Math.ceil(scaledIndex);

        if (index1 >= maxFreqIndex) {
            index1 = maxFreqIndex - 1;
        }
        if (index2 >= maxFreqIndex) {
            index2 = maxFreqIndex - 1;
        }

        if (index1 == index2) {
            sample[x] = out_spectraldata[index1];
        } else {
            let frac2 = scaledIndex - index1;
            let frac1 = 1.0 - frac2;
            sample[x] = (frac1 * out_spectraldata[index1] + frac2 * out_spectraldata[index2]);
        }
    }

    for (let x = 0; x < maxWidth; x++) {
      // Based on research of looking at Winamp 5.666 and 2.63 executables

      // if our bandwidth is "wide", chunk every 5 instances of the bars,
      // add them together and display them
      if (this._vis.bandwidth === "wide"){
        i = (i = x & 0xfffffffc);
        uVar12 = (sample[i + 3] + sample[i + 2] + sample[i + 1] + sample[i]) / 4;
        sadata[x] = uVar12;
      } else {
        sadata[x] = sample[x];
      }

      if (sadata[x] >= maxHeight) {
        sadata[x] = maxHeight;
      }
      safalloff[x] -= falloff / 16.0;
      // Possible bar fall off values are
      // 3, 6, 12, 16, 32
      // Should there ever be some form of config options,
      // these should be used
      // 12 is the default of a fresh new Winamp installation

      if (safalloff[x] <= sadata[x]) {
        safalloff[x] = sadata[x];
      }

      if (sapeaks[x] <= (Math.round(safalloff[x] * 256))) {
        sapeaks[x] = safalloff[x] * 256;
        sadata2[x] = 3.0;
      }

      barPeak[x] = sapeaks[x]/256;

      sapeaks[x] -= Math.round(sadata2[x]);
      sadata2[x] *= peakfalloff;
      // Possible peak fall off values are
      // 1.05f, 1.1f, 1.2f, 1.4f, 1.6f
      // 1.1f is the default of a fresh new Winamp installation
      if (sapeaks[x] <= 0) {
          sapeaks[x] = 0;
      }

      if (windowShade){
        // SORRY NOTHING
        // ironically enough the peaks do appear at the bottom here
      } else {
        if (Math.round(barPeak[x]) < 1){
          barPeak[x] = -3; // Push peaks outside the viewable area, this isn't a Modern Skin!
        }
      }

      // skip rendering if x is 4
      if (!(x == i + 3)) {
        this.paintBar(
          ctx,
          x,
          x,
          Math.round(safalloff[x]) - pushdown,
          barPeak[x] + 1 - pushdown
        );
      }
    }
  }

  /**
   * 🟥
   * 🟧🟧
   * 🟨🟨🟨
   * 🟩🟩🟩🟩
   */
  paintBarNormal(
    ctx: CanvasRenderingContext2D,
    // barIndex: number,
    x: number,
    x2: number,
    barHeight: number,
    peakHeight: number
  ) {
    const h = ctx.canvas.height;
    const y = h - barHeight;

    ctx.drawImage(this._bar, 0, y, 1, h - y, x, y, x2 - x + 1, h - y);

    if (this._vis.peaks) {
      const peakY = h - peakHeight;
      ctx.drawImage(this._peak, 0, 0, 1, 1, x, peakY, x2 - x + 1, 1);
    }
  }

  /**
   * 🟥
   * 🟧🟥
   * 🟨🟧🟥
   * 🟩🟨🟧🟥
   */
  paintBarFire(
    ctx: CanvasRenderingContext2D,
    // barIndex: number,
    x: number,
    x2: number,
    barHeight: number,
    peakHeight: number
  ) {
    const h = ctx.canvas.height;
    let y = h - barHeight;

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

    if (this._vis.peaks) {
      const peakY = h - peakHeight;
      ctx.drawImage(this._peak, 0, 0, 1, 1, x, peakY, x2 - x + 1, 1);
    }
  }

  /**
   * 🟥
   * 🟥🟧
   * 🟥🟧🟨
   * 🟥🟧🟨🟩
   */
  paintBarLine(
    ctx: CanvasRenderingContext2D,
    // barIndex: number,
    x: number,
    x2: number,
    barHeight: number,
    peakHeight: number
  ) {
    const h = ctx.canvas.height;
    let y = h - barHeight;

    if(!logged) {
      console.log("FIXME: Line drawing is currently Fire mode!");
      logged = true;
    }

    ctx.drawImage(
      this._bar,
      0, // sx
      0, // sy
      this._bar.width, // sw
      h - y, // sh
      x,
      y, //  dx,dy
      x2 - x + 1, //dw
      h - y //dh
    );

    if (this._vis.peaks) {
      const peakY = h - peakHeight;
      ctx.drawImage(this._peak, 0, 0, 1, 1, x, peakY, x2 - x + 1, 1);
    }
  }
}

//? =============================== OSCILOSCOPE PAINTER ===============================

type PaintWavFunction = (x: number, y: number, colorIndex: number) => void;

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

export class WavePaintHandler extends VisPaintHandler {
  _analyser: AnalyserNode;
  _bufferLength: number;
  _lastX: number = 0;
  _lastY: number = 0;
  _dataArray: Uint8Array;
  _pixelRatio: number; // 1 or 2
  // Off-screen canvas for drawing perfect pixel (no blured lines)
  _bar: HTMLCanvasElement = document.createElement("canvas");
  _16h: HTMLCanvasElement = document.createElement("canvas"); // non-stretched
  paintWav: PaintWavFunction;

  constructor(vis: Vis) {
    super(vis);
    this._analyser = this._vis.analyser!;
    this._bufferLength = this._analyser.fftSize;
    this._dataArray = new Uint8Array(this._bufferLength);

    this._16h.width = 1;
    this._16h.height = 16;
    this._16h.setAttribute("width", "75");
    this._16h.setAttribute("height", "16");

    //* see https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio#monitoring_screen_resolution_or_zoom_level_changes
    this._pixelRatio = window.devicePixelRatio || 1;

    if (this._vis.oscStyle === "dots") {
      this.paintWav = this.paintWavLine.bind(this);
    } else if (this._vis.oscStyle === "solid") {
      // does call paintWavLine but there is a check inside
      // that changes the oscstyle accordingly
      this.paintWav = this.paintWavLine.bind(this);
    } else {
      this.paintWav = this.paintWavLine.bind(this);
    }
  }

  prepare() {
    if (!this._ctx) {
      console.log("ctx not set!");
      return;
    }
    const vis = this._vis;

    //? paint bar
    this._bar.width = 1;
    this._bar.height = 5;
    this._bar.setAttribute("width", "1");
    this._bar.setAttribute("height", "5");
    const ctx = this._bar.getContext("2d");
    if (ctx) {
      for (let y = 0; y < 5; y++) {
        ctx.fillStyle = vis.colors[18 + y];
        ctx.fillRect(0, y, 1, y + 1);
      }
    }

    this._ctx.imageSmoothingEnabled = false;
    // @ts-ignore
    this._ctx.mozImageSmoothingEnabled = false;
    // @ts-ignore
    this._ctx.webkitImageSmoothingEnabled = false;
    // @ts-ignore
    this._ctx.msImageSmoothingEnabled = false;
  }

  paintFrame() {
    if (!this._ctx) return;
    this._analyser.getByteTimeDomainData(this._dataArray);
    this._dataArray = this._dataArray.slice(0, 576);
    const bandwidth = this._dataArray.length;

    const width = this._ctx!.canvas.width;
    const height = this._ctx!.canvas.height;
    this._ctx!.clearRect(0, 0, width, height);

    const sliceWidth = Math.floor(bandwidth / width);

    let y: number;
    let colorIndex: number;
    // Iterate over the width of the canvas in fixed 75 pixels.
    for (let j = 0; j <= 75; j++) {
      const amplitude = slice1st(this._dataArray, sliceWidth, j);
      // +4 is set to off center the oscilloscope
      // because completely centered looks a bit weird
      if (PIXEL_DENSITY === 2){
        [y, colorIndex] = this.rangeByAmplitude(((amplitude+4)/2)+48);
      } else {
        [y, colorIndex] = this.rangeByAmplitude(windowShade ? ((amplitude+4)/3)+90 : amplitude+4);
      }
      this.paintWav(j, y, colorIndex);
    }
  }

  /**
   *
   * @param amplitude 0..255
   * @returns xy.Y(top to bottom), colorOscIndex
   */
  rangeByAmplitude(amplitude: number): [number, number] {
    // sorry about this mess
    if (windowShade){
      if (amplitude >= 184) {
        return [0, 0];
      }
      if (amplitude >= 176) {
        return [1, 0];
      }
      if (amplitude >= 168) {
        return [2, 0];
      }
      if (amplitude >= 160) {
        return [3, 0];
      }
      if (amplitude >= 152) {
        return [4, 0];
      }
      if (amplitude >= 144) {
        return [5, 0];
      }
      if (amplitude >= 136) {
        return [6, 0];
      }
      if (amplitude >= 128) {
        return [7, 0];
      }
      if (amplitude >= 120) {
        return [8, 0];
      }
      if (amplitude >= 112) {
        return [9, 0];
      }
      if (amplitude >= 104) {
        return [10, 0];
      }
      if (amplitude >= 96) {
        return [11, 0];
      }
      if (amplitude >= 88) {
        return [12, 0];
      }
      if (amplitude >= 80) {
        return [13, 0];
      }
      if (amplitude >= 72) {
        return [14, 0];
      }
      return [15, 0];
    } else {
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
      return [15, 4];
    }
  }

  paintWavLine(x: number, y: number, colorIndex: number) {
    // pushes vis down if not double size, winamp does this
    // has to exist here for some reason else this doesn't work...
    if (doubled){
      pushdown = 0;
    } else if(windowShade){
      pushdown = 0;
    } else {
      pushdown = 2;
    }

    y = windowShade ? y - 5 : y;
    
    if (windowShade && PIXEL_DENSITY === 2){
      y = y < 0 ? 0 : (y > 10 - 1 ? 10 - 1 : y);
    } else {
      y = y < 0 ? 0 : (y > renderHeight - 1 ? renderHeight - 1 : y);
    }
    if (x === 0) this._lastY = y;

    let top = y;
    let bottom = this._lastY;
    this._lastY = y;

    if (this._vis.oscStyle === "solid"){
      if (PIXEL_DENSITY === 2){
        if (y >= (windowShade ? 5 : 8)) {
          top = windowShade ? 5 : 8;
          bottom = y;
        } else {
          top = y;
          bottom = windowShade ? 5 : 7;
        }
      } else {
        if (y >= (windowShade ? 2 : 8)) {
          top = windowShade ? 2 : 8;
          bottom = y;
        } else {
          top = y;
          bottom = windowShade ? 2 : 7;
        }
      }
    } else if (this._vis.oscStyle === "dots") {
      top = y;
      bottom = y;
    } else {
      if (bottom < top) {
        [bottom, top] = [top, bottom];
        if (windowShade){
          // SORRY NOTHING
        } else {
          top++; //top++, that emulates Winamp's/WACUP's OSC behavior correctly
        }
      }
    }

    for (y = top; y <= bottom; y++) {
      this._ctx!.drawImage(
        this._bar,
        0,
        colorIndex, // sx,sy
        1,
        1, // sw,sh
        x, y + pushdown, //dx,dy, dy is upside down because Winamp3/Winamp5 does it, so we have to emulate it
        //set to x, y, for Winamp Classic behavior
        1,
        1 //dw,dh
      );
    }
  }
}

export class NoVisualizerHandler extends VisPaintHandler {
  cleared: boolean = false;
  prepare() {
    this.cleared = false;
  }

  paintFrame() {
    if (!this._ctx) return;
    const ctx = this._ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.cleared = true;
  }
}
