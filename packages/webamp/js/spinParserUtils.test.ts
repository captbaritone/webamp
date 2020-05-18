import * as SkinParserUtils from "./skinParserUtils";

describe("getFileExtension", () => {
  it("can get bmp", () => {
    expect(SkinParserUtils.getFileExtension("foo.bmp")).toBe("bmp");
  });
  it("can match four char extension", () => {
    expect(SkinParserUtils.getFileExtension("foo.html")).toBe("html");
  });
  it("converts to lower case", () => {
    expect(SkinParserUtils.getFileExtension("foo.BMP")).toBe("bmp");
  });
  it("returns null if a match is not found", () => {
    expect(SkinParserUtils.getFileExtension("foo")).toBe(null);
  });
});
