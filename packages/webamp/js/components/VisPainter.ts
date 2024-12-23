export interface Vis {
  canvas: HTMLCanvasElement;
  colors: string[];
  analyser?: AnalyserNode;
  oscStyle?: "dots" | "solid" | "lines";
  bandwidth?: "wide" | "thin";
  coloring?: "fire" | "line" | "normal";
  peaks?: boolean;
  saFalloff?: "slower" | "slow" | "moderate" | "fast" | "faster";
  saPeakFalloff?: "slower" | "slow" | "moderate" | "fast" | "faster";
  sa?: "analyzer" | "oscilloscope" | "none";
  renderHeight?: number;
  smallVis?: boolean;
  pixelDensity?: number;
  doubled?: boolean;
  isMWOpen?: boolean;
}
import { FFT } from "./FFTNullsoft";

/**
 * Base class of Visualizer (animation frame renderer engine)
 */
export class VisPaintHandler {
  _vis: Vis;
  _ctx: CanvasRenderingContext2D | null;

  constructor(vis: Vis) {
    this._vis = vis;
    this._ctx = vis.canvas!.getContext("2d");
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

/**
 * Feeds audio data to the FFT.
 * @param analyser The AnalyserNode used to get the audio data.
 * @param fft The FFTNullsoft instance from the PaintHandler.
 */
function processFFT(
  analyser: AnalyserNode,
  fft: FFT,
  inWaveData: Float32Array,
  outSpectralData: Float32Array
): void {
  const dataArray = new Uint8Array(1024);

  analyser.getByteTimeDomainData(dataArray);
  for (let i = 0; i < dataArray.length; i++) {
    inWaveData[i] = (dataArray[i] - 128) / 28;
  }
  fft.timeToFrequencyDomain(inWaveData, outSpectralData);
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
  private saPeaks: Int16Array;
  private saData2: Float32Array;
  private saData: Int16Array;
  private saFalloff: Float32Array;
  private sample: Float32Array;
  private barPeak: Int16Array;
  private chunk: number;
  private uVar12: number;
  private falloff: number;
  private peakFalloff: number;
  private pushDown: number;

  private inWaveData = new Float32Array(1024);
  private outSpectralData = new Float32Array(512);

  _analyser: AnalyserNode;
  _fft: FFT;
  _color: string = "rgb(255,255,255)";
  _colorPeak: string = "rgb(255,255,255)";
  // Off-screen canvas for pre-rendering a single bar gradient
  _bar: HTMLCanvasElement = document.createElement("canvas");
  _peak: HTMLCanvasElement = document.createElement("canvas");
  _16h: HTMLCanvasElement = document.createElement("canvas"); // non-stretched
  _bufferLength: number;
  _dataArray: Uint8Array;
  logged: boolean = false;
  colorssmall: string[];
  colorssmall2: string[];
  _renderHeight: number;
  _smallVis: boolean;
  _pixelDensity: number;
  _doubled: boolean;
  _isMWOpen: boolean;
  paintBar: PaintBarFunction;
  paintFrame: PaintFrameFunction;

  constructor(vis: Vis) {
    super(vis);
    this._analyser = this._vis.analyser!;
    this._fft = new FFT();
    this._bufferLength = this._analyser.frequencyBinCount;
    this._dataArray = new Uint8Array(this._bufferLength);

    this._renderHeight = vis.renderHeight!;
    this._smallVis = vis.smallVis!;
    this._pixelDensity = vis.pixelDensity!;
    this._doubled = vis.doubled!;
    this._isMWOpen = vis.isMWOpen!;

    this.colorssmall = [
      vis.colors[17],
      vis.colors[14],
      vis.colors[11],
      vis.colors[8],
      vis.colors[4],
    ];
    this.colorssmall2 = [
      vis.colors[17],
      vis.colors[16],
      vis.colors[14],
      vis.colors[13],
      vis.colors[11],
      vis.colors[10],
      vis.colors[8],
      vis.colors[7],
      vis.colors[5],
      vis.colors[4],
    ];

    this.logged;

    this._16h.width = 1;
    this._16h.height = 16;
    this._16h.setAttribute("width", "75");
    this._16h.setAttribute("height", "16");

    // draws the analyzer and handles changing the bandwidth correctly
    this.paintFrame = this.paintAnalyzer.bind(this);

    this.saPeaks = new Int16Array(76).fill(0);
    this.saData2 = new Float32Array(76).fill(0);
    this.saData = new Int16Array(76).fill(0);
    this.saFalloff = new Float32Array(76).fill(0);
    this.sample = new Float32Array(76).fill(0);
    this.barPeak = new Int16Array(76).fill(0); // Needs to be specified as Int16 else the peaks don't behave as they should
    this.chunk = 0;
    this.uVar12 = 0;
    this.pushDown = 0;

    this.inWaveData;
    this.outSpectralData;

    switch (this._vis.coloring) {
      case "fire":
        this.paintBar = this.paintBarFire.bind(this);
        break;
      case "line":
        this.paintBar = this.paintBarLine.bind(this);
        break;
      default:
        this.paintBar = this.paintBarNormal.bind(this);
        break;
    }

    switch (this._vis.saFalloff) {
      case "slower":
        this.falloff = 3;
        break;
      case "slow":
        this.falloff = 6;
        break;
      case "moderate":
        this.falloff = 12;
        break;
      case "fast":
        this.falloff = 16;
        break;
      case "faster":
        this.falloff = 32;
        break;
      default:
        this.falloff = 12;
        break;
    }

    switch (this._vis.saPeakFalloff) {
      case "slower":
        this.peakFalloff = 1.05;
        break;
      case "slow":
        this.peakFalloff = 1.1;
        break;
      case "moderate":
        this.peakFalloff = 1.2;
        break;
      case "fast":
        this.peakFalloff = 1.4;
        break;
      case "faster":
        this.peakFalloff = 1.6;
        break;
      default:
        this.peakFalloff = 1.1;
        break;
    }
  }

  prepare() {
    const vis = this._vis;
    processFFT(
      this._analyser,
      this._fft,
      this.inWaveData,
      this.outSpectralData
    );

    //? paint peak
    this._peak.height = 1;
    this._peak.width = 1;
    let ctx = this._peak.getContext("2d")!;
    ctx.fillStyle = vis.colors[23];
    ctx.fillRect(0, 0, 1, 1);

    if (this._vis.smallVis) {
      this.pushDown = 0;
    } else if (this._vis.doubled && !this._vis.isMWOpen) {
      this.pushDown = 2;
    } else if (this._vis.doubled) {
      this.pushDown = 0;
    } else {
      this.pushDown = 2;
    }

    //? paint bar
    this._bar.height = 16;
    this._bar.width = 1;
    this._bar.setAttribute("width", "1");
    this._bar.setAttribute("height", "16");
    ctx = this._bar.getContext("2d")!;
    for (let y = 0; y < 16; y++) {
      if (this._vis.pixelDensity === 2 && this._vis.smallVis) {
        ctx.fillStyle = this.colorssmall2[-y + 9];
      } else {
        ctx.fillStyle = this._vis.smallVis
          ? this.colorssmall[-y + 4]
          : vis.colors[2 - this.pushDown - -y];
      }
      ctx.fillRect(0, y, 1, y + 1);
    }
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
  paintAnalyzer() {
    if (!this._ctx) return;
    const ctx = this._ctx;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.fillStyle = this._color;

    let maxFreqIndex = 512;
    let logMaxFreqIndex = Math.log10(maxFreqIndex);
    let logMinFreqIndex = 0;

    let targetSize: number;
    let maxHeight: number;
    let maxWidth: number;
    if (this._vis.pixelDensity === 2) {
      targetSize = 75;
      maxHeight = 10;
    } else {
      targetSize = this._vis.smallVis ? 40 : 75;
      maxHeight = this._vis.smallVis ? 5 : 15;
    }

    if (this._vis.smallVis) {
      if (this._vis.pixelDensity === 2) {
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
    // scale variable can be set to 0.0

    // This factor controls the scaling from linear to logarithmic.
    // scale = 0.0 -> fully linear scaling
    // scale = 1.0 -> fully logarithmic scaling
    let scale = 0.91; // Adjust this value between 0.0 and 1.0
    for (let x = 0; x < targetSize; x++) {
      // Linear interpolation between linear and log scaling
      let linearIndex = (x / (targetSize - 1)) * (maxFreqIndex - 1);
      let logScaledIndex =
        logMinFreqIndex +
        ((logMaxFreqIndex - logMinFreqIndex) * x) / (targetSize - 1);
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
        this.sample[x] = this.outSpectralData[index1];
      } else {
        let frac2 = scaledIndex - index1;
        let frac1 = 1.0 - frac2;
        this.sample[x] =
          frac1 * this.outSpectralData[index1] +
          frac2 * this.outSpectralData[index2];
      }
    }

    for (let x = 0; x < maxWidth; x++) {
      // Based on research of looking at Winamp 5.666 and 2.63 executables

      // if our bandwidth is "wide", chunk every 5 instances of the bars,
      // add them together and display them
      if (this._vis.bandwidth === "wide") {
        this.chunk = this.chunk = x & 0xfffffffc;
        this.uVar12 =
          (this.sample[this.chunk + 3] +
            this.sample[this.chunk + 2] +
            this.sample[this.chunk + 1] +
            this.sample[this.chunk]) /
          4;
        this.saData[x] = this.uVar12;
      } else {
        this.chunk = 0;
        this.saData[x] = this.sample[x];
      }

      if (this.saData[x] >= maxHeight) {
        this.saData[x] = maxHeight;
      }

      // prevents saPeaks going out of bounds when switching to windowShade mode
      if (this.saPeaks[x] >= maxHeight * 256) {
        this.saPeaks[x] = maxHeight * 256;
      }

      this.saFalloff[x] -= this.falloff / 16.0;
      // Possible bar fall off values are
      // 3, 6, 12, 16, 32
      // Should there ever be some form of config options,
      // these should be used
      // 12 is the default of a fresh new Winamp installation

      if (this.saFalloff[x] <= this.saData[x]) {
        this.saFalloff[x] = this.saData[x];
      }

      if (this.saPeaks[x] <= Math.round(this.saFalloff[x] * 256)) {
        this.saPeaks[x] = this.saFalloff[x] * 256;
        this.saData2[x] = 3.0;
      }

      this.barPeak[x] = this.saPeaks[x] / 256;

      this.saPeaks[x] -= Math.round(this.saData2[x]);
      this.saData2[x] *= this.peakFalloff;
      // Possible peak fall off values are
      // 1.05f, 1.1f, 1.2f, 1.4f, 1.6f
      // 1.1f is the default of a fresh new Winamp installation
      if (this.saPeaks[x] <= 0) {
        this.saPeaks[x] = 0;
      }

      if (this._vis.smallVis) {
        // SORRY NOTHING
        // ironically enough the peaks do appear at the bottom here
      } else {
        if (Math.round(this.barPeak[x]) < 1) {
          this.barPeak[x] = -3; // Push peaks outside the viewable area, this isn't a Modern Skin!
        }
      }

      // skip rendering if x is 4
      if (!(x === this.chunk + 3 && this._vis.bandwidth === "wide")) {
        this.paintBar(
          ctx,
          x,
          x,
          Math.round(this.saFalloff[x]) - this.pushDown,
          this.barPeak[x] + 1 - this.pushDown
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
    x: number,
    x2: number,
    barHeight: number,
    peakHeight: number
  ) {
    const h = ctx.canvas.height;
    let y = h - barHeight;

    if (!this.logged) {
      console.log("FIXME: Line drawing is currently Fire mode!");
      this.logged = true;
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

//? =============================== OSCILLOSCOPE PAINTER ===============================

type PaintWavFunction = (x: number, y: number) => void;

function slice1st(
  dataArray: Uint8Array,
  sliceWidth: number,
  sliceNumber: number
): number {
  const start = sliceWidth * sliceNumber;
  return dataArray[start];
}

export class WavePaintHandler extends VisPaintHandler {
  private pushDown: number;

  _analyser: AnalyserNode;
  _bufferLength: number;
  _lastX: number = 0;
  _lastY: number = 0;
  _dataArray: Uint8Array;
  _pixelRatio: number; // 1 or 2
  // Off-screen canvas for drawing perfect pixel (no blurred lines)
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

    // draws the oscilloscope and handles overly complex operations
    // in relation to oscilloscope style and main window states
    this.paintWav = this.paintOscilloscope.bind(this);
    this.pushDown = 0;
  }

  prepare() {
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
    
    // @ts-ignore
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

    // width would technically be correct, but if the main window is
    // in windowshade mode, it is set to 150, making sliceWidth look
    // wrong in that mode, concerning the oscilloscope
    const sliceWidth = Math.floor(bandwidth / 75);

    // Iterate over the width of the canvas in fixed 75 pixels.
    for (let j = 0; j <= 75; j++) {
      const amplitude = slice1st(this._dataArray, sliceWidth, j);
      this.paintWav(j, amplitude);
    }
  }

  /**
   *
   * @param y 0..5
   * @returns value in use for coloring stuff in
   */
  colorIndex(y: number): number {
    if (this._vis.smallVis) {
      return 0;
    } else {
      if (y >= 14) return 4;
      if (y >= 12) return 3;
      if (y >= 10) return 2;
      if (y >= 8) return 1;
      if (y >= 6) return 0;
      if (y >= 4) return 1;
      if (y >= 2) return 2;
      if (y >= 0) return 3;
      return 3;
    }
  }

  paintOscilloscope(x: number, y: number) {
    // we skip rendering of the oscilloscope if we are in windowShade mode
    // previously the renderWidth variable in Vis.tsx scaled down the width
    // of the canvas, but i didn't really like the idea since we squished
    // down the result of y to fit within 35/75 pixels, winamp doesn't
    // squish it's audio data down in the x axis, resulting in only
    // getting a small portion of what we hear, they did it, so do we
    if (this._vis.smallVis && this._vis.doubled) {
      if (x >= 75) {
        // SORRY NOTHING
        return;
      }
    } else if (x >= (this._vis.smallVis ? 38 : 75)) {
      // SORRY NOTHING
      return;
    }
    // pushes vis down if not double size, winamp does this
    if (this._vis.smallVis) {
      this.pushDown = 0;
    } else if (this._vis.doubled && !this._vis.isMWOpen) {
      this.pushDown = 2;
    } else if (this._vis.doubled) {
      this.pushDown = 0;
    } else {
      this.pushDown = 2;
    }

    // rounds y down to the nearest int
    // before that even happens, y is scaled down and then doubled again (could've done * 8
    // but i feel this makes more sense to me)
    // y is then adjusted downward to be in the center of the scope
    y = Math.round((y / 16) * 2) - 9;

    // adjusts the center point of y if we are in windowShade mode, and if pixelDensity is 2
    // where it's adjusted further to give you the fullest view possible in that small window
    // else we leave y as is
    let yadjust: number;
    if (this._vis.pixelDensity == 2) yadjust = 3;
    else yadjust = 5;
    y = this._vis.smallVis ? y - yadjust : y;

    // scales down the already scaled down result of y to 0..10 or 0..5, depending on
    // if pixelDensity returns 2, this serves the purpose of avoiding full sending
    // y to that really tiny space we have there
    if (this._vis.smallVis && this._vis.pixelDensity === 2) {
      y = Math.round(((y + 11) / 16) * 10) - 5;
    } else if (this._vis.smallVis) {
      y = Math.round(((y + 11) / 16) * 5) - 2;
    }

    // clamp y to be within a certain range, here it would be 0..10 if both windowShade and pixelDensity apply
    // else we clamp y to 0..15 or 0..3, depending on renderHeight
    if (this._vis.smallVis && this._vis.pixelDensity === 2) {
      y = y < 0 ? 0 : y > 10 - 1 ? 10 - 1 : y;
    } else {
      y =
        y < 0
          ? 0
          : y > this._vis.renderHeight - 1
          ? this._vis.renderHeight - 1
          : y;
    }
    let v = y;
    if (x === 0) this._lastY = y;

    let top = y;
    let bottom = this._lastY;
    this._lastY = y;

    if (this._vis.oscStyle === "solid") {
      if (this._vis.pixelDensity === 2) {
        if (y >= (this._vis.smallVis ? 5 : 8)) {
          top = this._vis.smallVis ? 5 : 8;
          bottom = y;
        } else {
          top = y;
          bottom = this._vis.smallVis ? 5 : 7;
        }
        if (x === 0 && this._vis.smallVis) {
          // why? i dont know!!
          top = y;
          bottom = y;
        }
      } else {
        if (y >= (this._vis.smallVis ? 2 : 8)) {
          top = this._vis.smallVis ? 2 : 8;
          bottom = y;
        } else {
          top = y;
          bottom = this._vis.smallVis ? 2 : 7;
        }
        if (x === 0 && this._vis.smallVis) {
          // why? i dont know!!
          top = y;
          bottom = y;
        }
      }
    } else if (this._vis.oscStyle === "dots") {
      top = y;
      bottom = y;
    } else {
      if (bottom < top) {
        [bottom, top] = [top, bottom];
        if (this._vis.smallVis) {
          // SORRY NOTHING
          // really just removes the smoother line descending thing that's present in the Main Window
        } else {
          top++; //top++, that emulates Winamp's/WACUP's OSC behavior correctly
        }
      }
    }

    for (y = top; y <= bottom; y++) {
      this._ctx!.drawImage(
        this._bar,
        0,
        this.colorIndex(v), // sx,sy
        1,
        1, // sw,sh
        x,
        y + this.pushDown,
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
    this.cleared = true;
  }
}
