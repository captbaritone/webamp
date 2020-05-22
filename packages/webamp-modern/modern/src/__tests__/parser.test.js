import { readFileSync } from "fs";
import { join } from "path";
import parse from "../maki-interpreter/parser";
import { getClass } from "../maki-interpreter/objects";
import { VERSIONS } from "./testConstants";

function parseFile(relativePath) {
  const buffer = readFileSync(join(__dirname, relativePath));
  return parse(buffer);
}

describe("can parse without crashing", () => {
  const versions = [
    // VERSIONS.WINAMP_3_ALPHA,
    VERSIONS.WINAMP_3_BETA,
    VERSIONS.WINAMP_3_FULL,
    VERSIONS.WINAMP_5_02,
    VERSIONS.WINAMP_5_66,
  ];

  const scripts = [
    "hello_world.maki",
    "basicTests.maki",
    "simpleFunctions.maki",
  ];

  scripts.forEach((script) => {
    describe(`script ${script}`, () => {
      versions.forEach((version) => {
        test(`compiled with compiler version ${version}`, () => {
          expect(() => {
            parseFile(`../../resources/maki_compiler/${version}/${script}`);
          }).not.toThrow();
        });
      });
    });
  });
});

describe.skip("regressions", () => {
  describe("https://github.com/captbaritone/webamp/issues/898", () => {
    test("minimal", () => {
      parseFile("../../resources/fixtures/issue_898/minimal.maki");
    });
    test("real world", () => {});
  });
  describe.skip("foo", () => {
    test("CproTabs", () => {
      parseFile("../../resources/fixtures/foo/CproTabs.maki");
    });
  });
});

describe("standardframe.maki", () => {
  let maki;
  beforeEach(() => {
    maki = parseFile("../../resources/fixtures/standardframe.maki");
  });

  test("can read magic", () => {
    expect(maki.magic).toBe("FG");
  });

  test("can read classes", () => {
    expect(maki.classes.map((klass) => getClass(klass).name)).toEqual([
      "Object",
      "System",
      "Container",
      "Wac",
      "List",
      "Map",
      "PopupMenu",
      "Region",
      "Timer",
      "GuiObject",
      "Group",
      "Layout",
      "WindowHolder",
      "ComponentBucket",
      "Edit",
      "Slider",
      "Vis",
      "Browser",
      "EqVis",
      "Status",
      "Text",
      "Title",
      "Layer",
      "Button",
      "AnimatedLayer",
      "ToggleButton",
      "GroupList",
      "CfgGroup",
      "QueryList",
      "MouseRedir",
      "DropDownList",
      "LayoutStatus",
      "TabSheet",
    ]);
  });

  test("can read methods", () => {
    expect(maki.methods.map((func) => func.name)).toEqual([
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
      "init",
    ]);
    expect(maki.methods.every((func) => func.typeOffset != null)).toBe(true);
  });

  test("can read variables", () => {
    expect(maki.variables.length).toBe(56);
    expect(
      maki.variables.map((variable) => {
        const { typeName, type } = variable;
        if (typeName === "OBJECT") {
          return type;
        }
        return typeName;
      })
    ).toMatchInlineSnapshot(`
Array [
  "d6f50f6449b793fa66baf193983eaeef",
  "INT",
  "45be95e5419120725fbb5c93fd17f1f9",
  "45be95e5419120725fbb5c93fd17f1f9",
  "45be95e5419120725fbb5c93fd17f1f9",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "5ab9fa1545579a7d5765c8aba97cc6a6",
  "698eddcd4fec8f1e44f9129b45ff09f9",
  "STRING",
  "STRING",
  "INT",
  "INT",
  "INT",
  "INT",
  "INT",
  "INT",
  "INT",
  "INT",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "INT",
  "INT",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
  "STRING",
]
`);
    maki.variables.forEach((variable) => {
      expect(variable.type).not.toBe(undefined);
    });
  });

  test("can read bindings", () => {
    expect(maki.bindings).toEqual([
      { variableOffset: 0, commandOffset: 0, methodOffset: 0 },
      { variableOffset: 0, commandOffset: 76, methodOffset: 4 },
      { variableOffset: 2, commandOffset: 143, methodOffset: 9 },
    ]);
  });

  // [opcode, size] as output by the Perl decompiler
  // TODO: Get rid of the size values here, they are not used any more
  // prettier-ignore
  const expectedCommands = [1, 1, 24, 48, 2, 1, 1, 24, 48, 2, 1, 1, 1, 1, 1, 24, 48, 2,
    1, 1, 1, 1, 1, 24, 48, 2, 1, 1, 1, 1, 1, 24, 48, 2, 1, 1, 1, 1, 1, 24, 48, 2, 1, 1,
    1, 1, 1, 24, 48, 2, 1, 1, 1, 1, 1, 24, 48, 2, 1, 1, 1, 1, 1, 24, 48, 2, 1, 1, 1, 1,
    1, 24, 48, 2, 1, 33, 3, 3, 1, 1, 8, 16, 1, 25, 2, 1, 1, 1, 24, 48, 2, 1, 1, 9, 16, 1,
    1, 1, 24, 48, 2, 1, 1, 8, 1, 1, 8, 81, 16, 1, 1, 9, 16, 1, 1, 1, 24, 2, 1, 1, 8, 16, 1,
    1, 9, 16, 1, 1, 1, 64, 1, 24, 2, 18, 1, 1, 1, 1, 1, 24, 2, 1, 33, 3, 3, 3, 3, 1, 1, 1,
    1, 1, 24, 48, 2, 1, 1, 1, 1, 1, 24, 48, 2, 1, 1, 8, 1, 1, 8, 81, 1, 1, 8, 81, 1, 1, 8,
    81, 16, 1, 1, 1, 24, 2, 1, 33, 3, 1, 1, 1, 24, 48, 2, 1, 1, 8, 16, 1, 1, 1, 1, 1, 1, 64,
    1, 64, 24, 2, 1, 33, 1, 1, 1, 24, 2, 1, 1, 1, 24, 2, 1, 1, 1, 24, 2, 1, 1, 1, 24, 2, 1, 1,
    1, 24, 2, 1, 1, 1, 24, 2, 1, 1, 1, 24, 2, 1, 1, 1, 24, 2, 1, 1, 24, 2, 1, 33,
  ];

  test("can read commands", () => {
    maki.commands.forEach((command, i) => {
      const expectedOpcode = expectedCommands[i];
      if (expectedOpcode !== command.opcode) {
        throw new Error(
          `Command ${i} reported opcode ${command.opcode}. Expected ${expectedOpcode}`
        );
      }
    });
    expect(maki.commands.length).toBe(expectedCommands.length);
  });

  // I don't know what either of these actually are.
  test("extracts version info", () => {
    expect(maki.version).toBe(1027);
    expect(maki.extraVersion).toBe(23);
  });
});
