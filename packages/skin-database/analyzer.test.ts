import fsPromises from "fs";
import path from "path";
import * as Analyzer from "./analyser";
import JSZip from "jszip";

test("getReadme", async () => {
  const zip = await getSkinZip("Sonic_Attitude.wsz");
  const readme = await Analyzer.getReadme(zip);
  if (readme == null) {
    throw new Error("Expected to find readme.");
  }
  expect(readme.length).toBe(387);
  expect(readme.split("\n")[0].trim()).toMatchInlineSnapshot(
    `"SONIC ATTITUDE - By LuigiHann (luigihann@aol.com)"`
  );
});

test("getSkinType", async () => {
  const zip = await getSkinZip("Sonic_Attitude.wsz");
  const skinType = await Analyzer.getSkinType(zip);
  expect(skinType).toBe("CLASSIC");
});

function getSkinZip(filename: string): Promise<JSZip> {
  const buffer = fsPromises.readFileSync(
    path.join(__dirname, "../webamp/demo/skins/", filename)
  );
  return JSZip.loadAsync(buffer);
}
