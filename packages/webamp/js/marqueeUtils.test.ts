import * as MarqueeUtils from "./marqueeUtils";

describe("getBalanceText", () => {
  it("treats negative numbers as left", () => {
    const actual = MarqueeUtils.getBalanceText(-25);
    const expected = "Balance: 25% Left";
    expect(actual).toEqual(expected);
  });
  it("treats positive numbers as right", () => {
    const actual = MarqueeUtils.getBalanceText(25);
    const expected = "Balance: 25% Right";
    expect(actual).toEqual(expected);
  });
  it("has a special case for center", () => {
    const actual = MarqueeUtils.getBalanceText(0);
    const expected = "Balance: Center";
    expect(actual).toEqual(expected);
  });
});

describe("getVolumeText", () => {
  it("expresses volume as percent", () => {
    const actual = MarqueeUtils.getVolumeText(50);
    const expected = "Volume: 50%";
    expect(actual).toEqual(expected);
  });
});

describe("getPositionText", () => {
  it("formats a position", () => {
    const duration = 86;
    const seekToPercent = 85;
    const actual = MarqueeUtils.getPositionText(duration, seekToPercent);
    const expected = "Seek to: 01:13/01:26 (85%)";
    expect(actual).toEqual(expected);
  });
});

describe("getDoubleSizeModeText", () => {
  it("prompts to enable when disabled", () => {
    const actual = MarqueeUtils.getDoubleSizeModeText(true);
    const expected = "Disable doublesize mode";
    expect(actual).toEqual(expected);
  });
  it("prompts to disable when enabled", () => {
    const actual = MarqueeUtils.getDoubleSizeModeText(false);
    const expected = "Enable doublesize mode";
    expect(actual).toEqual(expected);
  });
});
