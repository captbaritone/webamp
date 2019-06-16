const fs = require("fs");
const path = require("path");
const { parse } = require("./");

function parseFile(relativePath) {
  const buffer = fs.readFileSync(path.join(__dirname, relativePath));
  return parse(buffer);
}

describe("standardframe.maki", () => {
  let maki;
  beforeEach(() => {
    maki = parseFile("./fixtures/standardframe.maki");
  });

  test("can read magic", () => {
    expect(maki.magic).toBe("FG");
  });

  test("can read byte code", () => {
    expect(maki.types.length).toBe(33);
    expect(maki.types[0]).toBe("516549714a510d87b5a6e391e7f33532");
    maki.types.forEach(type => {
      expect(type.length).toBe(32);
    });
  });

  test("can read functionNames", () => {
    expect(maki.functionNames.length).toBe(12);
    expect(maki.functionNames.map(func => func.name)).toEqual([
      "onScriptLoaded",
      "getScriptGroup",
      "getParam",
      "getToken",
      "onSetXuiParam",
      "findObject",
      "setXmlParam",
      "setXmlParam",
      "messagebox",
      "onNotify",
      "newGroup",
      "init"
    ]);
    maki.functionNames.forEach(func => {
      expect(maki.types[func.classType]).not.toBe(undefined);
    });
  });

  test("can read variables", () => {
    expect(maki.variables.length).toBe(56);
    maki.variables.forEach(variable => {
      expect(maki.types[variable.type]).not.toBe(undefined);
    });
  });

  test("can read constants", () => {
    expect(maki.constants.length).toBe(23);
  });

  test("can read functions", () => {
    expect(maki.functions).toEqual([
      { varNum: 0, offset: 0, funcNum: 0 },
      { varNum: 0, offset: 296, funcNum: 4 },
      { varNum: 2, offset: 559, funcNum: 9 },
      { function: { code: [], name: "func722", offset: 722 }, offset: 722 }
    ]);
  });

  // [opcode, size] as output by the Perl decompiler
  // prettier-ignore
  const expectedCommands = [
  [1, 5], [1, 5], [24, 5], [48, 1], [2, 1], [1, 5], [1, 5], [24, 5], [48, 1], [2, 1], [1, 5],
  [1, 5], [1, 5], [1, 5], [1, 5], [24, 5], [48, 1], [2, 1], [1, 5], [1, 5], [1, 5], [1, 5],
  [1, 5], [24, 5], [48, 1], [2, 1], [1, 5], [1, 5], [1, 5], [1, 5], [1, 5], [24, 5], [48, 1],
  [2, 1], [1, 5], [1, 5], [1, 5], [1, 5], [1, 5], [24, 5], [48, 1], [2, 1], [1, 5], [1, 5], [1, 5],
  [1, 5], [1, 5], [24, 5], [48, 1], [2, 1], [1, 5], [1, 5], [1, 5], [1, 5], [1, 5], [24, 5], [48, 1],
  [2, 1], [1, 5], [1, 5], [1, 5], [1, 5], [1, 5], [24, 5], [48, 1], [2, 1], [1, 5], [1, 5], [1, 5],
  [1, 5], [1, 5], [24, 5], [48, 1], [2, 1], [1, 5], [33, 1], [3, 5], [3, 5], [1, 5], [1, 5], [8, 1],
  [16, 5], [1, 5], [25, 5], [2, 1], [1, 5], [1, 5], [1, 5], [24, 5], [48, 1], [2, 1], [1, 5], [1, 5],
  [9, 1], [16, 5], [1, 5], [1, 5], [1, 5], [24, 5], [48, 1], [2, 1], [1, 5], [1, 5], [8, 1], [1, 5], [1, 5],
  [8, 1], [81, 1], [16, 5], [1, 5], [1, 5], [9, 1], [16, 5], [1, 5], [1, 5], [1, 5], [24, 5], [2, 1],
  [1, 5], [1, 5], [8, 1], [16, 5], [1, 5], [1, 5], [9, 1], [16, 5], [1, 5], [1, 5], [1, 5], [64, 1], [1, 5],
  [24, 5], [2, 1], [18, 5], [1, 5], [1, 5], [1, 5], [1, 5], [1, 5], [24, 5], [2, 1], [1, 5], [33, 1],
  [3, 5], [3, 5], [3, 5], [3, 5], [1, 5], [1, 5], [1, 5], [1, 5], [1, 5], [24, 5], [48, 1], [2, 1], [1, 5], [1, 5],
  [1, 5], [1, 5], [1, 5], [24, 5], [48, 1], [2, 1], [1, 5], [1, 5], [8, 1], [1, 5], [1, 5], [8, 1], [81, 1], [1, 5],
  [1, 5], [8, 1], [81, 1], [1, 5], [1, 5], [8, 1], [81, 1], [16, 5], [1, 5], [1, 5], [1, 5], [24, 5], [2, 1], [1, 5],
  [33, 1], [3, 5], [1, 5], [1, 5], [1, 5], [24, 5], [48, 1], [2, 1], [1, 5], [1, 5], [8, 1], [16, 5], [1, 5], [1, 5],
  [1, 5], [1, 5], [1, 5], [1, 5], [64, 1], [1, 5], [64, 1], [24, 5], [2, 1], [1, 5], [33, 1], [1, 5], [1, 5], [1, 5],
  [24, 5], [2, 1], [1, 5], [1, 5], [1, 5], [24, 5], [2, 1], [1, 5], [1, 5], [1, 5], [24, 5], [2, 1], [1, 5], [1, 5], [1, 5],
  [24, 5], [2, 1], [1, 5], [1, 5], [1, 5], [24, 5], [2, 1], [1, 5], [1, 5], [1, 5], [24, 5], [2, 1], [1, 5],
  [1, 5], [1, 5], [24, 5], [2, 1], [1, 5], [1, 5], [1, 5], [24, 5], [2, 1], [1, 5], [1, 5], [24, 5], [2, 1], [1, 5],
  [33, 1]
];

  test("can read decoding", () => {
    maki.decoding.forEach((command, i) => {
      const [expectedOpcode, expectedSize] = expectedCommands[i];
      if (expectedOpcode !== command.opcode) {
        throw new Error(
          `Command ${i} reported opcode ${
            command.opcode
          }. Expected ${expectedOpcode}`
        );
      }
      if (expectedSize !== command.size) {
        throw new Error(
          `Command ${i} reported size ${command.size}. Expected ${expectedSize}`
        );
      }
    });
    expect(maki.decoding.length).toBe(256);
  });
});
