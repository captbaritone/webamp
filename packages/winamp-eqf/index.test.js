const { join } = require("path");
const { readFileSync } = require("fs");
const { parser, creator } = require("./");
var bufferToArrayBuffer = require("buffer-to-arraybuffer");

// TODO: Abstract this into its own library.
expect.extend({
  arrayBufferToEqual(received, argument) {
    if (received.byteLength !== argument.byteLength) {
      return {
        message: `ArrayBuffers do not match. Expected length ${received.byteLength} but got ${argument.byteLenth}`,
        pass: false
      };
    }
    const a = new Uint8Array(received);
    const b = new Uint8Array(argument);
    for (var i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return {
          message: `ArrayBuffers do not match. Expected ${a[i]} to equal ${b[
            i
          ]} at index ${i}`,
          pass: false
        };
      }
    }
    return {
      message: `ArrayBuffers are equal.`,
      pass: true
    };
  }
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
  "winamp.q1"
];

describe("parser", () => {
  fixtures.forEach(fileName => {
    const buffer = readFileSync(join("sample_data", fileName));
    const arrayBuffer = bufferToArrayBuffer(buffer);
    it(`can parse ${fileName}`, () => {
      const data = parser(arrayBuffer);
      expect(data).toMatchSnapshot();
    });
  });
});

describe("creator", () => {
  fixtures.forEach(fileName => {
    const buffer = readFileSync(join("sample_data", fileName));
    const arrayBuffer = bufferToArrayBuffer(buffer);
    const data = parser(arrayBuffer);
    it(`can create and parse ${fileName}`, () => {
      expect(parser(creator(data))).toEqual(data);
    });
  });
});

const eqfFixtures = [
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
  "random.EQF"
];

describe("creator", () => {
  eqfFixtures.forEach(fileName => {
    const buffer = readFileSync(join("sample_data", fileName));
    const arrayBuffer = bufferToArrayBuffer(buffer);
    const data = parser(arrayBuffer);
    it(`can create ${fileName}`, () => {
      data.type = "foo";
      expect(creator(data)).arrayBufferToEqual(arrayBuffer);
    });
  });
});
