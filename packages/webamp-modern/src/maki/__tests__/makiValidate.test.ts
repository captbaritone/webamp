import fs from "fs";
import path from "path";
import { parse } from "../parser";
import { interpret } from "../interpreter";
import { MockSystem, classResolver } from "./MockSystem";
import { COMMANDS } from "../constants";

const messages = new Map<string, string[]>();

test.skip("EOF", () => {
  const filename =
    "xui-statusbar_e28cfc6494da84a543a7fc28ae445403_37800163b91ca58eba885aa054a52b5a.maki";
  /*
  const maki = fs.readFileSync(
    path.join(__dirname, "extracted_maki", filename)
  );
  */
  const maki = fs.readFileSync(path.join(__dirname, "actioninfo2.maki"));
  parse(maki);
});

test.skip("debug function", () => {
  const maki = fs.readFileSync(
    path.join(
      __dirname,
      "fixtures",
      "TestBedSkin",
      "scripts",
      "debug",
      "debug.maki"
    )
  );
  const script = parse(maki);
  // onsole.log(script);
});

describe(`Validate Maki scripts extracted from the db`, () => {
  test("Parse all scripts", () => {
    const makiFiles = fs.readdirSync(path.join(__dirname, "extracted_maki"));
    let smallest = Infinity;
    let smallestFile = "";
    let smallestScript = null;
    for (const makiFile of makiFiles) {
      const makiPath = path.join(__dirname, "extracted_maki", makiFile);
      const maki = fs.readFileSync(makiPath);
      try {
        const script = parse(maki);
        const hasCall = script.commands.some((c) => c.opcode === 0x18);
        const hasStrangeCall = script.commands.some((c) => c.opcode === 0x70);
        if (hasStrangeCall && hasCall && maki.length < smallest) {
          smallest = maki.length;
          smallestFile = makiFile;
          smallestScript = script;
          console.log(smallestFile, smallest);
        }
      } catch (e) {
        if (!messages.has(e.message)) {
          messages.set(e.message, []);
        }
        messages.get(e.message).push(makiFile + " -- " + maki.length);
      }
    }
    // console.log(messages);
    console.log(smallestScript);
    console.log(smallestFile, smallest);
  });
});
