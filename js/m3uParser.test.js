import fs from "fs";
import path from "path";
import m3uParser from "./m3uParser";

test("Can parse a sample m3u file", () => {
  const content = fs.readFileSync(
    path.join(__dirname, "__tests__/fixtures/sample.m3u"),
    "utf8"
  );

  expect(m3uParser(content)).toMatchInlineSnapshot(`
Array [
  Object {
    "duration": 168,
    "file": "test/01%20Ghosts%20I.mp3",
    "title": "01 Ghosts I.mp3",
  },
  Object {
    "duration": 196,
    "file": "test/02%20Ghosts%20I.mp3",
    "title": "02 Ghosts I.mp3",
  },
  Object {
    "duration": 230,
    "file": "test/03%20Ghosts%20I.mp3",
    "title": "03 Ghosts I.mp3",
  },
]
`);
});
