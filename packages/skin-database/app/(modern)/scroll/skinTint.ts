"use client";

import { useEffect, useState } from "react";

// The hue and saturation of a skin's average color, used to tint the feed's
// backdrop (see .feed-backdrop in scroll.css, which sets the lightness).
export type SkinTint = { hue: number; saturation: number };

// Averaging a downscaled copy is plenty for a background tint.
const SAMPLE_SIZE = 24;

/**
 * The screenshot URL to display in the new UI, loaded with
 * crossOrigin="anonymous" so its colors can be read.
 *
 * It needs its own URL: the screenshot CDN only sends CORS headers (and
 * `Vary: Origin`) when a request has an Origin, so a copy the browser cached
 * from a plain <img> elsewhere would be reused for our CORS request and fail
 * it. Every screenshot in the new UI uses this URL, so each is still only
 * downloaded once.
 */
export function corsScreenshotUrl(screenshotUrl: string): string {
  return `${screenshotUrl}?cors`;
}

const cache = new Map<string, Promise<SkinTint | null>>();

function loadTint(url: string): Promise<SkinTint | null> {
  let tint = cache.get(url);
  if (tint == null) {
    tint = new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(averageTint(img));
      img.onerror = () => resolve(null);
      img.src = url;
    });
    cache.set(url, tint);
  }
  return tint;
}

/**
 * The tint for the screenshot at `url` (from corsScreenshotUrl), or null
 * until it's known or if it can't be read. Results are cached, and the image
 * is usually already in the browser's cache from being displayed.
 */
export function useSkinTint(url: string): SkinTint | null {
  const [tint, setTint] = useState<SkinTint | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadTint(url).then((result) => {
      if (!cancelled && result != null) setTint(result);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);
  return tint;
}

function averageTint(img: HTMLImageElement): SkinTint | null {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = SAMPLE_SIZE;
    canvas.height = SAMPLE_SIZE;
    const context = canvas.getContext("2d");
    if (context == null) return null;
    context.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    const pixels = context.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data;
    let r = 0;
    let g = 0;
    let b = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      r += pixels[i];
      g += pixels[i + 1];
      b += pixels[i + 2];
    }
    const count = pixels.length / 4;
    const { hue, saturation } = toHueSaturation(
      r / count / 255,
      g / count / 255,
      b / count / 255
    );
    // Averaging washes colors out, so boost the saturation (with a floor, so
    // grey skins still get a hint of their hue rather than flat grey).
    return { hue, saturation: Math.min(100, saturation * 1.4 + 8) };
  } catch {
    // e.g. a tainted canvas if the image came without CORS headers.
    return null;
  }
}

// Hue (degrees) and HSL saturation (percent) of an RGB color in [0, 1].
function toHueSaturation(
  r: number,
  g: number,
  b: number
): { hue: number; saturation: number } {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return { hue: 0, saturation: 0 };
  const lightness = (max + min) / 2;
  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue: number;
  if (max === r) {
    hue = ((g - b) / delta) % 6;
  } else if (max === g) {
    hue = (b - r) / delta + 2;
  } else {
    hue = (r - g) / delta + 4;
  }
  return { hue: (hue * 60 + 360) % 360, saturation: saturation * 100 };
}

// How strongly the backdrop takes on the skin's color: 0 is the neutral
// spotlight, 1 the full tint.
const TINT_INTENSITY = 0.15;

// The neutral spotlight's colors (its center, and halfway to the edge).
// Keep in sync with the initial values of --feed-glow/--feed-glow-mid.
const NEUTRAL_GLOW: Rgb = [56, 56, 56];
const NEUTRAL_GLOW_MID: Rgb = [28, 28, 28];

type Rgb = [number, number, number];

/**
 * The backdrop's two colors for a skin's tint, blended with the neutral
 * spotlight by TINT_INTENSITY. They're plain colors rather than hue and
 * saturation so the backdrop's transition goes straight from one skin's color
 * to the next, rather than sweeping through every hue in between (vivid reds
 * and greens neither skin has) on the way.
 */
export function backdropColors(tint: SkinTint): {
  glow: string;
  glowMid: string;
} {
  return {
    glow: blend(
      NEUTRAL_GLOW,
      hslToRgb(tint.hue, tint.saturation, 22),
      TINT_INTENSITY
    ),
    glowMid: blend(
      NEUTRAL_GLOW_MID,
      hslToRgb(tint.hue, tint.saturation * 0.8, 11),
      TINT_INTENSITY
    ),
  };
}

function blend(from: Rgb, to: Rgb, amount: number): string {
  const [r, g, b] = from.map((channel, i) =>
    Math.round(channel + (to[i] - channel) * amount)
  );
  return `rgb(${r} ${g} ${b})`;
}

// An HSL color (degrees, percent, percent) as RGB channels (0-255).
function hslToRgb(hue: number, saturation: number, lightness: number): Rgb {
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const h = (((hue % 360) + 360) % 360) / 60;
  const x = chroma * (1 - Math.abs((h % 2) - 1));
  // Which of chroma, x and 0 each channel gets, for each sixth of the wheel.
  const [r, g, b] = [
    [chroma, x, 0],
    [x, chroma, 0],
    [0, chroma, x],
    [0, x, chroma],
    [x, 0, chroma],
    [chroma, 0, x],
  ][Math.min(5, Math.floor(h))];
  const m = l - chroma / 2;
  return [r, g, b].map((v) => Math.round((v + m) * 255)) as Rgb;
}
