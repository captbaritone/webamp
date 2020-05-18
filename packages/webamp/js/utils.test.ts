import fs from "fs";

import {
  getTimeObj,
  getTimeStr,
  clamp,
  parseViscolors,
  parseIni,
  normalizeEqBand,
  denormalizeEqBand,
  segment,
  moveSelected,
  spliceIn,
  replaceAtIndex,
} from "./utils";

const fixture = (filename: string) =>
  fs.readFileSync(`./js/__tests__/fixtures/${filename}`, "utf8");

describe("getTimeObj", () => {
  it("expresses seconds as an object", () => {
    const actual = getTimeObj(1234);
    const expected = {
      minutesFirstDigit: "2",
      minutesSecondDigit: "0",
      secondsFirstDigit: "3",
      secondsSecondDigit: "4",
    };
    expect(actual).toEqual(expected);
  });
});

describe("getTimeStr", () => {
  it("expresses seconds as string", () => {
    const actual = getTimeStr(1234);
    const expected = "20:34";
    expect(actual).toEqual(expected);
  });
  it("pads with only one zero", () => {
    const actual = getTimeStr(5);
    const expected = "0:05";
    expect(actual).toEqual(expected);
  });
  it("truncates extra minutes", () => {
    const actual = getTimeStr(540000);
    const expected = "9000:00";
    expect(actual).toEqual(expected);
  });
});

describe("clamp", () => {
  it("respects the max value", () => {
    const actual = clamp(101, 0, 100);
    const expected = 100;
    expect(actual).toEqual(expected);
  });
  it("respects the min value", () => {
    const actual = clamp(0, 1, 100);
    const expected = 1;
    expect(actual).toEqual(expected);
  });
  it("respects the given value if in range", () => {
    const actual = clamp(50, 0, 100);
    const expected = 50;
    expect(actual).toEqual(expected);
  });
});

describe("parseViscolors", () => {
  it("can parse the default viscolors file", () => {
    const viscolors = fixture("VISCOLOR.TXT");
    const actual = parseViscolors(viscolors);
    expect(actual).toMatchInlineSnapshot(`
Array [
  "rgb(0,0,0)",
  "rgb(24,33,41)",
  "rgb(239,49,16)",
  "rgb(206,41,16)",
  "rgb(214,90,0)",
  "rgb(214,102,0)",
  "rgb(214,115,0)",
  "rgb(198,123,8)",
  "rgb(222,165,24)",
  "rgb(214,181,33)",
  "rgb(189,222,41)",
  "rgb(148,222,33)",
  "rgb(41,206,16)",
  "rgb(50,190,16)",
  "rgb(57,181,16)",
  "rgb(49,156,8)",
  "rgb(41,148,0)",
  "rgb(24,132,8)",
  "rgb(255,255,255)",
  "rgb(214,214,222)",
  "rgb(181,189,189)",
  "rgb(160,170,175)",
  "rgb(148,156,165)",
  "rgb(150,150,150)",
]
`);
  });

  it("can parse a malformed viscolors file", () => {
    // From https://skins.webamp.org/skin/018ddb394f2bfe49efa70bce27b71cb2/Centra_CSS-102_104-3.wsz/
    const viscolors = fixture("CENTRA_VISCOLOR.TXT");
    const actual = parseViscolors(viscolors);
    expect(actual).toMatchInlineSnapshot(`
Array [
  "rgb(110,150,176)",
  "rgb(165,165,165)",
  "rgb(55,55,67)",
  "rgb(55,55,67)",
  "rgb(55,55,67)",
  "rgb(55,55,67)",
  "rgb(55,55,67)",
  "rgb(55,55,67)",
  "rgb(55,55,67)",
  "rgb(55,55,67)",
  "rgb(55,55,67)",
  "rgb(55,55,67)",
  "rgb(55,55,67)",
  "rgb(55,55,67)",
  "rgb(55,55,67)",
  "rgb(55,55,67)",
  "rgb(55,55,67)",
  "rgb(55,55,67)",
  "rgb(55,55,67)",
  "rgb(55,55,67)",
  "rgb(55,55,67)",
  "rgb(55,55,67)",
  "rgb(55,55,67)",
  "rgb(181,189,189)",
  "rgb(148,156,165)",
  "rgb(148,156,165)",
]
`);
  });

  it("does not require commas to separate values", () => {
    // From https://skins.webamp.org/skin/99c6227d8880e00813a9aa6c4e808c37/valgaav_by_dreamcass-d85bqwp.wsz/
    const viscolors = fixture("viscolor_valgaav.txt");
    const actual = parseViscolors(viscolors);
    expect(actual).toMatchInlineSnapshot(`
Array [
  "rgb(98,111,123)",
  "rgb(98,111,123)",
  "rgb(21,21,21)",
  "rgb(223,176,176)",
  "rgb(218,168,168)",
  "rgb(211,158,158)",
  "rgb(204,147,147)",
  "rgb(198,137,137)",
  "rgb(191,127,127)",
  "rgb(185,117,117)",
  "rgb(178,107,107)",
  "rgb(172,97,97)",
  "rgb(165,86,86)",
  "rgb(158,76,76)",
  "rgb(152,66,66)",
  "rgb(145,56,56)",
  "rgb(138,46,46)",
  "rgb(138,46,46)",
  "rgb(138,46,46)",
  "rgb(158,76,76)",
  "rgb(178,107,107)",
  "rgb(198,137,137)",
  "rgb(218,168,168)",
  "rgb(223,176,176)",
]
`);
  });
  it("allows for trailing lines", () => {
    const viscolors = fixture("viscolor_green_dimension.txt");
    const actual = parseViscolors(viscolors);
    expect(actual).toMatchInlineSnapshot(`
Array [
  "rgb(0,0,0)",
  "rgb(0,0,0)",
  "rgb(0,50,0)",
  "rgb(0,56,0)",
  "rgb(0,63,0)",
  "rgb(0,70,0)",
  "rgb(0,76,0)",
  "rgb(0,83,0)",
  "rgb(0,89,0)",
  "rgb(0,96,0)",
  "rgb(0,103,0)",
  "rgb(0,109,0)",
  "rgb(0,116,0)",
  "rgb(0,123,0)",
  "rgb(0,129,0)",
  "rgb(0,136,0)",
  "rgb(0,143,0)",
  "rgb(0,150,0)",
  "rgb(0,63,0)",
  "rgb(0,76,0)",
  "rgb(0,96,0)",
  "rgb(0,116,0)",
  "rgb(0,150,0)",
  "rgb(0,255,0)",
]
`);
  });
});

describe("parseIni", () => {
  it("can parse the default pledit.txt file", () => {
    const pledit = fixture("PLEDIT.TXT");
    const actual = parseIni(pledit);
    const expected = {
      text: {
        normal: "#00FF00",
        current: "#FFFFFF",
        normalbg: "#000000",
        selectedbg: "#0000FF",
        font: "Arial",
      },
    };
    expect(actual).toEqual(expected);
  });

  it("can parse TopazAmp's pledit.txt file", () => {
    const pledit = fixture("PLEDIT_TOPAZ.TXT");
    const actual = parseIni(pledit);
    const expected = {
      text: {
        normal: "#319593",
        current: "#89D8D1",
        normalbg: "#000000",
        selectedbg: "#2B4242",
        font: "Arial",
        mbbg: "#000000",
        mbfg: "#89D8D1",
      },
    };
    expect(actual).toEqual(expected);
  });

  it("allows space around =", () => {
    const actual = parseIni(`
[foo]
bar = baz
`);
    const expected = {
      foo: {
        bar: "baz",
      },
    };
    expect(actual).toEqual(expected);
  });

  it("can parse a pledit.txt file with quotes", () => {
    const pledit = fixture("PLEDIT_WITH_QUOTES.TXT");
    const actual = parseIni(pledit);
    const expected = {
      text: {
        normal: "#00FF00",
        current: "#FFFFFF",
        normalbg: "#000000",
        selectedbg: "#0000FF",
        font: "Ricky's cool font!",
      },
    };
    expect(actual).toEqual(expected);
  });

  it("can parse a pledit.txt file that uses = to mark comments", () => {
    const pledit = fixture("PLEDIT_WITH_EQUALS.TXT");
    const actual = parseIni(pledit);

    const expected = {
      text: {
        normal: "#000000",
        mbfg: "#000000",
        current: "#606060",
        normalbg: "#7897B7",
        selectedbg: "#6685A5",
        mbbg: "#7897B7",
        font: "Ariel",
      },
    };
    expect(actual).toEqual(expected);
  });

  it("allows quotes around values", () => {
    const actual = parseIni(`
[foo]
bar = "baz"
  `);
    const expected = {
      foo: {
        bar: "baz",
      },
    };
    expect(actual).toEqual(expected);
  });
});

test("normalize", () => {
  expect(normalizeEqBand(1)).toBe(0);
  expect(normalizeEqBand(64)).toBe(100);
});
test("denormalize", () => {
  expect(denormalizeEqBand(0)).toBe(1);
  expect(denormalizeEqBand(100)).toBe(64);
});

describe("segment", () => {
  it("can handle min", () => {
    expect(segment(0, 100, 0, [0, 1, 2])).toBe(0);
    expect(segment(1, 100, 1, [0, 1, 2])).toBe(0);
    expect(segment(-1, 100, -1, [0, 1, 2])).toBe(0);
  });
  it("can handle max", () => {
    //expect(segment(0, 100, 100, [0, 1, 2])).toBe(2);
    //expect(segment(1, 100, 100, [0, 1, 2])).toBe(2);
    expect(segment(-1, 100, 100, [0, 1, 2])).toBe(2);
  });
  it("can handle mid", () => {
    expect(segment(0, 2, 1, [0, 1, 2])).toBe(1);
    expect(segment(0, 2, 1.5, [0, 1, 2])).toBe(2);
    expect(segment(1, 3, 2.5, [0, 1, 2])).toBe(2);
    expect(segment(-1, 2, 0.5, [0, 1, 2])).toBe(1);
  });
  it("can handle various real wold cases", () => {
    expect(segment(-100, 100, -100, ["left", "center", "right"])).toBe("left");
    expect(segment(0, 100, 88, ["left", "center", "right"])).toBe("right");
    expect(segment(0, 100, 50, ["left", "center", "right"])).toBe("center");
  });
});

describe("moveSelected", () => {
  it("can drag a single item 1", () => {
    expect(
      moveSelected(
        ["a", "b", "c", "d", "e", "f", "g", "h"],
        (i) => new Set([1]).has(i),
        1
      )
    ).toEqual(["a", "c", "b", "d", "e", "f", "g", "h"]);
  });
  it("can drag a single item", () => {
    expect(
      moveSelected(
        ["a", "b", "c", "d", "e", "f", "g", "h"],
        (i) => new Set([1]).has(i),
        3
      )
    ).toEqual(["a", "c", "d", "e", "b", "f", "g", "h"]);
  });
  it("can drag consecutive items", () => {
    expect(
      moveSelected(
        ["a", "b", "c", "d", "e", "f", "g", "h"],
        (i) => new Set([1, 2]).has(i),
        3
      )
    ).toEqual(["a", "d", "e", "f", "b", "c", "g", "h"]);
  });
  it("works for a simple example", () => {
    const arr = [true, false, false];
    expect(moveSelected(arr, (i) => arr[i], 1)).toEqual([false, true, false]);
  });
  it("works for a simple negative example", () => {
    const arr = [false, false, true];
    expect(moveSelected(arr, (i) => arr[i], -1)).toEqual([false, true, false]);
  });
});

describe("spliceIn", () => {
  it("is immutable", () => {
    const original = [1, 2, 3];
    const spliced = spliceIn(original, 1, [200]);
    expect(spliced).not.toBe(original);
    expect(original).toEqual([1, 2, 3]);
  });
  it("adds values at the given index", () => {
    const spliced = spliceIn([1, 2, 3], 1, [200]);
    expect(spliced).toEqual([1, 200, 2, 3]);
  });
});

describe("replaceAtIndex", () => {
  test("can replace", () => {
    expect(replaceAtIndex([1, 2, 3, 4], 2, 0)).toEqual([1, 2, 0, 4]);
  });
});
