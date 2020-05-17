import { Slider } from "./types";

import * as Utils from "./utils";

export const getBalanceText = (balance: number): string => {
  if (balance === 0) {
    return "Balance: Center";
  }
  const direction = balance > 0 ? "Right" : "Left";
  return `Balance: ${Math.abs(balance)}% ${direction}`;
};

export const getVolumeText = (volume: number): string => `Volume: ${volume}%`;

export const getPositionText = (
  duration: number,
  seekToPercent: number
): string => {
  const newElapsedStr = Utils.getTimeStr(
    (duration * seekToPercent) / 100,
    false
  );
  const durationStr = Utils.getTimeStr(duration, false);
  return `Seek to: ${newElapsedStr}/${durationStr} (${seekToPercent}%)`;
};

export const getDoubleSizeModeText = (enabled: boolean): string =>
  `${enabled ? "Disable" : "Enable"} doublesize mode`;

const formatHz = (hz: number): string =>
  hz < 1000 ? `${hz}HZ` : `${hz / 1000}KHZ`;

// Format a number as a string, ensuring it has a + or - sign
const ensureSign = (num: number | string): string =>
  num > 0 ? `+${num}` : num.toString();

// Round to 1 and exactly 1 decimal point
const roundToTenths = (num: number): string =>
  (Math.round(num * 10) / 10).toFixed(1);

export const getEqText = (band: Slider, level: number): string => {
  const db = roundToTenths(((level - 50) / 50) * 12);
  const label = band === "preamp" ? "Preamp" : formatHz(band);
  return `EQ: ${label} ${ensureSign(db)} DB`;
};
