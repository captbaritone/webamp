import {
  getBalanceText,
  getVolumeText,
  getPositionText,
  getMediaText,
  getDoubleSizeModeText,
  stepOffset,
  negativePixels,
  loopText
} from "./Marquee";

describe("getBalanceText", () => {
  it("treats negative numbers as left", () => {
    const actual = getBalanceText(-25);
    const expected = "Balance: 25% Left";
    expect(actual).toEqual(expected);
  });
  it("treats positive numbers as right", () => {
    const actual = getBalanceText(25);
    const expected = "Balance: 25% Right";
    expect(actual).toEqual(expected);
  });
  it("has a special case for center", () => {
    const actual = getBalanceText(0);
    const expected = "Balance: Center";
    expect(actual).toEqual(expected);
  });
});

describe("getVolumeText", () => {
  it("expresses volume as percent", () => {
    const actual = getVolumeText(50);
    const expected = "Volume: 50%";
    expect(actual).toEqual(expected);
  });
});

describe("getPositionText", () => {
  it("formats a position", () => {
    const duration = 86;
    const seekToPercent = 85;
    const actual = getPositionText(duration, seekToPercent);
    const expected = "Seek to: 01:13/01:26 (85%)";
    expect(actual).toEqual(expected);
  });
});

describe("getMediaText", () => {
  it("formats a name and duration", () => {
    const name = "My Great Song";
    const duration = 86;
    const actual = getMediaText(name, duration);
    const expected = "My Great Song (01:26)  ***  ";
    expect(actual).toEqual(expected);
  });
});

describe("stepOffset", () => {
  const long = "This is a long string. Longer than 30 characters!";
  it("starts at 0", () => {
    const actual = stepOffset(long, 0);
    const expected = 0;
    expect(actual).toEqual(expected);
  });
  it("first step offsets by one character", () => {
    const actual = stepOffset(long, 1);
    const expected = 5;
    expect(actual).toEqual(expected);
  });
  it("resets to 0 when step === string.length", () => {
    const actual = stepOffset(long, long.length);
    const expected = 0;
    expect(actual).toEqual(expected);
  });
  it("offsets by one char when step = string.length + 1", () => {
    const actual = stepOffset(long, long.length + 1);
    const expected = 5;
    expect(actual).toEqual(expected);
  });
  it("does not try to offset strings shorter than 30 characters", () => {
    const actual = stepOffset("hello", 15);
    const expected = 0;
    expect(actual).toEqual(expected);
  });
});

describe("negativePixels", () => {
  it("converts an integer into a CSS offset", () => {
    const actual = negativePixels(1);
    const expected = "-1px";
    expect(actual).toEqual(expected);
  });
  it("handles 0", () => {
    const actual = negativePixels(0);
    const expected = "-0px";
    expect(actual).toEqual(expected);
  });
});

describe("loopText", () => {
  const long = "This is a long string. Longer than 30 characters!";
  const short = "This is a short string.";
  it("loops long string", () => {
    const actual = loopText(long);
    const expected = long + long;
    expect(actual).toEqual(expected);
  });
  it("does not loop sort strings", () => {
    const actual = loopText(short);
    const expected = short;
    expect(actual).toEqual(expected);
  });
});
describe("getDoubleSizeModeText", () => {
  it("prompts to enable when disabled", () => {
    const actual = getDoubleSizeModeText(true);
    const expected = "Disable doublesize mode";
    expect(actual).toEqual(expected);
  });
  it("prompts to disable when enabled", () => {
    const actual = getDoubleSizeModeText(false);
    const expected = "Enable doublesize mode";
    expect(actual).toEqual(expected);
  });
});
