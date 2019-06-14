import * as Utils from "./utils";
import JSZip from "jszip";
import { promises as fsPromises } from "fs";
import path from "path";

async function getSkinZip() {
  const skinBuffer = await fsPromises.readFile(
    path.join(__dirname, "../public/skins/CornerAmp_Redux.zip")
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

describe("asyncTreeMao", () => {
  it("runs parents before children", async () => {
    const callNodeNames = new Set();
    const mapper = node => {
      callNodeNames.add(node.name);
      if (node.name === "root.2") {
        const children = [{ name: "root.2.1" }];
        return { ...node, children };
      }
      return node;
    };

    const structure = {
      name: "root",
      children: [{ name: "root.1" }, { name: "root.2" }, { name: "root.3" }],
    };

    const mappedStructure = await Utils.asyncTreeMap(structure, mapper);
    expect(callNodeNames).toEqual(
      new Set(["root", "root.1", "root.2", "root.2.1", "root.3"])
    );
    expect(mappedStructure).toEqual({
      name: "root",
      children: [
        { name: "root.1" },
        { name: "root.2", children: [{ name: "root.2.1" }] },
        { name: "root.3" },
      ],
    });
  });
});

describe("inlineIncludes", () => {
  it("inlines the contents of included files as children of the include node", async () => {
    const zip = await getSkinZip();
    const xml = await Utils.readXml(zip, "SkIn.XmL");
    const resolvedXml = await Utils.inlineIncludes(xml, zip);
    expect(resolvedXml).toMatchSnapshot();
  });
});
