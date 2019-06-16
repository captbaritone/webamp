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

  test("can read types", () => {
    // These values were extracted from what the Perl decompiler gets.
    expect(maki.types).toEqual([
      "516549714a510d87b5a6e391e7f33532",
      "d6f50f6449b793fa66baf193983eaeef",
      "e90dc47b4ae7840d0b042cb0fcf775d2",
      "00c074a049a0fea2bbfa8dbe401616db",
      "b2023ab54ba1434d6359aebec6f30375",
      "3860366542a7461b3fd875aa73bf6766",
      "f4787af44ef7b2bb4be7fb9c8da8bea9",
      "3a370c02439f3cbf8886f184361ecf5b",
      "5d0c5bb64b1f7de1168d0fa741199459",
      "4ee3e1994becc636bc78cd97b028869c",
      "45be95e5419120725fbb5c93fd17f1f9",
      "60906d4e482e537e94cc04b072568861",
      "403abcc04bd66f22c810a48b47259329",
      "97aa3e4d4fa8f4d0f20a7b818349452a",
      "64e4bbfa49d981f45ba8c0b0fdbcc32e",
      "62b65e3f408d375e8176ea8d771bb94a",
      "ce4f97be4e1977b098d45699276cc933",
      "a8c2200d4b2a51eb4b5d7fba714c5dc6",
      "8d1eba38483e489e1f8d60b905c4c543",
      "0f08c9404b23af39c4b8f38059bb7e8f",
      "efaa867241fa310ea985dcb74bcb5b52",
      "7dfd32444e7c3751ae8240bf33dc3a5f",
      "5ab9fa1545579a7d5765c8aba97cc6a6",
      "698eddcd4fec8f1e44f9129b45ff09f9",
      "6b64cd274c4b5a26a7e6598c3a49f60c",
      "b4dccfff4bcc81fe0f721b96ff0fbed5",
      "01e28ce111d5b059dee49f970a76516f",
      "80f0f8bd42a61ba5363293a04a8d0ca0",
      "cdcb785d425381f2b861058ffa3c2872",
      "9b2e341b40fa6c981b0c858b0594e86e",
      "36d59b714af803fd020595977a26dbb7",
      "7fd5f21048dfacc45154a0a676dc6c57",
      "b5baa5354dcb05b318e6c1ad96688fd2"
    ]);
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

  test("can read commands", () => {
    maki.commands.forEach((command, i) => {
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
    expect(maki.commands.length).toBe(expectedCommands.length);
  });
});
