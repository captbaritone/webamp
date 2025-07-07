import { join } from "path";
import { readFileSync } from "fs";
import { parser, creator } from "./index.js";
import bufferToArrayBuffer from "buffer-to-arraybuffer";

// TODO: Abstract this into its own library.
declare global {
  namespace jest {
    interface Matchers<R> {
      arrayBufferToEqual(expected: ArrayBuffer): R;
    }
  }
}

expect.extend({
  arrayBufferToEqual(received: ArrayBuffer, argument: ArrayBuffer) {
    if (received.byteLength !== argument.byteLength) {
      return {
        message: () =>
          `ArrayBuffers do not match. Expected length ${received.byteLength} but got ${argument.byteLength}`,
        pass: false,
      };
    }
    const a = new Uint8Array(received);
    const b = new Uint8Array(argument);
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return {
          message: () =>
            `ArrayBuffers do not match. Expected ${a[i]} to equal ${b[i]} at index ${i}`,
          pass: false,
        };
      }
    }
    return {
      message: () => `ArrayBuffers are equal.`,
      pass: true,
    };
  },
});

const fixtures = [
  // All bands max, preamp mid
  "max.EQF",
  // All bands min, preamp mid
  "min.EQF",
  // All bands mid, preamp mid
  "midline.EQF",
  // All bands mid, preamp max
  "preampMax.EQF",
  // All bands mid, preamp min
  "preampMin.EQF",
  "random.EQF",
  "winamp_sample.q1",
  "winamp.q1",
];

describe("parser", () => {
  fixtures.forEach((fileName) => {
    const buffer = readFileSync(join(__dirname, "../sample_data", fileName));
    const arrayBuffer = bufferToArrayBuffer(buffer);
    test(`${fileName}`, () => {
      expect(() => parser(arrayBuffer)).not.toThrow();
    });
  });

  test("parsed file snapshot", () => {
    const buffer = readFileSync(join(__dirname, "../sample_data/random.EQF"));
    const arrayBuffer = bufferToArrayBuffer(buffer);
    expect(parser(arrayBuffer)).toMatchSnapshot();
  });
});

describe("creator", () => {
  fixtures.forEach((fileName) => {
    const buffer = readFileSync(join(__dirname, "../sample_data", fileName));
    const arrayBuffer = bufferToArrayBuffer(buffer);
    const data = parser(arrayBuffer);
    test(`functional round trip: ${fileName}`, () => {
      // Test that parsing the created data returns the same logical data
      expect(parser(creator(data))).toEqual(data);
    });
  });
});

// Only test byte-for-byte equality on .EQF files, not .q1 files
const eqfFixtures = [
  "max.EQF",
  "min.EQF",
  "midline.EQF",
  "preampMax.EQF",
  "preampMin.EQF",
  "random.EQF",
];

describe("creator byte-for-byte", () => {
  eqfFixtures.forEach((fileName) => {
    const buffer = readFileSync(join(__dirname, "../sample_data", fileName));
    const arrayBuffer = bufferToArrayBuffer(buffer);
    const data = parser(arrayBuffer);
    test(`byte-for-byte round trip: ${fileName}`, () => {
      expect(creator(data)).arrayBufferToEqual(arrayBuffer);
    });
  });
});

describe("integration", () => {
  test("can parse and recreate Winamp's sample file", () => {
    const buffer = readFileSync(
      join(__dirname, "../sample_data/winamp_sample.q1")
    );
    const arrayBuffer = bufferToArrayBuffer(buffer);
    const data = parser(arrayBuffer);
    expect(data.presets).toHaveLength(4);
    expect(data.presets[0].name).toEqual("Normal");
    expect(data.presets[1].name).toEqual("Clear");
    expect(data.presets[2].name).toEqual("Alex");
    expect(data.presets[3].name).toEqual("Tare");

    // Functional round-trip test for .q1 files (not byte-for-byte)
    const recreated = creator(data);
    expect(parser(recreated)).toEqual(data);
  });
});
