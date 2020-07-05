import fs from "fs";
import path from "path";
import { analyseBuffer } from "./nsfwImage";

jest.setTimeout(30000);

test("predict nsfw", async () => {
  const skin = fs.readFileSync(path.join(__dirname, "./fixtures/60.png"));

  const result = await analyseBuffer(Uint8Array.from(skin));
  expect(result).toEqual({
    drawing: 0.14270488917827606,
    hentai: 0.006160343065857887,
    neutral: 0.8509458303451538,
    porn: 0.0001247897307621315,
    sexy: 0.00006406463944585994,
  });
});
