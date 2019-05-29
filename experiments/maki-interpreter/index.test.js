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

  test.skip("can read functions", () => {
    // console.log(maki.functions);
    expect(maki.functions).toEqual([
      { varNum: 0, offset: 0, funcNum: 0 },
      { varNum: 0, offset: 296, funcNum: 4 },
      { function: { code: [], name: "func332", offset: 332 }, offset: 332 },
      { varNum: 2, offset: 559, funcNum: 9 }
    ]);
  });

  test("can read function code", () => {
    expect(maki.functionsCode.length).toBe(1004);
  });

  test("can read function code", () => {
    expect(maki.functionsCode.length).toBe(1004);
  });

  test("can read decoding", () => {
    expect(maki.decoding.length).toBe(256);
  });
});
