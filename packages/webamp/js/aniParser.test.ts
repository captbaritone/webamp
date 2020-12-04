import fs from "fs";
import path from "path";
import { parseAni, ParsedAni } from "./aniParser";

function parsePath(filePath: string): ParsedAni {
  const buffer = fs.readFileSync(
    path.join(__dirname, "./__tests__/fixtures/ani/", filePath)
  );

  return parseAni(buffer);
}

test("Super_Mario_Amp_2.wsz eqslid.cur", async () => {
  const ani = parsePath("Super_Mario_Amp_2/eqslid.cur");
  // @ts-ignore
  ani.images = ani.images.map((image) => image.slice(0, 60).join(""));
  expect(ani).toMatchInlineSnapshot(`
    Object {
      "images": Array [
        "0020103232000000168120022000400003200064000102400000128120000000000000000",
        "0020103232000000168120022000400003200064000102400000128120000000000000000",
        "0020103232000000168120022000400003200064000102400000128120000000000000000",
        "0020103232000000168120022000400003200064000102400000128120000000000000000",
        "0020103232000000168120022000400003200064000102400000128120000000000000000",
        "0020103232000000168120022000400003200064000102400000128120000000000000000",
        "0020103232000000168120022000400003200064000102400000128120000000000000000",
        "0020103232000000168120022000400003200064000102400000128120000000000000000",
      ],
      "metadata": Object {
        "bfAttributes": 1,
        "cbSize": 36,
        "iBitCount": 4,
        "iDispRate": 10,
        "iHeight": 0,
        "iWidth": 0,
        "nFrames": 8,
        "nPlanes": 1,
        "nSteps": 8,
      },
      "rate": null,
      "seq": null,
    }
  `);
});

test("Green Dimension v2.wsz eqslid.cur", async () => {
  const ani = parsePath("Green_Dimension_v2/Eqslid.cur");
  // @ts-ignore
  ani.images = ani.images.map((image) => image.slice(0, 60).join(""));
  expect(ani).toMatchInlineSnapshot(`
    Object {
      "images": Array [
        "00201032320000001681600220004000032000640001032000000160000000000000000",
        "00201032320000001681600220004000032000640001032000000160000000000000000",
      ],
      "metadata": Object {
        "bfAttributes": 1,
        "cbSize": 36,
        "iBitCount": 0,
        "iDispRate": 10,
        "iHeight": 0,
        "iWidth": 0,
        "nFrames": 2,
        "nPlanes": 0,
        "nSteps": 2,
      },
      "rate": Array [
        8,
        8,
      ],
      "seq": null,
    }
  `);
});

test("rainbow", async () => {
  const ani = parsePath("Rainbow classic.ani");
  // @ts-ignore
  ani.images = ani.images.map((image) => image.slice(0, 60).join(""));
  expect(ani).toMatchInlineSnapshot(`
    Object {
      "images": Array [
        "0020103232000000168160022000400003200064000103200000128160000000000000000",
        "0020103232000000168160022000400003200064000103200000128160000000000000000",
        "0020103232000000168160022000400003200064000103200000128160000000000000000",
        "0020103232000000168160022000400003200064000103200000128160000000000000000",
        "0020103232000000168160022000400003200064000103200000128160000000000000000",
        "0020103232000000168160022000400003200064000103200000128160000000000000000",
        "0020103232000000168160022000400003200064000103200000128160000000000000000",
      ],
      "metadata": Object {
        "bfAttributes": 1,
        "cbSize": 36,
        "iBitCount": 0,
        "iDispRate": 7,
        "iHeight": 0,
        "iWidth": 0,
        "nFrames": 7,
        "nPlanes": 0,
        "nSteps": 7,
      },
      "rate": null,
      "seq": null,
    }
  `);
});
