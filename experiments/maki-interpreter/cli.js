const fs = require("fs");
const path = require("path");
const { parse } = require("./");

const log = true;

function parseFile(relativePath) {
  const buffer = fs.readFileSync(path.join(__dirname, relativePath));
  return parse(buffer);
}

function interpret({ commands: rawCommands, variables, types }) {
  // Debug utility to pretty print a value/variable
  function prettyPrint(offset) {
    const value = variables[offset] || offset;
    if (value == null) {
      return "NULL";
    }
    let name = value;
    if (value.type) {
      name = `Variable(${value.type.name}) ${
        value.getValue() ? "" : "(empty)"
      }`;
    }
    return name;
  }

  // Run all the commands that are safe to run. Increment this number to find
  // the next bug.
  const commands = rawCommands.slice(0, 86);
  const stack = [];
  let i = 0;
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
        const funcDefinition = command.arguments[0];
        const { name, parameters } = funcDefinition;
        const methodArgs = [];
        // This might be in reverse order
        parameters.forEach(() => {
          methodArgs.push(stack.pop());
        });
        const variable = stack.pop();
        const obj = variable.getValue();
        stack.push(obj[name](...methodArgs));
        break;
      }
      // return
      case 33: {
        const posVar = stack.pop();
        const pos = posVar.getValue();
        // TODO: What is this supposed to do?
        i += pos;
        break;
      }
      // mov
      case 48: {
        const a = stack.pop();
        const b = stack.pop();
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
          return prettyPrint(offset);
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
  const { commands, variables, types } = parseFile(relativePath);
  interpret({ commands, variables, types });
}

main();
