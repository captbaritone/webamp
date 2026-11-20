/**
 * WCAG 2.3.1 Photosensitivity Governor for Milkdrop / Butterchurn.
 *
 * Implements real-time luminance tracking and flash mitigation according to
 * WCAG 2.3.1 (Three Flashes or Below Threshold).
 *
 * It samples the visualizer canvas via an offscreen 8x8 downsampled grid,
 * computes frame relative luminance, tracks transitions over a sliding 1-second
 * window, and calculates a proportional CSS brightness damping factor whenever
 * the flash frequency threatens the safety threshold.
 */

export interface GovernorDecision {
  /** The CSS brightness multiplier to apply [0.2 .. 1.0]. 1.0 means no damping. */
  scale: number;
  /** Whether the governor is actively damping an unsafe flash sequence. */
  isDamping: boolean;
  /** Estimated number of large luminance transitions in the past 1 second. */
  transitionCount: number;
}

export interface FlashGovernor {
  /** Inspect a rendered canvas frame and compute governor decision. */
  tick: (canvas: HTMLCanvasElement, nowMs: number) => GovernorDecision;
  /** Reset governor history (e.g. on preset switch). */
  reset: () => void;
  /** Current state. */
  getDecision: () => GovernorDecision;
}

/** Converts sRGB [0..255] component to linear light [0..1]. */
function srgbToLinear(val: number): number {
  const c = val / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Computes CIE 1931 relative luminance for RGB components. */
export function relativeLuminance(r: number, g: number, b: number): number {
  return (
    0.2126 * srgbToLinear(r) +
    0.7152 * srgbToLinear(g) +
    0.0722 * srgbToLinear(b)
  );
}

interface FrameSample {
  time: number;
  lum: number;
}

export function createFlashGovernor(): FlashGovernor {
  let sampleCanvas: HTMLCanvasElement | null = null;
  let sampleCtx: CanvasRenderingContext2D | null = null;

  const samples: FrameSample[] = [];
  let currentScale = 1.0;
  let lastSampleTime = 0;
  const SAMPLE_INTERVAL_MS = 16; // ~60fps cadence

  let lastDecision: GovernorDecision = {
    scale: 1.0,
    isDamping: false,
    transitionCount: 0,
  };

  function initContext() {
    if (!sampleCanvas && typeof document !== "undefined") {
      sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = 8;
      sampleCanvas.height = 8;
      sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
    }
  }

  function reset() {
    samples.length = 0;
    currentScale = 1.0;
    lastSampleTime = 0;
    lastDecision = {
      scale: 1.0,
      isDamping: false,
      transitionCount: 0,
    };
  }

  function tick(canvas: HTMLCanvasElement, nowMs: number): GovernorDecision {
    if (nowMs - lastSampleTime < SAMPLE_INTERVAL_MS) {
      return lastDecision;
    }
    lastSampleTime = nowMs;

    initContext();
    if (!sampleCtx || !sampleCanvas) {
      return lastDecision;
    }

    // Downsample the source canvas to 8x8 (64 pixels)
    sampleCtx.drawImage(canvas, 0, 0, 8, 8);
    let imgData: ImageData;
    try {
      imgData = sampleCtx.getImageData(0, 0, 8, 8);
    } catch {
      // Cross-origin or tainted canvas fallback
      return lastDecision;
    }

    const data = imgData.data;
    let totalLum = 0;
    for (let i = 0; i < data.length; i += 4) {
      totalLum += relativeLuminance(data[i], data[i + 1], data[i + 2]);
    }
    const frameLum = totalLum / 64;

    // Record sample
    samples.push({ time: nowMs, lum: frameLum });

    // Prune samples older than 1000ms
    const cutoff = nowMs - 1000;
    while (samples.length > 0 && samples[0].time < cutoff) {
      samples.shift();
    }

    // Count WCAG 2.3.1 luminance transitions in the rolling 1-second window.
    // A transition is a delta in relative luminance >= 0.10 where the darker state < 0.80.
    let transitions = 0;
    let maxDelta = 0;
    for (let i = 1; i < samples.length; i++) {
      const prev = samples[i - 1].lum;
      const curr = samples[i].lum;
      const delta = Math.abs(curr - prev);
      const darker = Math.min(prev, curr);
      if (delta >= 0.1 && darker < 0.8) {
        transitions++;
        if (delta > maxDelta) {
          maxDelta = delta;
        }
      }
    }

    // WCAG threshold: > 3 transitions/sec
    const isUnsafe = transitions >= 3;
    let targetScale = 1.0;

    if (isUnsafe) {
      // Damp proportionally to excessive transitions and delta magnitude
      const excess = Math.min(10, transitions - 2);
      const intensity = Math.min(1.0, maxDelta * 1.5);
      // Scale between 0.35 and 0.65 depending on severity
      targetScale = Math.max(0.35, 1.0 - excess * 0.08 * intensity);
    }

    // Smooth transition: attack quickly (~100ms) to protect eyes, release gently (~1.5s)
    const smoothing = targetScale < currentScale ? 0.35 : 0.05;
    currentScale += (targetScale - currentScale) * smoothing;

    const isDamping = currentScale < 0.92;

    lastDecision = {
      scale: currentScale,
      isDamping,
      transitionCount: transitions,
    };

    return lastDecision;
  }

  return {
    tick,
    reset,
    getDecision: () => lastDecision,
  };
}
