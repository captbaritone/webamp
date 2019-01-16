const fs = require("fs");
const path = require("path");
const { parse } = require("./");

function parseFile(relativePath) {
  const buffer = fs.readFileSync(path.join(__dirname, relativePath));
  return parse(buffer);
}

describe("standardframe.maki", () => {
  let debug;
  beforeEach(() => {
    debug = parseFile("./fixtures/standardframe.maki");
  });

  test("can read magic", () => {
    expect(debug.magic).toBe("FG");
  });

  test("can read byte code", () => {
    expect(debug.types.length).toBe(33);
    expect(debug.types[0]).toBe("516549714a510d87b5a6e391e7f33532");
    debug.types.forEach(type => {
      expect(type.length).toBe(32);
    });
  });

  test("can read functionNames", () => {
    expect(debug.functionNames.length).toBe(12);
    expect(debug.functionNames.map(func => func.name)).toEqual([
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
    debug.functionNames.forEach(func => {
      expect(debug.types[func.classType]).not.toBe(undefined);
    });
  });

  test("can read variables", () => {
    expect(debug.variables.length).toBe(56);
    debug.variables.forEach(variable => {
      expect(debug.types[variable.type]).not.toBe(undefined);
    });
  });

  test("can read constants", () => {
    expect(debug.constants.length).toBe(23);
  });

  test("can read functions", () => {
    expect(debug.functions).toEqual([
      { varNum: 0, offset: 0, funcNum: 0 },
      { varNum: 0, offset: 296, funcNum: 4 },
      { varNum: 2, offset: 559, funcNum: 9 }
    ]);
  });

  test("can read function code", () => {
    expect(debug.functionsCode.length).toBe(1004);
  });
});
