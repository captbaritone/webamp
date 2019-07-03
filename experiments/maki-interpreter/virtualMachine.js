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
        const offsetIntoVariables = command.arguments[0];
        stack.push(variables[offsetIntoVariables]);
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
        const klass = classes[classesOffset];
        // This is a bit awkward. Because the variables are stored on the stack
        // before the object, we have to find the number of arguments without
        // actually having access to the object instance.
        let argCount = klass.prototype[methodName].length;

        const methodArgs = [];
        while (argCount--) {
          methodArgs.push(stack.pop().getValue());
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
