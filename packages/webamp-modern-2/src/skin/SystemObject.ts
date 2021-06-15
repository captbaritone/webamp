import { interpret } from "../maki/interpreter";
import { getClass } from "../maki/objects";
import { ParsedMaki } from "../maki/parser";

import Group from "./Group";

export default class SystemObject {
  _parentGroup: Group;
  _parsedScript: ParsedMaki;

  constructor(parsedScript: ParsedMaki) {
    this._parsedScript = parsedScript;
  }

  init() {
    const initialVariable = this._parsedScript.variables[0];
    if (initialVariable.type !== "OBJECT") {
      throw new Error("First variable was not SystemObject.");
    }
    initialVariable.value = this;
    // TODO: How should we setup bindings?
    // console.log(this._parsedScript.bindings);
    interpret(0, this._parsedScript, classResover);
  }

  setParentGroup(group: Group) {
    this._parentGroup = group;
  }

  /* Required for Maki */
  getruntimeversion(): number {
    return 5.666;
  }

  getskinname() {
    return "TODO: Get the Real skin name";
  }
}

function classResover(guid: string): any {
  switch (guid) {
    case "d6f50f6449b793fa66baf193983eaeef":
      return SystemObject;
    default:
      console.log();
      throw new Error(
        `Unresolvable class "${getClass(guid).name}" (guid: ${guid})`
      );
  }
}
