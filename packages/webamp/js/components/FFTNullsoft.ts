// The Web Audio API's FFT is bad, so this exists now!
// Taken from https://github.com/WACUP/vis_classic/tree/master/FFTNullsoft

export class FFT {
  private mSamplesIn: number;
  private NFREQ: number;
  private bitrevtable: number[] | null = null;
  private envelope: Float32Array | null = null;
  private equalize: Float32Array | null = null;
  private temp1: Float32Array | null = null;
  private temp2: Float32Array | null = null;
  private cossintable: Float32Array[] | null = null;

  constructor() {
    this.mSamplesIn = 0;
    this.NFREQ = 0;
  }

  public init(
    samples_in: number,
    samples_out: number,
    bEqualize = 1,
    envelopePower = 1.0,
    mode = false
  ): void {
    this.mSamplesIn = samples_in;
    this.NFREQ = samples_out * 2;

    this.initBitRevTable();
    this.initCosSinTable();

    if (envelopePower > 0) {
      this.initEnvelopeTable(envelopePower);
    }

    if (bEqualize) {
      this.initEqualizeTable(mode);
    }

    this.temp1 = new Float32Array(this.NFREQ);
    this.temp2 = new Float32Array(this.NFREQ);
  }

  private initEqualizeTable(mode: boolean): void {
    this.equalize = new Float32Array(this.NFREQ / 2);
    let bias = 0.04;

    for (let i = 0; i < this.NFREQ / 2; i++) {
      const inv_half_nfreq = (9.0 - bias) / (this.NFREQ / 2);
      this.equalize[i] = Math.log10(1.0 + bias + (i + 1) * inv_half_nfreq);

      bias /= 1.0025;
    }
  }

  private initEnvelopeTable(power: number): void {
    const mult = (1.0 / this.mSamplesIn) * 6.2831853;

    this.envelope = new Float32Array(this.mSamplesIn);

    if (power == 1.0) {
      for (let i = 0; i < this.mSamplesIn; i++) {
        this.envelope[i] = 0.5 + 0.5 * Math.sin(i * mult - 1.5707963268);
      }
    } else {
      for (let i = 0; i < this.mSamplesIn; i++) {
        this.envelope[i] = Math.pow(
          0.5 + 0.5 * Math.sin(i * mult - 1.5707963268),
          power
        );
      }
    }
  }

  private initBitRevTable(): void {
    this.bitrevtable = new Array(this.NFREQ);

    for (let i = 0; i < this.NFREQ; i++) {
      this.bitrevtable[i] = i;
    }

    for (let i = 0, j = 0; i < this.NFREQ; i++) {
      if (j > i) {
        const temp = this.bitrevtable[i];
        this.bitrevtable[i] = this.bitrevtable[j];
        this.bitrevtable[j] = temp;
      }

      let m = this.NFREQ >> 1;
      while (m >= 1 && j >= m) {
        j -= m;
        m >>= 1;
      }

      j += m;
    }
  }

  private initCosSinTable(): void {
    let dftsize = 2;
    let tabsize = 0;
    while (dftsize <= this.NFREQ) {
      ++tabsize;
      dftsize <<= 1;
    }

    this.cossintable = new Array(tabsize);
    dftsize = 2;
    let i = 0;

    while (dftsize <= this.NFREQ) {
      const theta = (-2.0 * Math.PI) / dftsize;
      this.cossintable[i] = new Float32Array(2);
      this.cossintable[i][0] = Math.cos(theta);
      this.cossintable[i][1] = Math.sin(theta);
      ++i;
      dftsize <<= 1;
    }
  }

  public timeToFrequencyDomain(
    in_wavedata: Float32Array,
    out_spectraldata: Float32Array
  ): void {
    if (!this.bitrevtable || !this.temp1 || !this.temp2 || !this.cossintable)
      return;
    // Converts time-domain samples from in_wavedata[]
    //   into frequency-domain samples in out_spectraldata[].
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
    if (this.envelope) {
      for (let i = 0; i < this.NFREQ; i++) {
        const idx = this.bitrevtable[i];
        if (idx < this.mSamplesIn) {
          this.temp1[i] = in_wavedata[idx] * this.envelope[idx];
        } else {
          this.temp1[i] = 0;
        }
      }
    } else {
      for (let i = 0; i < this.NFREQ; i++) {
        const idx = this.bitrevtable[i];
        if (idx < this.mSamplesIn) {
          this.temp1[i] = in_wavedata[idx];
        } else {
          this.temp1[i] = 0;
        }
      }
    }
    this.temp2.fill(0);

    // 2. perform FFT
    let real = this.temp1;
    let imag = this.temp2;
    let dftsize = 2;
    let t = 0;

    while (dftsize <= this.NFREQ) {
      const wpr = this.cossintable[t][0];
      const wpi = this.cossintable[t][1];
      let wr = 1.0;
      let wi = 0.0;
      const hdftsize = dftsize >> 1;

      for (let m = 0; m < hdftsize; m += 1) {
        for (let i = m; i < this.NFREQ; i += dftsize) {
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
    if (this.equalize) {
      for (let i = 0; i < this.NFREQ / 2; i++) {
        out_spectraldata[i] =
          this.equalize[i] * Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
      }
    } else {
      for (let i = 0; i < this.NFREQ / 2; i++) {
        out_spectraldata[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
      }
    }
  }

  public getNumFreq(): number {
    return this.NFREQ;
  }
}
