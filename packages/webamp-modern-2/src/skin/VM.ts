import { interpret } from "../maki/interpreter";
import { ParsedMaki } from "../maki/parser";
import { Variable } from "../maki/v";
import BaseObject from "./makiClasses/BaseObject";

import { classResolver } from "./resolver";

export default class Vm {
  _scripts: ParsedMaki[] = [];
  // This could easily become performance sensitive. We could make this more
  // performant by normalizing some of these things when scripts are added.
  dispatch(object: BaseObject, event: string, args: Variable[] = []) {
    for (const [scriptId, script] of this._scripts.entries()) {
      for (const binding of script.bindings) {
        if (
          script.methods[binding.methodOffset].name === event &&
          script.variables[binding.variableOffset].value === object
        ) {
          const reversedArgs = [...args].reverse();
          this.interpret(scriptId, binding.commandOffset, reversedArgs);
        }
      }
    }
  }

  addScript(maki: ParsedMaki): number {
    const index = this._scripts.length;
    this._scripts.push(maki);
    return index;
  }

  interpret(scriptId: number, commandOffset: number, args: Variable[]) {
    const script = this._scripts[scriptId];
    interpret(commandOffset, script, args, classResolver);
  }
}
