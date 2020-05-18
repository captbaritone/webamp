import fs from "fs";
import regionParser, { pointPairs } from "./regionParser";

describe("pointPairs", () => {
  it("8", () => {
    expect(
      pointPairs(["1", "0", "275", "0", "275", "115", "1", "115"])
    ).toEqual(["1,0", "275,0", "275,115", "1,115"]);
  });
});

describe("regionParser", () => {
  it("parses the default file as empty", () => {
    const regionTxt = fs.readFileSync(
      "./js/__tests__/fixtures/region.txt",
      "utf8"
    );
    expect(regionParser(regionTxt)).toEqual({});
  });
  it("parses a complex file", () => {
    const regionTxt = fs.readFileSync(
      "./js/__tests__/fixtures/region1.txt",
      "utf8"
    );
    expect(regionParser(regionTxt)).toMatchSnapshot();
  });
  it("parses a file with section headers but no info", () => {
    const regionTxt = fs.readFileSync(
      "./js/__tests__/fixtures/region_empty_sections.txt",
      "utf8"
    );
    expect(regionParser(regionTxt)).toMatchSnapshot();
  });
  it("parses the EVAunit region.txt", () => {
    const regionTxt = fs.readFileSync(
      "./js/__tests__/fixtures/region_eva.txt",
      "utf8"
    );
    expect(regionParser(regionTxt)).toMatchSnapshot();
  });
  it("parses the iTuned region.txt", () => {
    const regionTxt = fs.readFileSync(
      "./js/__tests__/fixtures/region_ituned.txt",
      "utf8"
    );
    expect(regionParser(regionTxt)).toMatchSnapshot();
  });
  it("parses a region.txt where the points have leading commas", () => {
    const regionTxt = fs.readFileSync(
      "./js/__tests__/fixtures/region_leading_comma.txt",
      "utf8"
    );
    expect(regionParser(regionTxt)).toMatchSnapshot();
  });
  it("parses Satellite M's region.txt", () => {
    const regionTxt = fs.readFileSync(
      "./js/__tests__/fixtures/region_satellite.txt",
      "utf8"
    );
    expect(regionParser(regionTxt)).toMatchSnapshot();
  });
});
