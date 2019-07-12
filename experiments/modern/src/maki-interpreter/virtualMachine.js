const Variable = require("./variable");

function coerceTypes (var1, var2, val1, val2) {
  if (var2.type === 'INT') {
    if (var1.type === 'FLOAT' || var1.type === 'DOUBLE') {
      return Math.floor(val1);
    }
  }

  return val1;
}

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
        let aValue = a instanceof Variable ? a.getValue() : a;
        let bValue = b instanceof Variable ? b.getValue() : b;
        aValue = coerceTypes(a, b, aValue, bValue);
        stack.push(aValue === bValue);
        break;
      }
      // !=
      case 9: {
        const a = stack.pop();
        const b = stack.pop();
        let aValue = a instanceof Variable ? a.getValue() : a;
        let bValue = b instanceof Variable ? b.getValue() : b;
        aValue = coerceTypes(a, b, aValue, bValue);
        stack.push(aValue !== bValue);
        break;
      }
      // >
      case 10: {
        const a = stack.pop();
        const b = stack.pop();
        let aValue = a instanceof Variable ? a.getValue() : a;
        let bValue = b instanceof Variable ? b.getValue() : b;
        aValue = coerceTypes(a, b, aValue, bValue);
        stack.push(bValue > aValue);
        break;
      }
      // >=
      case 11: {
        const a = stack.pop();
        const b = stack.pop();
        let aValue = a instanceof Variable ? a.getValue() : a;
        let bValue = b instanceof Variable ? b.getValue() : b;
        aValue = coerceTypes(a, b, aValue, bValue);
        stack.push(bValue >= aValue);
        break;
      }
      // <
      case 12: {
        const a = stack.pop();
        const b = stack.pop();
        let aValue = a instanceof Variable ? a.getValue() : a;
        let bValue = b instanceof Variable ? b.getValue() : b;
        aValue = coerceTypes(a, b, aValue, bValue);
        stack.push(bValue < aValue);
        break;
      }
      // <=
      case 13: {
        const a = stack.pop();
        const b = stack.pop();
        let aValue = a instanceof Variable ? a.getValue() : a;
        let bValue = b instanceof Variable ? b.getValue() : b;
        aValue = coerceTypes(a, b, aValue, bValue);
        stack.push(bValue <= aValue);
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
        const aValue = a instanceof Variable ? a.getValue() : a;
        b.setValue(aValue);
        stack.push(aValue);
        break;
      }
      // postinc
      case 56: {
        const a = stack.pop();
        const aValue = a.getValue();
        a.setValue(aValue + 1);
        stack.push(aValue);
        break;
      }
      // postdec
      case 57: {
        const a = stack.pop();
        const aValue = a.getValue();
        a.setValue(aValue - 1);
        stack.push(aValue);
        break;
      }
      // preinc
      case 58: {
        const a = stack.pop();
        const aValue = a.getValue() + 1;
        a.setValue(aValue);
        stack.push(aValue);
        break;
      }
      // predec
      case 59: {
        const a = stack.pop();
        const aValue = a.getValue() - 1;
        a.setValue(aValue);
        stack.push(aValue);
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
        let bValue = b instanceof Variable ? b.getValue() : b;
        if (b.type === 'FLOAT' || b.type === 'DOUBLE') {
          bValue = Math.floor(bValue);
        }
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
      // ! (not)
      case 74: {
        const a = stack.pop();
        const aValue = a instanceof Variable ? a.getValue() : a;
        stack.push(aValue ? 0 : 1);
        break;
      }
      // - (negative)
      case 76: {
        const a = stack.pop();
        const aValue = a instanceof Variable ? a.getValue() : a;
        stack.push(-aValue);
        break;
      }
      // logAnd (&&)
      case 80: {
        const a = stack.pop();
        const aValue = a instanceof Variable ? a.getValue() : a;
        if (!aValue) {
          stack.push(false);
          break;
        }

        const b = stack.pop();
        const bValue = b instanceof Variable ? b.getValue() : b;
        stack.push(!!bValue);
        break;
      }
      // logOr ||
      case 81: {
        const a = stack.pop();
        const aValue = a instanceof Variable ? a.getValue() : a;
        if (aValue) {
          stack.push(true);
          break;
        }

        const b = stack.pop();
        const bValue = b instanceof Variable ? b.getValue() : b;
        stack.push(!!bValue);
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
