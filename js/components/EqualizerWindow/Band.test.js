import { spriteNumber, spriteOffsets } from "./Band";

describe("spriteNumber", () => {
  it("gives the first sprite", () => {
    const actual = spriteNumber(0);
    const expected = 0;
    expect(actual).toEqual(expected);
  });
  it("gives the middle sprite", () => {
    const actual = spriteNumber(50);
    const expected = 14;
    expect(actual).toEqual(expected);
  });
  it("gives the last sprite", () => {
    const actual = spriteNumber(100);
    const expected = 27;
    expect(actual).toEqual(expected);
  });
});

describe("spriteOffsets", () => {
  it("gives the first sprite", () => {
    const actual = spriteOffsets(0);
    const expected = { x: 0, y: 0 };
    expect(actual).toEqual(expected);
  });
  it("gives the middle sprite", () => {
    const actual = spriteOffsets(14);
    const expected = { x: 0, y: 1 };
    expect(actual).toEqual(expected);
  });
  it("gives the last sprite", () => {
    const actual = spriteOffsets(27);
    const expected = { x: 13, y: 1 };
    expect(actual).toEqual(expected);
  });
});
