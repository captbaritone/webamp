// The Web Audio API's FFT is bad, so this exists now!
// Taken from https://github.com/WACUP/vis_classic/tree/master/FFTNullsoft

export class FFT {
  private bitrevtable: number[];
  private envelope: Float32Array;
  private equalize: Float32Array;
  private temp1: Float32Array;
  private temp2: Float32Array;
  private cossintable: Float32Array[];

  // Constants
  private static readonly TWO_PI = 6.2831853; // 2 * Math.PI
  private static readonly HALF_PI = 1.5707963268; // Math.PI / 2

  constructor() {
    // Assuming these are your hardcoded values:
    const samplesIn = 1024; // hardcoded value
    const samplesOut = 512; // hardcoded value
    const bEqualize = true; // hardcoded value
    const envelopePower = 1.0; // hardcoded value
    const mode = false; // hardcoded value

    const NFREQ = samplesOut * 2;

    // Initialize the tables and arrays with hardcoded values
    this.bitrevtable = this.initBitRevTable(NFREQ);
    this.cossintable = this.initCosSinTable(NFREQ);

    this.envelope = this.initEnvelopeTable(samplesIn, envelopePower);
    this.equalize = this.initEqualizeTable(NFREQ, mode);

    this.temp1 = new Float32Array(NFREQ);
    this.temp2 = new Float32Array(NFREQ);
  }

  private initEqualizeTable(NFREQ: number, mode: boolean): Float32Array {
    const equalize = new Float32Array(NFREQ / 2);
    let bias = 0.04; // FFT.INITIAL_BIAS

    for (let i = 0; i < NFREQ / 2; i++) {
      const invHalfNfreq = (9.0 - bias) / (NFREQ / 2);
      equalize[i] = Math.log10(1.0 + bias + (i + 1) * invHalfNfreq);
      bias /= 1.0025; // FFT.BIAS_DECAY_RATE
    }

    return equalize;
  }

  private initEnvelopeTable(samplesIn: number, power: number): Float32Array {
    const mult = (1.0 / samplesIn) * FFT.TWO_PI;
    const envelope = new Float32Array(samplesIn);

    for (let i = 0; i < samplesIn; i++) {
      envelope[i] = Math.pow(
        0.5 + 0.5 * Math.sin(i * mult - FFT.HALF_PI),
        power
      );
    }

    return envelope;
  }

  private initBitRevTable(NFREQ: number): number[] {
    const bitrevtable = new Array(NFREQ);

    for (let i = 0; i < NFREQ; i++) {
      bitrevtable[i] = i;
    }

    for (let i = 0, j = 0; i < NFREQ; i++) {
      if (j > i) {
        const temp = bitrevtable[i];
        bitrevtable[i] = bitrevtable[j];
        bitrevtable[j] = temp;
      }

      let m = NFREQ >> 1;
      while (m >= 1 && j >= m) {
        j -= m;
        m >>= 1;
      }

      j += m;
    }

    return bitrevtable;
  }

  private initCosSinTable(NFREQ: number): Float32Array[] {
    const cossintable: Float32Array[] = [];
    let dftsize = 2;

    while (dftsize <= NFREQ) {
      const theta = (-2.0 * Math.PI) / dftsize;
      cossintable.push(new Float32Array([Math.cos(theta), Math.sin(theta)]));
      dftsize <<= 1;
    }

    return cossintable;
  }

  public timeToFrequencyDomain(
    inWavedata: Float32Array,
    outSpectraldata: Float32Array
  ): void {
    if (!this.temp1 || !this.temp2 || !this.cossintable) return;
    // Converts time-domain samples from inWavedata[]
    //   into frequency-domain samples in outSpectraldata[].
    // The array lengths are the two parameters to Init().

    // The last sample of the output data will represent the frequency
    //   that is 1/4th of the input sampling rate.  For example,
    //   if the input wave data is sampled at 44,100 Hz, then the last
    //   sample of the spectral data output will represent the frequency
    //   11,025 Hz.  The first sample will be 0 Hz; the frequencies of
    //   the rest of the samples vary linearly in between.
    // Note that since human hearing is limited to the range 200 - 20,000
    //   Hz.  200 is a low bass hum; 20,000 is an ear-piercing high shriek.
    // Each time the frequency doubles, that sounds like going up an octave.
    //   That means that the difference between 200 and 300 Hz is FAR more
    //   than the difference between 5000 and 5100, for example!
    // So, when trying to analyze bass, you'll want to look at (probably)
    //   the 200-800 Hz range; whereas for treble, you'll want the 1,400 -
    //   11,025 Hz range.
    // If you want to get 3 bands, try it this way:
    //   a) 11,025 / 200 = 55.125
    //   b) to get the number of octaves between 200 and 11,025 Hz, solve for n:
    //          2^n = 55.125
    //          n = log 55.125 / log 2
    //          n = 5.785
    //   c) so each band should represent 5.785/3 = 1.928 octaves; the ranges are:
    //          1) 200 - 200*2^1.928                    or  200  - 761   Hz
    //          2) 200*2^1.928 - 200*2^(1.928*2)        or  761  - 2897  Hz
    //          3) 200*2^(1.928*2) - 200*2^(1.928*3)    or  2897 - 11025 Hz

    // A simple sine-wave-based envelope is convolved with the waveform
    //   data before doing the FFT, to emeliorate the bad frequency response
    //   of a square (i.e. nonexistent) filter.

    // You might want to slightly damp (blur) the input if your signal isn't
    //   of a very high quality, to reduce high-frequency noise that would
    //   otherwise show up in the output.

    // code should be smart enough to call Init before this function
    //if (!bitrevtable) return;
    //if (!temp1) return;
    //if (!temp2) return;
    //if (!cossintable) return;

    // 1. set up input to the fft
    for (let i = 0; i < this.temp1.length; i++) {
      const idx = this.bitrevtable[i];
      if (idx < inWavedata.length) {
        this.temp1[i] =
          inWavedata[idx] * (this.envelope ? this.envelope[idx] : 1);
      } else {
        this.temp1[i] = 0;
      }
    }
    this.temp2.fill(0);

    // 2. Perform FFT
    const real = this.temp1;
    const imag = this.temp2;
    let dftsize = 2;
    let t = 0;

    while (dftsize <= this.temp1.length) {
      const wpr = this.cossintable[t][0];
      const wpi = this.cossintable[t][1];
      let wr = 1.0;
      let wi = 0.0;
      const hdftsize = dftsize >> 1;

      for (let m = 0; m < hdftsize; m += 1) {
        for (let i = m; i < this.temp1.length; i += dftsize) {
          const j = i + hdftsize;
          const tempr = wr * real[j] - wi * imag[j];
          const tempi = wr * imag[j] + wi * real[j];
          real[j] = real[i] - tempr;
          imag[j] = imag[i] - tempi;
          real[i] += tempr;
          imag[i] += tempi;
        }

        const wtemp = wr;
        wr = wr * wpr - wi * wpi;
        wi = wi * wpr + wtemp * wpi;
      }

      dftsize <<= 1;
      ++t;
    }

    // 3. take the magnitude & equalize it (on a log10 scale) for output
    for (let i = 0; i < outSpectraldata.length; i++) {
      outSpectraldata[i] =
        Math.sqrt(real[i] * real[i] + imag[i] * imag[i]) *
        (this.equalize ? this.equalize[i] : 1);
    }
  }
}
