const { printCommand } = require("./prettyPrinter");

function interpret(start, program, { log = false }) {
  const { commands, methods, variables, classes, offsetToCommand } = program;

  // Run all the commands that are safe to run. Increment this number to find
  // the next bug.
  const stack = [];
  let i = start - 1;
  while (i < commands.length) {
    i++;
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
      // ==
      case 8: {
        const a = stack.pop();
        const b = stack.pop();
        stack.push(a.getValue() === b.getValue());
        break;
      }
      // jumpIf
      case 16: {
        const value = stack.pop();
        // This seems backwards. Seems like we're doing a "jump if not"
        if (value) {
          break;
        }
        const offset = command.arguments[0];
        const nextCommandIndex = offsetToCommand[offset];
        i = nextCommandIndex;
        break;
      }
      // jump
      case 18: {
        const offset = command.arguments[0];
        const nextCommandIndex = offsetToCommand[offset];
        i = nextCommandIndex;
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
      // + (add)
      case 64: {
        const a = stack.pop();
        const b = stack.pop();
        stack.push(a.getValue() + b.getValue());
        break;
      }
      // >>
      case 88: {
        const a = stack.pop();
        const b = stack.pop();
        stack.push(a >> b);
        break;
      }
      default:
        throw new Error(`Unhandled opcode ${command.opcode}`);
    }

    // Print some debug info
    if (log) {
      printCommand({ i, command, stack, variables });
    }
  }
}

module.exports = interpret;
