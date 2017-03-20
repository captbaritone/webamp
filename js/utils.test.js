import fs from "fs";

import {
  getTimeObj,
  getTimeStr,
  clamp,
  parseViscolors,
  parseIni
} from "./utils";

const fixture = filename =>
  fs.readFileSync(`./js/__tests__/fixtures/${filename}`).toString();

describe("getTimeObj", () => {
  it("expresses seconds as an object", () => {
    const actual = getTimeObj(1234);
    const expected = {
      minutesFirstDigit: 2,
      minutesSecondDigit: 0,
      secondsFirstDigit: 3,
      secondsSecondDigit: 4
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
  it("pads with zeros", () => {
    const actual = getTimeStr(5);
    const expected = "00:05";
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
    const expected = [
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
      "rgb(150,150,150)"
    ];
    expect(actual).toEqual(expected);
  });
});

describe("parseIni", () => {
  it("can parse the default pledit.txt file", () => {
    const pledit = fixture("PLEDIT.TXT");
    const actual = parseIni(pledit);
    const expected = {
      Normal: "#00FF00",
      Current: "#FFFFFF",
      NormalBG: "#000000",
      SelectedBG: "#0000FF",
      Font: "Arial"
    };
    expect(actual).toEqual(expected);
  });

  it("can parse TopazAmp's pledit.txt file", () => {
    const pledit = fixture("PLEDIT_TOPAZ.TXT");
    const actual = parseIni(pledit);
    const expected = {
      Normal: "#319593",
      Current: "#89D8D1",
      NormalBG: "#000000",
      SelectedBG: "#2B4242",
      Font: "Arial",
      mbBG: "#000000",
      mbFG: "#89D8D1"
    };
    expect(actual).toEqual(expected);
  });
});
