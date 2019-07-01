const fs = require("fs");
const path = require("path");
const { parse } = require("./");
const { getClass } = require("./objects");
const Variable = require("./variable");

const log = false;

function parseFile(relativePath) {
  const buffer = fs.readFileSync(path.join(__dirname, relativePath));
  return parse(buffer);
}

class GuiObject {}
class Group extends GuiObject {
  findObject(id) {
    throw new Error("Not implemented");
  }
  setXmlParam(id, value) {
    throw new Error("Not implemented");
  }
}
class PopupMenu {}
class Container {}

const onScriptLoadedCallbacks = [];
const onSetXuiParamCallbacks = [];
class System {
  _start() {
    onScriptLoadedCallbacks.forEach(cb => {
      cb();
    });
  }
  onScriptLoaded(cb) {
    onScriptLoadedCallbacks.push(cb);
  }
  onSetXuiParam(cb) {
    onSetXuiParamCallbacks.push(cb);
  }
  getScriptGroup() {
    return new Group();
  }
  getToken(str, separator, tokennum) {
    return "Some Token String";
  }
  getParam() {
    return "Some String";
  }
  messagebox(message, var2, var3, var4) {
    alert(message);
  }
}
const runtime = {
  d6f50f6449b793fa66baf193983eaeef: System,
  "45be95e5419120725fbb5c93fd17f1f9": Group,
  "4ee3e1994becc636bc78cd97b028869c": GuiObject,
  f4787af44ef7b2bb4be7fb9c8da8bea9: PopupMenu,
  e90dc47b4ae7840d0b042cb0fcf775d2: Container
};

function getClassName(klass) {
  return klass
    .toString()
    .split("\n")[0]
    .split(" ")
    .slice(0, 2)
    .join(" ");
}

function interpret({ start, commands, methods, variables, classes, runtime }) {
  // Debug utility to pretty print a value/variable
  function prettyPrint(value) {
    let name = value;
    if (value instanceof Variable) {
      let type = "UNKOWN";
      switch (value.typeName) {
        case "OBJECT":
          const obj = runtime[value.type];
          type = getClassName(obj);
          break;
        case "STRING":
          type = `STRING(${value.getValue()})`;
          break;
        case "INT":
          type = "INT";
          break;

        default:
          throw new Error(`Unknown variable type ${value.typeName}`);
      }
      return `Variable(${type}) ${value.getValue() ? "" : "(empty)"}`;
    }
    return name;
  }

  // Run all the commands that are safe to run. Increment this number to find
  // the next bug.
  const stack = [];
  let i = start;
  while (i < commands.length) {
    const command = commands[i];

    switch (command.opcode) {
      // push
      case 1: {
        // What are these? Do they have names?
        const offsetIntoVariables = command.arguments[0];
        const variable = variables[offsetIntoVariables];
        // Maybe we should be pushing the actual value on the stack?
        // Do we ever assign to a variable that we get from the stack?
        // Or do all variables come in via arguments?
        stack.push(variable);
        break;
      }
      // pop
      case 2: {
        stack.pop();
        break;
      }
      // call
      case 24: {
        const methodOffset = command.arguments[0];
        const { name: methodName, typeOffset: classesOffset } = methods[
          methodOffset
        ];
        // TODO: Find a better way to get the argCount
        const klass = classes[classesOffset];
        let argCount = klass.prototype[methodName].length;

        const methodArgs = [];
        // This might be in reverse order
        while (argCount--) {
          methodArgs.push(stack.pop());
        }
        const variable = stack.pop();
        const obj = variable.getValue();
        stack.push(obj[methodName](...methodArgs));
        break;
      }
      // return
      case 33: {
        const variable = stack.pop();
        return variable.getValue();
      }
      // mov
      case 48: {
        const a = stack.pop();
        const b = stack.pop();
        // console.log("MOVE");
        // console.log(b.typeName, a);
        b.setValue(a);
        stack.push(a);
        break;
      }
      default:
        throw new Error(`Unhandled opcode ${command.opcode}`);
    }
    i++;

    // Print some debug info
    if (log) {
      console.log(
        i + 1,
        command.command.name.toUpperCase(),
        command.opcode,
        command.arguments.map(offset => {
          return prettyPrint(variables[offset]);
        })
      );
      stack.forEach((value, i) => {
        const name = prettyPrint(value);
        console.log("    ", i + 1, name);
      });
    }
  }
}

function main() {
  const relativePath = process.argv[2];
  const { commands, variables, classes, methods, bindings } = parseFile(
    relativePath
  );

  const system = new System();

  // Set the System global
  variables[0].setValue(system);

  // Replace class hashes with those from the runtime
  const resolvedClasses = classes.map(hash => {
    const resolved = runtime[hash];
    if (resolved == null) {
      const klass = getClass(hash);
      console.warn(
        `Class missing from runtime: ${hash} expected ${klass.name}`
      );
    }
    return resolved;
  });

  bindings.forEach(binding => {
    const handler = () => {
      return interpret({
        start: binding.commandOffset,
        commands,
        variables,
        classes: resolvedClasses,
        runtime,
        methods
      });
    };

    if (binding.variableOffset === 0) {
      const obj = variables[binding.variableOffset].getValue();
      const method = methods[binding.methodOffset];
      obj[method.name](handler);
    } else {
      console.log("Not binding to non-system events", binding);
    }
  });

  system._start();
}

main();
