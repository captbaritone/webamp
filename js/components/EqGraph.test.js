import { roundToEven } from "./EqGraph";

describe("roundToEven", () => {
  it("leaves even numbers as is", () => {
    const actual = roundToEven(4);
    const expected = 4;
    expect(actual).toEqual(expected);
  });
  it("handles zero", () => {
    const actual = roundToEven(0);
    const expected = 0;
    expect(actual).toEqual(expected);
  });
  it("handles odd numbers", () => {
    const actual = roundToEven(3);
    const expected = 4;
    expect(actual).toEqual(expected);
  });
});

describe("getY", () => {
  it("gives the first sprite", () => {});
});
