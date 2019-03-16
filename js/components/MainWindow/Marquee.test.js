import { mod, stepOffset, pixelUnits, loopText } from "./Marquee";

describe("mod", () => {
  it("behaves differently than % for negative numbers", () => {
    expect(mod(-17, 5)).not.toBe(-17 % 5);
  });
  it("always returns positive", () => {
    expect(mod(-17, 5)).toBe(3);
  });
});

describe("stepOffset", () => {
  const long = "This is a long string. Longer than 30 characters!";
  it("starts at 0", () => {
    const actual = stepOffset(long, 0, 0);
    const expected = 0;
    expect(actual).toEqual(expected);
  });
  it("first step offsets by one character", () => {
    const actual = stepOffset(long, 1, 0);
    const expected = 5;
    expect(actual).toEqual(expected);
  });
  it("resets to 0 when step === string.length + the separator length", () => {
    const actual = stepOffset(long, long.length + 7, 0);
    const expected = 0;
    expect(actual).toEqual(expected);
  });
  it("offsets by one char when step = string.length the separator length + 1", () => {
    const actual = stepOffset(long, long.length + 7 + 1, 0);
    const expected = 5;
    expect(actual).toEqual(expected);
  });
  it("does not try to offset strings shorter than 30 characters", () => {
    const actual = stepOffset("hello", 15, 0);
    const expected = 0;
    expect(actual).toEqual(expected);
  });
  it("applies an additional pixel offset", () => {
    const actual = stepOffset("hello", 1, 51); // WAT?
    const expected = 0;
    expect(actual).toEqual(expected);
  });
});

describe("pixelUnits", () => {
  it("converts an integer into a CSS offset", () => {
    const actual = pixelUnits(1);
    const expected = "1px";
    expect(actual).toEqual(expected);
  });
  it("handles 0", () => {
    const actual = pixelUnits(0);
    const expected = "0px";
    expect(actual).toEqual(expected);
  });
  it("handles negative values", () => {
    const actual = pixelUnits(-10);
    const expected = "-10px";
    expect(actual).toEqual(expected);
  });
});

describe("loopText", () => {
  const long = "This is a long string. Longer than 30 characters!";
  const short = "This is a short string.";
  it("loops long string", () => {
    const actual = loopText(long);
    const expected = `${long}  ***  ${long}`;
    expect(actual).toEqual(expected);
  });
  it("does not loop sort strings", () => {
    const actual = loopText(short);
    const expected = short;
    expect(actual.trim()).toEqual(expected);
  });
  it("pads a sort strings", () => {
    const actual = loopText(short);
    expect(actual.length).toBe(31);
  });
});
