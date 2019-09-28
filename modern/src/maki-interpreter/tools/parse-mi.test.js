import std from "../objectData/std.json";
import config from "../objectData/config.json";
import pldir from "../objectData/pldir.json";
import { parseFile } from "../tools/parse-mi";
import path from "path";

/**
 * This file basically ensures that `yarn extract-object-types` has been run.
 */

const compilers = path.join(__dirname, "../../../resources/maki_compiler/");

const lib30full = path.join(compilers, "v1.1.1.b3 (Winamp 3.0 full)/Lib/");
const lib502 = path.join(compilers, "v1.1.13 (Winamp 5.02)/lib/");
const libUnknown = path.join(compilers, "Unknown (Winamp 5.03)/lib/");

test("std.mi", () => {
  const parsedObjects = parseFile(path.join(lib502, "std.mi"));
  expect(parsedObjects).toEqual(std);
});

test("config.mi", () => {
  const parsedObjects = parseFile(path.join(libUnknown, "config.mi"));
  expect(parsedObjects).toEqual(config);
});

test("pldir.mi", () => {
  const parsedObjects = parseFile(path.join(lib30full, "pldir.mi"));
  expect(parsedObjects).toEqual(pldir);
});
