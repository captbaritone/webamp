import Variable from "./variable";
import { isPromise, unimplementedWarning } from "../utils";

export function interpret(start, program) {
  const interpreter = new Interpreter(program);
  return interpreter.interpret(start);
}

class Interpreter {
  constructor(program) {
    const { commands, methods, variables, classes } = program;
    this.commands = commands;
    this.methods = methods;
    this.variables = variables;
    this.classes = classes;

    this.stack = [];
    this.callStack = [];
  }

  interpret(start) {
    // Instruction Pointer
    let ip = start;
    while (ip < this.commands.length) {
      const command = this.commands[ip];

      switch (command.opcode) {
        // push
        case 1: {
          const offsetIntoVariables = command.arg;
          this.stack.push(this.variables[offsetIntoVariables]);
          break;
        }
        // pop
        case 2: {
          this.stack.pop();
          break;
        }
        // popTo
        case 3: {
          const aValue = this.popStackValue();
          const offsetIntoVariables = command.arg;
          const toVar = this.variables[offsetIntoVariables];
          toVar.setValue(aValue);
          break;
        }
        // ==
        case 8: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          switch (a.type) {
            case "INT":
            case "FLOAT":
            case "DOUBLE":
            case "BOOLEAN": {
              break;
            }
            case "STRING": {
              break;
            }
            default:
              throw new Error(`Unexpected type: ${a}`);
          }
          let aValue = this.getValue(a);
          const bValue = this.getValue(b);

          aValue = this.coerceTypes__DEPRECATED(a, b);
          const result = Variable.newInt(bValue === aValue);
          this.stack.push(result);
          break;
        }
        // !=
        case 9: {
          this.twoArgCoercingOperator((b, a) => b !== a);
          break;
        }
        // >
        case 10: {
          this.twoArgCoercingOperator((b, a) => b > a);
          break;
        }
        // >=
        case 11: {
          this.twoArgCoercingOperator((b, a) => b >= a);
          break;
        }
        // <
        case 12: {
          this.twoArgCoercingOperator((b, a) => b < a);
          break;
        }
        // <=
        case 13: {
          this.twoArgCoercingOperator((b, a) => b <= a);
          break;
        }
        // jumpIf
        case 16: {
          const value = this.popStackValue();
          // This seems backwards. Seems like we're doing a "jump if not"
          if (value) {
            break;
          }
          ip = command.arg - 1;
          break;
        }
        // jumpIfNot
        case 17: {
          const value = this.popStackValue();
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
          const method = this.methods[methodOffset];
          let methodName = method.name;
          const classesOffset = method.typeOffset;
          methodName = methodName.toLowerCase();

          const klass = this.classes[classesOffset];
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
            const aValue = this.popStackValue();
            methodArgs.push(aValue);
          }
          const obj = this.popStackValue();
          let value = obj[methodName](...methodArgs);
          if (isPromise(value)) {
            throw new Error("Did not expect maki method to return promise");
          }
          if (value === null) {
            // variables[1] holds global NULL value
            value = this.variables[1];
          }
          this.stack.push(value);
          break;
        }
        // callGlobal
        case 25: {
          this.callStack.push(ip);
          const offset = command.arg;

          ip = offset - 1; // -1 because we ++ after the switch
          break;
        }
        // return
        case 33: {
          ip = this.callStack.pop();
          // TODO: Stack protection?
          break;
        }
        // complete
        case 40: {
          // noop for now
          unimplementedWarning("OPCODE: complete");
          break;
        }
        // mov
        case 48: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          let aValue = a instanceof Variable ? a.getValue() : a;
          if (b.type === "INT") {
            aValue = Math.floor(aValue);
          }
          b.setValue(aValue);
          this.stack.push(aValue);
          break;
        }
        // postinc
        case 56: {
          const a = this.stack.pop();
          const aValue = a.getValue();
          a.setValue(aValue + 1);
          this.stack.push(aValue);
          break;
        }
        // postdec
        case 57: {
          const a = this.stack.pop();
          const aValue = a.getValue();
          a.setValue(aValue - 1);
          this.stack.push(aValue);
          break;
        }
        // preinc
        case 58: {
          const a = this.stack.pop();
          const aValue = a.getValue() + 1;
          a.setValue(aValue);
          this.stack.push(aValue);
          break;
        }
        // predec
        case 59: {
          const a = this.stack.pop();
          const aValue = a.getValue() - 1;
          a.setValue(aValue);
          this.stack.push(aValue);
          break;
        }
        // + (add)
        case 64: {
          this.twoArgOperator((b, a) => b + a);
          break;
        }
        // - (subtract)
        case 65: {
          this.twoArgOperator((b, a) => b - a);
          break;
        }
        // * (multiply)
        case 66: {
          this.twoArgOperator((b, a) => b * a);
          break;
        }
        // / (divide)
        case 67: {
          this.twoArgOperator((b, a) => b / a);
          break;
        }
        // % (mod)
        case 68: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          const aValue = a instanceof Variable ? a.getValue() : a;
          let bValue = b instanceof Variable ? b.getValue() : b;
          // Need to coerce LHS if not int, RHS is always int (enforced by compiler)
          if (b.type === "FLOAT" || b.type === "DOUBLE") {
            bValue = Math.floor(bValue);
          }
          this.stack.push(bValue % aValue);
          break;
        }
        // & (binary and)
        case 72: {
          this.twoArgOperator((b, a) => b & a);
          break;
        }
        // | (binary or)
        case 73: {
          this.twoArgOperator((b, a) => b | a);
          break;
        }
        // ! (not)
        case 74: {
          const aValue = this.popStackValue();
          this.stack.push(aValue ? 0 : 1);
          break;
        }
        // - (negative)
        case 76: {
          const aValue = this.popStackValue();
          this.stack.push(-aValue);
          break;
        }
        // logAnd (&&)
        case 80: {
          this.twoArgOperator((b, a) => b && a);
          break;
        }
        // logOr ||
        case 81: {
          this.twoArgOperator((b, a) => b || a);
          break;
        }
        // <<
        case 88: {
          this.twoArgOperator((b, a) => b << a);
          break;
        }
        // >>
        case 89: {
          this.twoArgOperator((b, a) => b >> a);
          break;
        }
        // new
        case 96: {
          const classesOffset = command.arg;
          const Klass = this.classes[classesOffset];
          const system = this.variables[0].getValue();
          const klassInst = new Klass(null, system.getscriptgroup());
          this.stack.push(klassInst);
          break;
        }
        // delete
        case 97: {
          const aValue = this.popStackValue();
          aValue.js_delete();
          break;
        }
        default:
          throw new Error(`Unhandled opcode ${command.opcode}`);
      }

      ip++;
    }
  }

  getValue(v) {
    return v instanceof Variable ? v.getValue() : v;
  }

  popStackValue() {
    const v = this.stack.pop();
    return this.getValue(v);
  }

  twoArgCoercingOperator(operator) {
    const a = this.stack.pop();
    const b = this.stack.pop();
    let aValue = this.getValue(a);
    const bValue = this.getValue(b);

    aValue = this.coerceTypes__DEPRECATED(a, b);
    this.stack.push(operator(bValue, aValue));
  }

  twoArgOperator(operator) {
    const aValue = this.popStackValue();
    const bValue = this.popStackValue();

    this.stack.push(operator(bValue, aValue));
  }

  coerceTypes__DEPRECATED(var1, var2) {
    if (var2.type === "INT") {
      if (var1.type === "FLOAT" || var1.type === "DOUBLE") {
        return Math.floor(this.getValue(var1));
      }
    }

    return this.getValue(var1);
  }
}
