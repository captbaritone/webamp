import Variable from "./variable";
import { isPromise, unimplementedWarning } from "../utils";

function coerceTypes(var1, var2, val1 /* val2 */) {
  if (var2.type === "INT") {
    if (var1.type === "FLOAT" || var1.type === "DOUBLE") {
      return Math.floor(val1);
    }
  }

  return val1;
}

// Note: We implement `interpret` as a generator in order to support pausing
// execution in the debugger. This allows the caller granular control over the
// execution timing of the virtual machine while also allowing the VM to divulge
// some of its internal state before each command is exectued.
//
// In "production" we syncrnously call `.next()` on the generator until it's
// empty, ignoring all yeilded values. In the debugger we use the yielded data
// to populate the UI, and -- when stepping -- pause execution by waiting
// between calls to `.next()`.
export function* interpret(start, program, stack = []) {
  const { commands, methods, variables, classes } = program;

  function popStackValue() {
    const v = stack.pop();
    return v instanceof Variable ? v.getValue() : v;
  }

  function twoArgCoercingOperator(operator) {
    const a = stack.pop();
    const b = stack.pop();
    let aValue = a instanceof Variable ? a.getValue() : a;
    const bValue = b instanceof Variable ? b.getValue() : b;

    aValue = coerceTypes(a, b, aValue, bValue);
    stack.push(operator(bValue, aValue));
  }

  function twoArgOperator(operator) {
    const aValue = popStackValue();
    const bValue = popStackValue();

    stack.push(operator(bValue, aValue));
  }

  // Instruction Pointer
  let ip = start;
  while (ip < commands.length) {
    const command = commands[ip];
    // This probably incurrs some perf cost. If it does, we can pass in a flag
    // to enable it only when we are debugging. When we are not, (in prod) we
    // can just jump right over it and we will execute straight through to the
    // return value on the first call to `.next()`.
    yield { i: ip, command, stack, variables, commands };

    switch (command.opcode) {
      // push
      case 1: {
        const offsetIntoVariables = command.arg;
        stack.push(variables[offsetIntoVariables]);
        break;
      }
      // pop
      case 2: {
        stack.pop();
        break;
      }
      // popTo
      case 3: {
        const aValue = popStackValue();
        const offsetIntoVariables = command.arg;
        const toVar = variables[offsetIntoVariables];
        toVar.setValue(aValue);
        break;
      }
      // ==
      case 8: {
        twoArgCoercingOperator((b, a) => b === a);
        break;
      }
      // !=
      case 9: {
        twoArgCoercingOperator((b, a) => b !== a);
        break;
      }
      // >
      case 10: {
        twoArgCoercingOperator((b, a) => b > a);
        break;
      }
      // >=
      case 11: {
        twoArgCoercingOperator((b, a) => b >= a);
        break;
      }
      // <
      case 12: {
        twoArgCoercingOperator((b, a) => b < a);
        break;
      }
      // <=
      case 13: {
        twoArgCoercingOperator((b, a) => b <= a);
        break;
      }
      // jumpIf
      case 16: {
        const value = popStackValue();
        // This seems backwards. Seems like we're doing a "jump if not"
        if (value) {
          break;
        }
        ip = command.arg - 1;
        break;
      }
      // jumpIfNot
      case 17: {
        const value = popStackValue();
        // This seems backwards. Same as above
        if (!value) {
          break;
        }
        ip = command.arg - 1;
        break;
      }
      // jump
      case 18: {
        ip = command.arg - 1;
        break;
      }
      // call
      // strangeCall (seems to behave just like regular call)
      case 24:
      case 112: {
        const methodOffset = command.arg;
        const method = methods[methodOffset];
        let methodName = method.name;
        const classesOffset = method.typeOffset;
        methodName = methodName.toLowerCase();

        const klass = classes[classesOffset];
        if (!klass) {
          throw new Error("Need to add a missing class to runtime");
        }
        // This is a bit awkward. Because the variables are stored on the stack
        // before the object, we have to find the number of arguments without
        // actually having access to the object instance.
        if (!klass.prototype[methodName]) {
          throw new Error(
            `Need to add missing function (${methodName}) to ${klass.name}`
          );
        }
        let argCount = klass.prototype[methodName].length;

        const methodArgs = [];
        while (argCount--) {
          const aValue = popStackValue();
          methodArgs.push(aValue);
        }
        const obj = popStackValue();
        const ret = obj[methodName](...methodArgs);
        let value;
        if (isPromise(ret)) {
          value = yield ret;
        } else {
          value = ret;
        }
        if (value === null) {
          // variables[1] holds global NULL value
          value = variables[1];
        }
        stack.push(value);
        break;
      }
      // callGlobal
      case 25: {
        const offset = command.arg;
        // Note: We proxy all yielded values from the child `interpret` out to
        // the caller, while capturing the return value, (`value`) for use within the
        // VM.
        const value = yield* interpret(offset, program, stack);
        stack.push(value);
        break;
      }
      // return
      case 33: {
        const aValue = popStackValue();
        return aValue;
      }
      // complete
      case 40: {
        // noop for now
        unimplementedWarning("OPCODE: complete");
        break;
      }
      // mov
      case 48: {
        const a = stack.pop();
        const b = stack.pop();
        let aValue = a instanceof Variable ? a.getValue() : a;
        if (b.type === "INT") {
          aValue = Math.floor(aValue);
        }
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
        twoArgOperator((b, a) => b + a);
        break;
      }
      // - (subtract)
      case 65: {
        twoArgOperator((b, a) => b - a);
        break;
      }
      // * (multiply)
      case 66: {
        twoArgOperator((b, a) => b * a);
        break;
      }
      // / (divide)
      case 67: {
        twoArgOperator((b, a) => b / a);
        break;
      }
      // % (mod)
      case 68: {
        const a = stack.pop();
        const b = stack.pop();
        const aValue = a instanceof Variable ? a.getValue() : a;
        let bValue = b instanceof Variable ? b.getValue() : b;
        // Need to coerce LHS if not int, RHS is always int (enforced by compiler)
        if (b.type === "FLOAT" || b.type === "DOUBLE") {
          bValue = Math.floor(bValue);
        }
        stack.push(bValue % aValue);
        break;
      }
      // & (binary and)
      case 72: {
        twoArgOperator((b, a) => b & a);
        break;
      }
      // | (binary or)
      case 73: {
        twoArgOperator((b, a) => b | a);
        break;
      }
      // ! (not)
      case 74: {
        const aValue = popStackValue();
        stack.push(aValue ? 0 : 1);
        break;
      }
      // - (negative)
      case 76: {
        const aValue = popStackValue();
        stack.push(-aValue);
        break;
      }
      // logAnd (&&)
      case 80: {
        twoArgOperator((b, a) => b && a);
        break;
      }
      // logOr ||
      case 81: {
        twoArgOperator((b, a) => b || a);
        break;
      }
      // <<
      case 88: {
        twoArgOperator((b, a) => b << a);
        break;
      }
      // >>
      case 89: {
        twoArgOperator((b, a) => b >> a);
        break;
      }
      // new
      case 96: {
        const classesOffset = command.arg;
        const Klass = classes[classesOffset];
        const system = variables[0].getValue();
        const klassInst = new Klass(null, system.getscriptgroup());
        stack.push(klassInst);
        break;
      }
      // delete
      case 97: {
        const aValue = popStackValue();
        aValue.js_delete();
        break;
      }
      default:
        throw new Error(`Unhandled opcode ${command.opcode}`);
    }

    ip++;
  }
}
