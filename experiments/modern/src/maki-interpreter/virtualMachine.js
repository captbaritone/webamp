const Variable = require("./variable");

async function interpret(start, program, { logger = null }) {
  const { commands, methods, variables, classes, offsetToCommand } = program;

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
      // ==
      case 8: {
        const a = stack.pop();
        const b = stack.pop();
        // I'm suspicious about this. Should we really be storing both values
        // and variables on the stack.
        const aValue = a instanceof Variable ? a.getValue() : a;
        const bValue = b instanceof Variable ? b.getValue() : b;
        stack.push(aValue === bValue);
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
        i = nextCommandIndex - 1;
        break;
      }
      // jump
      case 18: {
        const offset = command.arguments[0];
        const nextCommandIndex = offsetToCommand[offset];
        i = nextCommandIndex - 1;
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
      // - (subtract)
      case 65: {
        const a = stack.pop();
        const b = stack.pop();
        const aValue = a instanceof Variable ? a.getValue() : a;
        const bValue = b instanceof Variable ? b.getValue() : b;
        stack.push(bValue - aValue);
        break;
      }
      // * (multiply)
      case 66: {
        const a = stack.pop();
        const b = stack.pop();
        const aValue = a instanceof Variable ? a.getValue() : a;
        const bValue = b instanceof Variable ? b.getValue() : b;
        stack.push(bValue * aValue);
        break;
      }
      // / (divide)
      case 67: {
        const a = stack.pop();
        const b = stack.pop();
        const aValue = a instanceof Variable ? a.getValue() : a;
        const bValue = b instanceof Variable ? b.getValue() : b;
        stack.push(bValue / aValue);
        break;
      }
      // % (mod)
      case 68: {
        const a = stack.pop();
        const b = stack.pop();
        const aValue = a instanceof Variable ? a.getValue() : a;
        const bValue = b instanceof Variable ? b.getValue() : b;
        stack.push(bValue % aValue);
        break;
      }
      // & (binary and)
      case 72: {
        const a = stack.pop();
        const b = stack.pop();
        const aValue = a instanceof Variable ? a.getValue() : a;
        const bValue = b instanceof Variable ? b.getValue() : b;
        stack.push(bValue & aValue);
        break;
      }
      // | (binary or)
      case 73: {
        const a = stack.pop();
        const b = stack.pop();
        const aValue = a instanceof Variable ? a.getValue() : a;
        const bValue = b instanceof Variable ? b.getValue() : b;
        stack.push(bValue | aValue);
        break;
      }
      // - (negative)
      case 76: {
        const a = stack.pop();
        stack.push(-a.getValue());
        break;
      }
      // <<
      case 88: {
        const a = stack.pop();
        const b = stack.pop();
        const aValue = a instanceof Variable ? a.getValue() : a;
        const bValue = b instanceof Variable ? b.getValue() : b;
        stack.push(aValue << bValue);
        break;
      }
      // >>
      case 89: {
        const a = stack.pop();
        const b = stack.pop();
        const aValue = a instanceof Variable ? a.getValue() : a;
        const bValue = b instanceof Variable ? b.getValue() : b;
        stack.push(bValue >> aValue);
        break;
      }
      default:
        throw new Error(`Unhandled opcode ${command.opcode}`);
    }

    i++;
    // Print some debug info
    if (logger) {
      const done = logger({ i, command, stack, variables, program });
      console.log(done);
      await done;
    }
  }
}

module.exports = interpret;
