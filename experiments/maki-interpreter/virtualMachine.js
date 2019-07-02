const { printCommand } = require("./prettyPrinter");

const log = true;
function interpret(start, { commands, methods, variables, classes }) {
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

    // Print some debug info
    if (log) {
      printCommand({ i, command, stack, variables });
    }
    i++;
  }
}

module.exports = interpret;
