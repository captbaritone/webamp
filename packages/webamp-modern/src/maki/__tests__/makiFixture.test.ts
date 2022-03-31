import fs from "fs";
import path from "path";
import { parse } from "../parser";
import { interpret } from "../interpreter";
import { MockSystem, classResolver } from "./MockSystem";

/**
 * Loads a specially crafted Maki script that can be used to test the behavior
 * of Winamp. The script is a collection of assertions that are run against the
 * Maki runtime.
 *
 * The script can run in real Winamp using the test skin as a harness. In that
 * case, it renders a GuiList showing the result of each test.
 *
 * In unit tests (here) it runs against a mock environment `MockSystem` which is
 * tightly coupled to the implementaiton of the Maki code. Specifically, the
 * test environment expects the Maki to code construct a single GuiList
 * containing assertions and their results with a specific structure. Each item
 * is a tripple of:
 *
 * - Status: "SUCCESS" or "FAILURE"
 * - Code: A string representiaton of the code that was expected to return "true"
 * - Description: A human-readable description of what was being tested
 */

const scriptPath = path.join(
  __dirname,
  "fixtures",
  "TestBedSkin",
  "scripts",
  "assertions.maki"
);

describe(`Maki test harness`, () => {
  const maki = fs.readFileSync(scriptPath);
  const script = parse(maki);
  const initialVariable = script.variables[0];
  if (initialVariable.type !== "OBJECT") {
    throw new Error("First variable was not SystemObject.");
  }
  // Our types say this should extend GuiObj, but that would
  // require pulling in code that does not run well in jsdom.
  // So we just cast to `any` here.
  const system = new MockSystem() as any;
  initialVariable.value = system;

  const onScriptLoadedBinding = script.bindings.find(
    (binding) =>
      script.methods[binding.methodOffset].name === "onscriptloaded" &&
      script.variables[binding.variableOffset].value === system
  );

  if (onScriptLoadedBinding === undefined) {
    throw new Error("Could not find event binding for System.onscriptloaded");
  }

  const variables = [];

  interpret(
    onScriptLoadedBinding.commandOffset,
    script,
    variables,
    classResolver
  );

  for (const result of system.group.list.items) {
    const [status, code, description] = result;
    test(`${description}: (${code})`, () => expect(status).toBe("SUCCESS"));
  }
});
