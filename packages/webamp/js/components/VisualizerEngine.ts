import { FFT } from "./FFTNullsoft";

export type VEConfig = {
  canvas: HTMLCanvasElement;
  analyser?: AnalyserNode | null;
  colors: string[];
  mode: "bars" | "oscilloscope" | "none";
  renderHeight: number;
  smallVis: boolean;
  pixelDensity: number;
  doubled: boolean;
  isMWOpen: boolean;
  peaks?: boolean;
  oscStyle?: string;
  bandwidth?: string;
  coloring?: string;
};

export function createVisualizerEngine(cfg: VEConfig) {
  const { canvas, analyser, colors, oscStyle, coloring, smallVis } = cfg;
  const ctx = canvas.getContext("2d")!;

  // minimal reusable buffers (typed)
  const freqBuf = new Uint8Array(512);
  const timeBuf = new Uint8Array(1024);

  // constants adapted from script.js
  const VIS_WIDTH = 75;
  const VIS_HEIGHT = 15;
  const TOTAL_VIS_SIZE = VIS_WIDTH * 2;
  const CANVAS_VIS_WIDTH = VIS_WIDTH + 1;
  const CANVAS_VIS_HEIGHT = VIS_HEIGHT + 1;

  const WINDOWSHADE_WIDTH = CANVAS_VIS_WIDTH / 2;
  const WINDOWSHADE_HEIGHT = CANVAS_VIS_HEIGHT / 4;

  const WINDOWSHADE_DOUBLESIZE_WIDTH = VIS_WIDTH;
  const WINDOWSHADE_DOUBLESIZE_HEIGHT = CANVAS_VIS_HEIGHT / 2 + 1;

  const sadata = new Uint8Array(VIS_WIDTH);
  const sapeaks = new Int32Array(VIS_WIDTH);
  const safalloff = new Float32Array(VIS_WIDTH);
  const sadata2 = new Float32Array(VIS_WIDTH);
  const sample = new Float32Array(512);

  const inWaveData = new Float32Array(1024);
  const outSpectralData = new Float32Array(512);

  const INITIAL_KICK_OFF = 3.0;

  const doubleSized = !!cfg.doubled;
  const isMWOpen = !!cfg.isMWOpen;
  const visMode =
    cfg.mode === "oscilloscope" ? 1 : cfg.mode === "bars" ? 0 : -1;
  const visOscStyle =
    cfg.oscStyle === "lines"
      ? 1
      : cfg.oscStyle === "dots"
      ? 0
      : cfg.oscStyle === "solid"
      ? 2
      : 0;
  const saColorMode = coloring === "normal" ? 0 : coloring === "fire" ? 1 : 2;
  const windowShaded = smallVis;
  const peaks = !!cfg.peaks;
  const wideBars = cfg.bandwidth === "wide" ? 1 : 0;

  const maxFreqIndex = 512;
  const logMaxFreqIndex = Math.log10(maxFreqIndex);
  const logMinFreqIndex = 0;

  let barFalloff = new Array(3, 6, 12, 16, 32);
  let peakFalloff = new Array(1.05, 1.1, 1.2, 1.4, 1.6);

  let bFoSpeed = 2;
  let pFoSpeed = 1;

  // ImageData framebuffer used by SetPixel/vis
  // current canvas buffer size (may vary based on mode/windowShaded/doubleSized)
  let canvasBufWidth = CANVAS_VIS_WIDTH;
  let canvasBufHeight = CANVAS_VIS_HEIGHT;

  function computeBufferSize() {
    if (windowShaded) {
      if (doubleSized) {
        return {
          w: WINDOWSHADE_DOUBLESIZE_WIDTH,
          h: WINDOWSHADE_DOUBLESIZE_HEIGHT + 1,
        };
      }
      return { w: WINDOWSHADE_WIDTH, h: WINDOWSHADE_HEIGHT + 1 };
    }
    return { w: CANVAS_VIS_WIDTH, h: CANVAS_VIS_HEIGHT };
  }

  const fft = new FFT();

  // initialize image buffer with the computed size
  (() => {
    const sz = computeBufferSize();
    canvasBufWidth = sz.w;
    canvasBufHeight = sz.h;
  })();
  let myImageData = ctx.createImageData(canvasBufWidth, canvasBufHeight);

  // Build RGBA palette from cfg.colors (CSS color strings).
  // Uses an offscreen 1x1 canvas to resolve color strings into RGBA.
  const colorProbe = document.createElement("canvas");
  colorProbe.width = 1;
  colorProbe.height = 1;
  const colorProbeCtx = colorProbe.getContext("2d")!;
  const paletteRGBA: number[][] =
    colors && colors.length
      ? colors.map((c) => {
          try {
            colorProbeCtx.clearRect(0, 0, 1, 1);
            colorProbeCtx.fillStyle = c;
            colorProbeCtx.fillRect(0, 0, 1, 1);
            const d = colorProbeCtx.getImageData(0, 0, 1, 1).data;
            return [d[0], d[1], d[2], d[3]];
          } catch {
            return [0, 0, 0, 255];
          }
        })
      : [[0, 0, 0, 255]];

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
      inWaveData[i] = (dataArray[i] - 128) / 24; // is 24 arbitary? yes.
      // i could just make this a constant and call it something stupid like
      // const EYED_VOLUME_LEVEL_FOR_FFT_TO_MORE_OR_LESS_MATCH_WINAMP_IN_TERMS_OF_LOUDNESS = 24;
      // but that would be silly...
    }
    fft.timeToFrequencyDomain(inWaveData, outSpectralData);
    // This is to roughly emulate the Analyzer in more modern versions of Winamp.
    // 2.x and early 5.x versions had a completely linear(?) FFT, if so desired the
    // scale variable can be set to 0.0

    // This factor controls the scaling from linear to logarithmic.
    // scale = 0.0 -> fully linear scaling
    // scale = 1.0 -> fully logarithmic scaling
    const scale = 0.91; // Adjust this value between 0.0 and 1.0
    for (let x = 0; x < analyser.frequencyBinCount; x++) {
      // Linear interpolation between linear and log scaling
      const linearIndex =
        (x / (analyser.frequencyBinCount - 1)) * (maxFreqIndex - 1);
      const logScaledIndex =
        logMinFreqIndex +
        ((logMaxFreqIndex - logMinFreqIndex) * x) /
          (analyser.frequencyBinCount - 1);
      const logIndex = Math.pow(10, logScaledIndex);

      // Interpolating between linear and logarithmic scaling
      const scaledIndex = (1.0 - scale) * linearIndex + scale * logIndex;

      let index1 = Math.floor(scaledIndex);
      let index2 = Math.ceil(scaledIndex);

      if (index1 >= maxFreqIndex) {
        index1 = maxFreqIndex - 1;
      }
      if (index2 >= maxFreqIndex) {
        index2 = maxFreqIndex - 1;
      }

      if (index1 === index2) {
        sample[x] = outSpectralData[index1];
      } else {
        const frac2 = scaledIndex - index1;
        const frac1 = 1.0 - frac2;
        sample[x] =
          frac1 * outSpectralData[index1] + frac2 * outSpectralData[index2];
      }
    }
  }

  function prepare() {
    // called when layout changes — reconfigure ctx and any caches here.
    ctx.imageSmoothingEnabled = false;
    // recompute buffer size for current mode and recreate image buffer
    const sz = computeBufferSize();
    canvasBufWidth = sz.w;
    canvasBufHeight = sz.h;
    myImageData = ctx.createImageData(canvasBufWidth, canvasBufHeight);
  }

  function itru(n: number) {
    return Math.floor(n);
  }

  function SetPixel(img: ImageData, x: number, y: number, c: number) {
    // flip canvas

    // ❤️ Don't flip the canvas.
    // ...
    // Fine. You want to see
    // what happens so bad?
    // Watch what happens when
    // I don't flip the canvas!
    // const fy = y; <-- ❤️ Proceed.
    const fy = canvasBufHeight - 1 - y;

    // palette lookup
    // if we exceed the bounds
    // just paint the first index in the array
    const p = paletteRGBA[c] || paletteRGBA[0];

    // "Let's get crazy." - Bob Ross
    const idx = (fy * canvasBufWidth + x) * 4;
    img.data[idx + 0] = p[0];
    img.data[idx + 1] = p[1];
    img.data[idx + 2] = p[2];
    img.data[idx + 3] = p[3];
  }

  // a simple audio gatherer
  // is kind of an equivalent of winamp's SAAddPCMData function for input plugins
  // except we aren't being fed samples from plugins
  // and just take the preprocessed data from the browser
  function getSample(): number[] {
    // holds both squashed spectrum and oscilloscope data
    const arr = new Array(TOTAL_VIS_SIZE);
    if (!analyser) return arr;

    analyser.getByteTimeDomainData(timeBuf);
    analyser.getByteFrequencyData(freqBuf);

    // it is impossible to implement a proper 576 sample buffer
    // with the web audio api's sliding window buffer
    // so this is the next best thing

    // the reasoning for 576 is the following:
    // (the question was about why winamp DSP plugins
    // can return 576/1152 samples)
    // it was linked into the mp3 decoding originally
    // which produces 1152/576 samples depending
    // on whether it was MPEG-1 or MPEG-2.
    const dataArray576 = timeBuf.slice(0, Math.min(576, timeBuf.length));

    processFFT(analyser, fft, inWaveData, outSpectralData);

    // fill 0..74 with FFT data
    for (let x = 0; x < VIS_WIDTH; x++) {
      // squash down the 512 long FFT buffer into a 75 short buffer
      // preserves all frequency details regardless
      const idxSpec = Math.floor((x / VIS_WIDTH) * sample.length);
      arr[x] = itru(sample[idxSpec]);
    }

    // fill 75..149 with oscilloscope data
    for (let x = 0; x < VIS_WIDTH; x++) {
      // do the same for the oscilloscope buffer
      // but shift the destination by 75 indices to not overwrite the FFT

      // getByteTimeDomainData's center point is shifted from 128 to 0
      // just so we don't have to do any other nasty re-biasing
      // in the actual visualizer function
      const idxTD = Math.trunc((x / VIS_WIDTH) * dataArray576.length);
      arr[x + VIS_WIDTH] = Math.round((dataArray576[idxTD] - 128) / 8);
      // the data is then finally divided by 8
      // just so it ranges from -32..32
    }

    return arr;
  }

  function vis(samples: number[]) {
    // visAdjust simulates the behavior of the scope and analyzer
    // being pushed "down" by 2 pixels whenever we are not in doublesize mode
    // technically this isn't accurate to the decompilation effort
    // however i found it extremely overkill to then also handle painting
    // doublesize mode and non-doublesize mode in separate conditions
    // no ambiguity: use normalized booleans
    // if main window is closed => always shifted (-2).
    // when main window is open, doubled controls whether to remove the shift.
    const visAdjust = isMWOpen && doubleSized ? 0 : -2;

    // going forward, SetPixel handles plotting the pixels to our framebuffer
    // at the specified x and y coordinates, but also handles the way the visualizer
    // works by selecting colors, as from what i could tell, the visualizer
    // uses indexed RGB, and viscolor.txt is our palette to paint it in
    // all sorts of beautiful colors, that is the 4th parameter
    if (windowShaded) {
      for (let x = 0; x < VIS_WIDTH + 1; x++) {
        for (let y = 0; y < VIS_HEIGHT + 1; y++) {
          if (x % 2 == 1 || y % 2 == 1) {
            SetPixel(myImageData, x, y, 0);
          } else {
            SetPixel(myImageData, x, y, 0);
          }
        }
      }
    } else {
      for (let x = 0; x < VIS_WIDTH + 1; x++) {
        for (let y = 0; y < VIS_HEIGHT + 1; y++) {
          if (x % 2 == 1 || y % 2 == 1) {
            SetPixel(myImageData, x, y, 0);
          } else {
            SetPixel(myImageData, x, y, 1);
          }
        }
      }
    }

    if (!windowShaded) {
      if (visMode == 1) {
        // from Winamp 2.63, decompiled from Ghidra, cleaned up and ported with GPT-5.1
        let prevV = -1;

        for (let x = 0; x < VIS_WIDTH; x++) {
          // shifts the array of samples by x + VIS_WIDTH so we can get the oscilloscope data
          // the resulting data is then shifted by + 8 in the Y axis to center the scope
          // as our data starts at 0 and we dont necessarily need it there
          let v = samples[x + VIS_WIDTH] + 8;

          // clamps v to 0..15
          v = v < 0 ? 0 : v > VIS_HEIGHT ? VIS_HEIGHT : v;

          // this is a funky way of getting the colors for the oscilloscope
          // there are only 5 colors defined for the scope in viscolors.txt
          // to ensure we get the proper colors, v is halved by 2,
          // then shifted downward by 4, after which we apply the abs() function
          // to make sure we never ever go below 0
          // finally, to get in range, we shift the final result by + 18
          // which is where the defined colors for the oscilloscope lie
          let color = Math.abs(itru(v / 2 + -4)) + 18;

          if (visOscStyle == 0) {
            // dots
            SetPixel(myImageData, x, v + visAdjust, color);
          } else if (visOscStyle === 1) {
            // prevV being set to -1 has a purpose, as we check here if it's ever -1, and if so,
            // we apply v to it, this allows us to later on keep the last amplitude value
            // of the previous iteration, which then allows us to draw the ascending lines
            // going from the previous value to v
            if (prevV == -1) prevV = v;

            if (v < prevV) {
              // draws the descending line that's less smoothly connected
              let h = prevV - v; // height to fill downward
              let yy = v; // start from the new value and go downwards
              while (h !== 0) {
                SetPixel(myImageData, x, yy + visAdjust, color);
                yy++; // move downward (toward larger y)
                h--; // one pixel drawn - one less to go
              }
            } else {
              // draws the ascending line that is more tightly connected
              // this is where prevV really is more obvious to see in action
              let h = v - prevV + 1; // height to fill upward
              let yy = v; // start at the new peak and go upward
              while (h !== 0) {
                SetPixel(myImageData, x, yy + visAdjust, color);
                yy--; // move upward (toward smaller y)
                h--; // one pixel drawn - one less to go
              }
            }
            // update prevV to v after we're done
            prevV = v;
          } else if (visOscStyle === 2) {
            // draws a solid filled scope starting from the middle
            if (v < 8) {
              let h = 8 - v;
              let yy = v;
              while (h !== 0) {
                SetPixel(myImageData, x, yy + visAdjust, color);
                yy++;
                h--;
              }
            } else {
              let h = v - 7;
              let yy = v;
              while (h !== 0) {
                SetPixel(myImageData, x, yy + visAdjust, color);
                yy--;
                h--;
              }
            }
          }
        }
      } else if (visMode == 0) {
        let chunker, chunkedData;
        for (let x = 0; x < VIS_WIDTH; x++) {
          // set the samples buffer past 75 to 0, to avoid oscilloscope data leakage
          // this can theoretically be done by checking the visMode in getSamples()
          // and blank the other mode when necessary
          samples[x + VIS_WIDTH] = 0;

          if (wideBars) {
            // when wideBars is enabled, each bar represents a 4-sample chunk
            // i = x & ~3 clears the lowest 2 bits of x (bitwise AND with 11111100)
            // effectively rounding x down to the nearest multiple of 4:
            // 0-0, 1-0, 2-0, 3-0, 4-4, 5-4, ...
            chunker = x & ~3;

            // get the chunks for this iteration and average them, then divide by 4
            chunkedData =
              (samples[chunker] +
                samples[chunker + 1] +
                samples[chunker + 2] +
                samples[chunker + 3]) >>
              2;
          } else {
            // just take the original array and leave
            chunkedData = itru(samples[x]);
          }

          if (chunkedData >= VIS_HEIGHT) {
            chunkedData = VIS_HEIGHT;
          }

          // barFalloff is the array that holds 5 values
          // these values determine how fast the analyzer should fall per tick
          // dividing the value by 16.0f ensures that it doesn't fall super fast
          // so it isnt that reactive to change
          safalloff[x] -= barFalloff[bFoSpeed] / 16.0;

          // ensure that we're ALWAYS above safalloff
          if (safalloff[x] <= chunkedData) {
            safalloff[x] = chunkedData;
          }

          // peak detection:
          // convert falloff to 0..4095 domain and compare to stored peak
          // when falloff exceeds the peak, update peak position
          if (sapeaks[x] <= itru(safalloff[x] * 256)) {
            sapeaks[x] = safalloff[x] * 256;
            sadata2[x] = INITIAL_KICK_OFF;
          }

          // saColorMode:
          //   1: normal spectrum gradient (low > dark, high > bright)
          //   2: inverted gradient (low > bright, high > dark)
          //   else: flat base color at index 17
          let px;
          let level = itru(safalloff[x]);

          if (saColorMode == 1) px = level + 2;
          else if (saColorMode == 2) px = 17 - level;
          else px = 17;

          let roundedBar = itru(level);
          let roundedPeak = itru(sapeaks[x] / 256);

          // skip drawing the 4th column of each 4-sample block when wideBars == 1
          // (x & 3) == 3 means x % 4 == 3 → the last column in a block of 4
          // otherwise, if wideBars not true, give us everything
          if (wideBars !== 1 || (x & 3) !== 3) {
            if (saColorMode == 2) {
              for (let i = 0; i < roundedBar; i++) {
                SetPixel(myImageData, x, i + visAdjust, px);
              }
            } else if (roundedBar > 0) {
              // non-inverted modes: draw gradient shading downward from px
              let fall = 0;
              for (let i = 0; i < roundedBar; i++) {
                let shade = itru(px - fall / 15);
                SetPixel(myImageData, x, i + visAdjust, shade);
                fall += 15;
              }
            }

            // 23 is the index in our palette which defines what color the peaks should be
            if (peaks && roundedPeak > 0 && roundedPeak < 16) {
              SetPixel(myImageData, x, roundedPeak + visAdjust, 23);
            }
          }

          // peak falloff handling:
          // decrease stored peak by the current peak falloff speed
          sapeaks[x] -= itru(sadata2[x]);

          // decay the peak falloff speed itself using peakFalloff
          sadata2[x] *= peakFalloff[pFoSpeed];
          if (sapeaks[x] <= 0) {
            sapeaks[x] = 0;
          }
        }
      }
    } else {
      if (doubleSized) {
        if (visMode == 0) {
          let chunker, chunkedData;
          for (let x = 0; x < VIS_WIDTH; x++) {
            samples[x + VIS_WIDTH] = 0;
            if (wideBars) {
              chunker = x & ~3;
              chunkedData =
                (samples[chunker] +
                  samples[chunker + 1] +
                  samples[chunker + 2] +
                  samples[chunker + 3]) >>
                2;
            } else {
              chunkedData = samples[x];
            }

            if (chunkedData >= VIS_HEIGHT) {
              chunkedData = VIS_HEIGHT;
            }

            safalloff[x] -= barFalloff[bFoSpeed] / 16.0;

            if (safalloff[x] <= chunkedData) {
              safalloff[x] = chunkedData;
            }

            if (sapeaks[x] <= itru(safalloff[x] * 256)) {
              sapeaks[x] = safalloff[x] * 256;
              sadata2[x] = 3.0;
            }

            let px;
            let level = itru(safalloff[x]);

            if (saColorMode == 1) px = level + 2;
            else if (saColorMode == 2) px = 17 - level;
            else px = 17;

            let roundedBar = itru((itru(level) * 10) / 15);
            if (roundedBar > 10) roundedBar = 10;

            let roundedPeak = itru(((sapeaks[x] / 256) * 10) / 15);
            if (roundedPeak > 10) roundedPeak = 10;

            if (wideBars !== 1 || (x & 3) !== 3) {
              if (saColorMode == 2) {
                for (let i = 0; i < roundedBar; i++) {
                  SetPixel(myImageData, x, i /* + 6*/, px);
                }
              } else if (roundedBar > 0) {
                let fall = 0;
                for (let i = 0; i < roundedBar; i++) {
                  // fall / 10
                  // gets us more accurate and precise representation of what should be happening
                  let fallDiv10 = Number((BigInt(fall) * 0xcccccccdn) >> 35n);
                  let shade = px - fallDiv10;
                  SetPixel(myImageData, x, i /* + 6*/, shade);
                  fall += 15;
                }
              }

              if (peaks && roundedPeak >= 0 && roundedPeak < 10) {
                SetPixel(myImageData, x, roundedPeak /* + 6*/, 23);
              }
            }

            sapeaks[x] -= itru(sadata2[x]);
            sadata2[x] *= peakFalloff[pFoSpeed];
            if (sapeaks[x] <= 0) {
              sapeaks[x] = 0;
            }
          }
        } else if (visMode == 1) {
          let prevV = -5;
          for (let x = 0; x < WINDOWSHADE_DOUBLESIZE_WIDTH; x++) {
            let v =
              (samples[x + WINDOWSHADE_DOUBLESIZE_WIDTH] + 8) *
              (WINDOWSHADE_DOUBLESIZE_HEIGHT + 1);
            // shifts v right by 31 bits to extract the sign bit (0 if positive, -1 if negative)
            // "& 15" converts the sign bit into either 0 (for positive v) or 15 (for negative v)
            // adds this value to v before the final shift
            // final ">> 4" divides by 16, but with correction for negative values
            //
            // net effect: arithmetic division by 16 that rounds negative values toward zero
            v = (v + ((v >> 31) & 0x0f)) >> 4;
            v =
              v < 0
                ? 0
                : v > WINDOWSHADE_DOUBLESIZE_HEIGHT
                ? WINDOWSHADE_DOUBLESIZE_HEIGHT
                : v;

            // this is technically a bug, since there is no reason to see if prevV is -5
            // for accuracies sake however, this is preserved and will not be fixed
            if (visOscStyle == 0 || prevV == -5) {
              SetPixel(myImageData, x, v /* + 6*/, 18);
              prevV = v;
            } else if (visOscStyle == 1) {
              let diff = v - prevV;
              let count = (diff < 0 ? -diff : diff) + 1;

              let yy = v;

              if (diff < 0) {
                // going DOWN
                while (count--) {
                  SetPixel(myImageData, x, yy /* + 6*/, 18);
                  yy++; // move downward
                }
              } else {
                // going UP
                while (count--) {
                  SetPixel(myImageData, x, yy /* + 6*/, 18);
                  yy--; // move upward
                }
              }

              prevV = v;
            } else if (visOscStyle == 2) {
              if (v < 4) {
                let h = 5 - v;
                let yy = v;
                while (h !== 0) {
                  SetPixel(myImageData, x, yy /* + 6*/, 18);
                  yy++;
                  h--;
                }
              } else {
                let h = v - 3;
                let yy = v;
                while (h !== 0) {
                  SetPixel(myImageData, x, yy /* + 6*/, 18);
                  yy--;
                  h--;
                }
              }
            }
          }
        }
      } else {
        if (visMode == 0) {
          let chunker, chunkedData;
          // unsure why 38 - 1 was being done here
          // technically a bug, won't fix
          for (let x = 0; x < WINDOWSHADE_WIDTH - 1; x++) {
            samples[x + VIS_WIDTH] = 0;
            if (visMode == 0) {
              if (wideBars) {
                chunker = (x & ~3) * 2;
                chunkedData =
                  (samples[chunker] +
                    samples[chunker + 1] +
                    samples[chunker + 2] +
                    samples[chunker + 3]) >>
                  2;
              } else {
                chunkedData =
                  itru(itru(samples[x * 2]) + itru(samples[x * 2 + 1])) / 2;
              }
            }
            if (chunkedData >= 15) {
              chunkedData = 15;
            }

            safalloff[x * 2] -= barFalloff[bFoSpeed] / 16.0;

            if (safalloff[x * 2] <= chunkedData) {
              safalloff[x * 2] = chunkedData;
            }

            if (sapeaks[x * 2] <= itru(safalloff[x * 2] * 256)) {
              sapeaks[x * 2] = safalloff[x * 2] * 256;
              sadata2[x * 2] = 3.0;
            }

            let px;
            let level = itru(safalloff[x * 2]);

            if (saColorMode == 1) px = level + 2;
            else if (saColorMode == 2) px = 17 - level;
            else px = 17;

            let roundedBar = itru(
              (itru(level) * (WINDOWSHADE_HEIGHT + 1)) / VIS_HEIGHT
            );
            if (roundedBar > WINDOWSHADE_HEIGHT + 1)
              roundedBar = WINDOWSHADE_HEIGHT + 1;

            let roundedPeak = itru(
              ((sapeaks[x * 2] / 256) * (WINDOWSHADE_HEIGHT + 1)) / VIS_HEIGHT
            );
            if (roundedPeak > WINDOWSHADE_HEIGHT + 1)
              roundedPeak = WINDOWSHADE_HEIGHT + 1;

            if (wideBars !== 1 || (x & 3) !== 3) {
              if (saColorMode == 2) {
                for (let i = 0; i < roundedBar; i++) {
                  SetPixel(myImageData, x, i /* + 11 */, px);
                }
              } else if (roundedBar > 0) {
                let fall = 0;
                for (let i = 0; i < roundedBar; i++) {
                  let shade = itru(px - fall / (WINDOWSHADE_HEIGHT + 1));
                  SetPixel(myImageData, x, i /* + 11 */, shade);
                  fall += 15;
                }
              }

              if (
                peaks &&
                roundedPeak >= 0 &&
                roundedPeak < WINDOWSHADE_HEIGHT + 1
              ) {
                SetPixel(myImageData, x, roundedPeak /* + 11 */, 23);
              }
            }

            sapeaks[x * 2] -= itru(sadata2[x * 2]);
            sadata2[x * 2] *= peakFalloff[pFoSpeed];
            if (sapeaks[x * 2] <= 0) {
              sapeaks[x * 2] = 0;
            }
          }
        } else if (visMode == 1) {
          let prevV = -5;
          for (let x = 0; x < WINDOWSHADE_WIDTH; x++) {
            let v = (samples[x + VIS_WIDTH] + 8) * (WINDOWSHADE_HEIGHT + 1);
            v = (v + ((v >> 31) & 15)) >> 4;
            v = v < 0 ? 0 : v > WINDOWSHADE_HEIGHT ? WINDOWSHADE_HEIGHT : v;

            if (visOscStyle == 0 || prevV == -5) {
              SetPixel(myImageData, x, v /* + 11 */, 18);
              prevV = v;
            } else if (visOscStyle == 1) {
              let diff = v - prevV;
              let count = (diff < 0 ? -diff : diff) + 1;

              let yy = v;

              if (diff < 0) {
                // going DOWN
                while (count--) {
                  SetPixel(myImageData, x, yy /* + 11 */, 18);
                  yy++; // move downward
                }
              } else {
                // going UP
                while (count--) {
                  SetPixel(myImageData, x, yy /* + 11 */, 18);
                  yy--; // move upward
                }
              }

              prevV = v;
            } else if (visOscStyle == 2) {
              if (v < 2) {
                let h = 3 - v;
                let yy = v;
                while (h !== 0) {
                  SetPixel(myImageData, x, yy /* + 11 */, 18);
                  yy++;
                  h--;
                }
              } else {
                let h = v - 1;
                let yy = v;
                while (h !== 0) {
                  SetPixel(myImageData, x, yy /* + 11 */, 18);
                  yy--;
                  h--;
                }
              }
            }
          }
        }
      }
    }
  }

  function paintFrame() {
    if (!ctx) return;
    if (!analyser || cfg.mode === "none") {
      // nothing to draw — caller may clear
      return;
    }

    // gather samples, render into image buffer, and blit
    vis(getSample());
    ctx.putImageData(myImageData, 0, 0);
  }

  return { prepare, paintFrame };
}
