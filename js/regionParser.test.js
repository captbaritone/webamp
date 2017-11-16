import fs from "fs";
import regionParser from "./regionParser";

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
});
