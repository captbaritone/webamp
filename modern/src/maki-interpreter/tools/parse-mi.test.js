import { objects } from "../objects";
import { parseFile } from "../tools/parse-mi";
import path from "path";

// Between myself and the author of the decompiler, a number of manual tweaks
// have been made to our current object definitions. This function recreates
// those tweaks so we can have an apples to apples comparison.
function applyPatches(parsedObjects) {
  /*
   * From object.js
   *
   * > The std.mi has this set as void, but we checked in Winamp and confirmed it
   * > returns 0/1
   */
  parsedObjects["5D0C5BB67DE14b1fA70F8D1659941941"].functions[5].result =
    "boolean";

  /*
   * From Object.pm
   *
   * > note, std.mi does not have this parameter!
   */
  parsedObjects.B4DCCFFF81FE4bcc961B720FD5BE0FFF.functions[0].parameters[0][1] =
    "onoff";

  /*
   * From Object.pm
   *
   * > note, my std.mi did not contain this!
   */
  parsedObjects.B4DCCFFF81FE4bcc961B720FD5BE0FFF.functions.push({
    parameters: [],
    name: "getCurCfgVal",
    result: "Int",
  });
}

// In order to do traversal objects.js adds parent refrences.
// For comparison, we don't want these.
function orphan(objs) {
  const newObjs = {};
  Object.keys(objs).forEach(key => {
    const { parentClass, ...rest } = objs[key];
    newObjs[key] = rest;
  });
  return newObjs;
}

test("parseFile()", () => {
  const compilers = path.join(__dirname, "../../../resources/maki_compiler/");

  const lib30full = path.join(compilers, "v1.1.1.b3 (Winamp 3.0 full)/Lib/");
  const lib502 = path.join(compilers, "v1.1.13 (Winamp 5.02)/lib/");
  // const lib566 = path.join(compilers, "v1.2.0 (Winamp 5.66)/lib/");
  const libUnknown = path.join(compilers, "Unknown (Winamp 5.03)/lib/");

  const parsedObjects = {
    ...parseFile(path.join(lib502, "std.mi")),
    ...parseFile(path.join(lib30full, "pldir.mi")),
    ...parseFile(path.join(libUnknown, "config.mi")),
  };

  applyPatches(parsedObjects);

  expect(parsedObjects).toEqual(orphan(objects));
});
