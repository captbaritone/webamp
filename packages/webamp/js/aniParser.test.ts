import fs from "fs";
import path from "path";
import { parseAni } from "./aniParser";
import { readAni, aniCss } from "./aniUtils";

// Parse a `.ani` in our fixture directory and trim down the image data for use
// in snapshot tests.
function parsePath(filePath: string) {
  const buffer = fs.readFileSync(
    path.join(__dirname, "./__tests__/fixtures/ani/", filePath)
  );

  const ani = parseAni(buffer);
  const imgString = ani.images.map((image) => image.slice(0, 60).join(""));
  // @ts-ignore
  ani.images = `${imgString}...`;
  return ani;
}

function readPathCss(filePath: string) {
  const buffer = fs.readFileSync(
    path.join(__dirname, "./__tests__/fixtures/ani/", filePath)
  );

  const ani = readAni(buffer);
  ani.frames = ani.frames.map(({ url, percents }) => ({
    url: url.slice(0, 60),
    percents,
  }));
  return aniCss("#example", ani);
}

// https://skins.webamp.org/skin/6e30f9e9b8f5719469809785ae5e4a1f/Super_Mario_Amp_2.wsz/
describe("Super_Mario_Amp_2.wsz", () => {
  test("eqslid.cur", async () => {
    expect(parsePath("Super_Mario_Amp_2/eqslid.cur")).toMatchSnapshot();
    expect(readPathCss("Super_Mario_Amp_2/eqslid.cur")).toMatchSnapshot();
  });
  test("close.cur", async () => {
    expect(parsePath("Super_Mario_Amp_2/close.cur")).toMatchSnapshot();
    expect(readPathCss("Super_Mario_Amp_2/close.cur")).toMatchSnapshot();
  });
});

// https://skins.webamp.org/skin/4308a2fc648033bf5fe7c4d56a5c8823/Green-Dimension-V2.wsz/
describe("Green Dimension v2.wsz", () => {
  test("eqslid.cur", async () => {
    expect(parsePath("Green Dimension v2/eqslid.cur")).toMatchSnapshot();
    expect(readPathCss("Green Dimension v2/eqslid.cur")).toMatchSnapshot();
  });
});

describe("Edge cases", () => {
  test("piano.ani", async () => {
    expect(parsePath("piano.ani")).toMatchSnapshot();
    expect(readPathCss("piano.ani")).toMatchSnapshot();
  });
});
