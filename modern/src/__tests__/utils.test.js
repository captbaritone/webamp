import * as Utils from "../utils";
import JSZip from "jszip";
import { promises as fsPromises } from "fs";
import path from "path";

async function getSkinZip() {
  const skinBuffer = await fsPromises.readFile(
    path.join(__dirname, "../../skins/CornerAmp_Redux.wal")
  );
  return JSZip.loadAsync(skinBuffer);
}

describe("getCaseInsensitiveFile", () => {
  it("gets a file independent of case", async () => {
    const zip = await getSkinZip();
    expect(Utils.getCaseInsensitveFile(zip, "SkIn.XmL")).not.toEqual(null);
  });
});

describe("readXml", () => {
  it("gets a file independent of case", async () => {
    const zip = await getSkinZip();
    const xml = await Utils.readXml(zip, "SkIn.XmL");
    expect(xml).toMatchSnapshot();
  });
});

describe("inlineIncludes", () => {
  test("asyncTreeFlatMap", async () => {
    const playerElements = {
      name: "player-elements",
      children: [{ name: "player-elements-child" }],
    };
    const playerNormal = {
      name: "player-normal",
      children: [{ name: "player-normal-child" }],
    };
    const player = {
      name: "player",
      children: [
        {
          name: "player-elements-include",
          include: playerElements,
        },
        {
          name: "main-container",
          children: [
            {
              name: "player-normal-include",
              include: playerNormal,
            },
          ],
        },
      ],
    };

    const xml = {
      name: "root",
      children: [{ name: "meta" }, { name: "include player", include: player }],
    };

    function resolveInclude(node) {
      if (node.include) {
        return node.include.children;
      }
      return node;
    }
    const resolved = await Utils.asyncTreeFlatMap(xml, resolveInclude);
    expect(resolved).toEqual({
      name: "root",
      children: [
        { name: "meta" },
        { name: "player-elements-child" },
        { name: "main-container", children: [{ name: "player-normal-child" }] },
      ],
    });
  });

  test("inlines the contents of included files as children of the include node", async () => {
    const zip = await getSkinZip();
    const originalFile = zip.file;
    zip.file = jest.fn((filePath) => originalFile.call(zip, filePath));

    const xml = await Utils.readXml(zip, "SkIn.XmL");
    const resolvedXml = await Utils.inlineIncludes(xml, zip);
    expect(resolvedXml).toMatchSnapshot();
    expect(zip.file.mock.calls.map((args) => args[0])).toMatchInlineSnapshot(`
Array [
  /SkIn\\.XmL/i,
  /xml\\\\/system-colors\\.xml/i,
  /xml\\\\/standardframe\\.xml/i,
  /xml\\\\/player\\.xml/i,
  /xml\\\\/pledit\\.xml/i,
  /xml\\\\/video\\.xml/i,
  /xml\\\\/eq\\.xml/i,
  /xml\\\\/color-presets\\.xml/i,
  /xml\\\\/color-themes\\.xml/i,
  /studio-elements\\.xml/i,
  /player-elements\\.xml/i,
  /player-normal\\.xml/i,
]
`);
  });
});

describe("asyncFlatMap", () => {
  test("recurses", async () => {
    const start = ["parent", ["child", ["grandchild"], "sibling"], "partner"];
    expect(await Utils.asyncFlatMap(start, (v) => Promise.resolve(v))).toEqual([
      "parent",
      "child",
      "grandchild",
      "sibling",
      "partner",
    ]);
  });
});

describe("asyncTreeFlatMap", () => {
  test("encounters children first", async () => {
    const mapper = jest.fn(async (node) => {
      if (node.replaceWithChildren) {
        return node.children;
      }
      return { ...node, name: node.name.toLowerCase() };
    });

    const start = {
      name: "A",
      children: [
        { name: "B" },
        {
          name: "C",
          children: [
            { name: "E" },
            { name: "F", replaceWithChildren: true, children: [{ name: "G" }] },
          ],
          replaceWithChildren: true,
        },
        { name: "D" },
      ],
    };
    expect(await Utils.asyncTreeFlatMap(start, mapper)).toEqual({
      name: "A",
      children: [{ name: "b" }, { name: "e" }, { name: "g" }, { name: "d" }],
    });

    const callOrder = mapper.mock.calls.map((args) => args[0].name);
    expect(callOrder).toEqual(["B", "C", "D", "E", "F", "G"]);
  });
});
