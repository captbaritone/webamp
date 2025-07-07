import { HEADER, PRESET_VALUES } from "./constants.js";
import { EqfData, EqfPreset } from "./types.js";

export function parser(arrayBuffer: ArrayBuffer): EqfData {
  const data: EqfData = {
    type: "",
    presets: [],
  };
  let i = 0;
  const arr = new Int8Array(arrayBuffer);

  // Parse header
  data.type = String.fromCharCode.apply(
    null,
    Array.from(arr.slice(i, HEADER.length))
  );
  if (data.type !== HEADER) {
    throw new Error("Invalid .eqf file.");
  }
  i += HEADER.length;

  // Skip "<ctrl-z>!--"
  i += 4;

  // Get the presets
  while (i < arr.length) {
    const preset: Partial<EqfPreset> = {};

    // Get the name
    const nameStart = i;
    const nameEnd = nameStart + 257; // Str is fixed length
    // Str is null terminated
    while (arr[i] !== 0 && i <= nameEnd) {
      i++;
    }
    preset.name = String.fromCharCode.apply(
      null,
      Array.from(arr.slice(nameStart, i))
    );
    i = nameEnd; // Skip over any unused bytes

    // Get the levels
    PRESET_VALUES.forEach((valueName) => {
      (preset as any)[valueName] = 64 - arr[i++]; // Adjust for inverse values
    });

    data.presets.push(preset as EqfPreset);
  }

  return data;
}
