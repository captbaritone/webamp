const fs = require("fs");
const path = require("path");
const { parse } = require("./");
const { getClass } = require("./objects");

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

  test("can read classes", () => {
    expect(maki.classes.map(klass => getClass(klass).name)).toEqual([
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
      "Component",
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
      "TabSheet"
    ]);
  });

  test("can read methods", () => {
    expect(maki.methods.map(func => func.name)).toEqual([
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
    expect(maki.methods.every(func => func.typeOffset != null)).toBe(true);
  });

  test("can read variables", () => {
    expect(maki.variables.length).toBe(56);
    expect(
      maki.variables.map(variable => {
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
    maki.variables.forEach(variable => {
      expect(variable.type).not.toBe(undefined);
    });
  });

  test("can read bindings", () => {
    expect(maki.bindings).toEqual([
      { variableOffset: 0, commandOffset: 0, methodOffset: 0 },
      { variableOffset: 0, commandOffset: 76, methodOffset: 4 },
      { variableOffset: 2, commandOffset: 143, methodOffset: 9 },
      { function: { code: [], name: "func722", offset: 722 }, offset: 722 }
    ]);
  });

  // [opcode, size] as output by the Perl decompiler
  // prettier-ignore
  // TODO: Get rid of the size values here, they are not used any more
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
      const [expectedOpcode] = expectedCommands[i];
      if (expectedOpcode !== command.opcode) {
        throw new Error(
          `Command ${i} reported opcode ${
            command.opcode
          }. Expected ${expectedOpcode}`
        );
      }
    });
    expect(maki.commands.length).toBe(expectedCommands.length);
  });
});
