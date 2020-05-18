import std from "../objectData/std.json";
import config from "../objectData/config.json";
import pldir from "../objectData/pldir.json";
import { parseFile } from "../tools/parse-mi";
import path from "path";

/**
 * This file basically ensures that `yarn extract-object-types` has been run.
 */

const compilers = path.join(__dirname, "../../../resources/maki_compiler/");

const lib566 = path.join(compilers, "v1.2.0 (Winamp 5.66)/lib/");

test("std.mi", () => {
  const parsedObjects = parseFile(path.join(lib566, "std.mi"));
  expect(parsedObjects).toEqual(std);
});

test("config.mi", () => {
  const parsedObjects = parseFile(path.join(lib566, "config.mi"));
  expect(parsedObjects).toEqual(config);
});

test("pldir.mi", () => {
  const parsedObjects = parseFile(path.join(lib566, "pldir.mi"));
  expect(parsedObjects).toEqual(pldir);
});
