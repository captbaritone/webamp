import fs from "fs";
import path from "path";
import { convertAniBinaryToCSS } from "../";

const LONG_BASE_64 = /([A-Za-z0-9+/=]{50})[A-Za-z0-9+/=]+/g;

// Parse a `.ani` in our fixture directory and trim down the image data for use
// in snapshot tests.
function readPathCss(filePath: string): string {
  const buffer = fs.readFileSync(path.join(__dirname, "./fixtures/", filePath));

  return convertAniBinaryToCSS("#example", buffer).replace(
    LONG_BASE_64,
    "$1..."
  );
}

// https://skins.webamp.org/skin/6e30f9e9b8f5719469809785ae5e4a1f/Super_Mario_Amp_2.wsz/
describe("Super_Mario_Amp_2.wsz", () => {
  test("eqslid.cur", async () => {
    expect(readPathCss("Super_Mario_Amp_2/eqslid.cur")).toMatchSnapshot();
  });
  test("close.cur", async () => {
    expect(readPathCss("Super_Mario_Amp_2/close.cur")).toMatchSnapshot();
  });
});

// https://skins.webamp.org/skin/4308a2fc648033bf5fe7c4d56a5c8823/Green-Dimension-V2.wsz/
describe("Green Dimension v2.wsz", () => {
  test("eqslid.cur", async () => {
    expect(readPathCss("Green Dimension v2/eqslid.cur")).toMatchSnapshot();
  });
});

describe("AfterShock_Digital_2003.wsz", () => {
  test("close.cur", async () => {
    expect(readPathCss("AfterShock_Digital_2003/close.cur")).toMatchSnapshot();
  });
});

describe("Edge cases", () => {
  test("piano.ani", async () => {
    expect(readPathCss("piano.ani")).toMatchSnapshot();
  });
});
