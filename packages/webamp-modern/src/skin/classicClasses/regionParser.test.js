import fs from "fs";
import regionParser, { pointPairs } from "./regionParser";

function readFixture(name) {
  return fs.readFileSync(`./js/__tests__/fixtures/${name}`, "utf8");
}

describe("pointPairs", () => {
  it("8", () => {
    expect(
      pointPairs(["1", "0", "275", "0", "275", "115", "1", "115"])
    ).toEqual(["1,0", "275,0", "275,115", "1,115"]);
  });
});

describe("regionParser", () => {
  it("parses the default file as empty", () => {
    const regionTxt = readFixture("region.txt");
    expect(regionParser(regionTxt)).toEqual({});
  });
  it("parses a complex file", () => {
    const regionTxt = readFixture("region1.txt");
    expect(regionParser(regionTxt)).toMatchSnapshot();
  });
  it("parses a file with section headers but no info", () => {
    const regionTxt = readFixture("region_empty_sections.txt");
    expect(regionParser(regionTxt)).toMatchSnapshot();
  });
  it("parses the EVAunit region.txt", () => {
    const regionTxt = readFixture("region_eva.txt");
    expect(regionParser(regionTxt)).toMatchSnapshot();
  });
  it("parses the iTuned region.txt", () => {
    const regionTxt = readFixture("region_ituned.txt");
    expect(regionParser(regionTxt)).toMatchSnapshot();
  });
  it("parses a region.txt where the points have leading commas", () => {
    const regionTxt = readFixture("region_leading_comma.txt");
    expect(regionParser(regionTxt)).toMatchSnapshot();
  });
  it("parses Satellite M's region.txt", () => {
    const regionTxt = readFixture("region_satellite.txt");
    expect(regionParser(regionTxt)).toMatchSnapshot();
  });
});
