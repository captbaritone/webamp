import { HEADER, PRESET_VALUES } from "./constants.js";
import { CreateEqfData } from "./types.js";

const PRESET_LENGTH = 257;

export function creator(data: CreateEqfData): ArrayBuffer {
  const buffer: number[] = [];

  // Add header
  for (let i = 0; i < HEADER.length; i++) {
    buffer.push(HEADER.charCodeAt(i));
  }

  // Add control character and ending
  buffer.push(26); // <ctrl-z>
  const ending = "!--";
  for (let i = 0; i < ending.length; i++) {
    buffer.push(ending.charCodeAt(i));
  }

  if (!data.presets) {
    throw new Error("Eqf data is missing presets");
  }

  data.presets.forEach((preset) => {
    // Add preset name
    let k = 0;
    for (; k < preset.name.length; k++) {
      buffer.push(preset.name.charCodeAt(k));
    }
    // Pad name to fixed length
    for (; k < PRESET_LENGTH; k++) {
      buffer.push(0);
    }

    // Add preset values
    PRESET_VALUES.forEach((valueName) => {
      buffer.push(64 - preset[valueName]); // Adjust for inverse values
    });
  });

  return new Uint8Array(buffer).buffer;
}
