const fs = require("fs");
const path = require("path");
const { parse } = require("./");

function parseFile(relativePath) {
  const buffer = fs.readFileSync(path.join(__dirname, relativePath));
  return parse(buffer);
}

class Group {}

const System = {
  getScriptGroup() {
    return new Group();
  }
};

function interpret({ commands: rawCommands, variables, types }) {
  const commands = rawCommands.slice(0, 5);
  const environment = {
    System
  };
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
        console.log(variable);
        stack.push(variable);
        break;
      }
      // call
      case 24: {
        const funcDefinition = command.arguments[0];
        const { name } = funcDefinition;
        const variable = stack.pop();
        const type = types[variable.type];
        const obj = environment[type.name];
        stack.push(obj[name]());
        break;
      }
      // mov
      case 48: {
        const a = stack.pop();
        const b = stack.pop();
        stack.push(a);
        break;
      }
    }
    i++;
  }
}

function main() {
  const relativePath = process.argv[2];
  const { commands, variables, types } = parseFile(relativePath);
  interpret({ commands, variables, types });
}

main();
