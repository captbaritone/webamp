import { V, Variable } from "./v";
import { assert, assume } from "../utils";
import { ParsedMaki, Command, Method } from "./parser";

export function interpret(
  start: number,
  program: ParsedMaki,
  classResolver: (guid: string) => any
) {
  const interpreter = new Interpreter(program, classResolver);
  return interpreter.interpret(start);
}

class Interpreter {
  stack: Variable[];
  callStack: number[];
  classes: string[];
  variables: Variable[];
  methods: Method[];
  commands: Command[];
  debug: boolean;
  classResolver: (guid: string) => any;
  constructor(program: ParsedMaki, classResolver: (guid: string) => any) {
    const { commands, methods, variables, classes } = program;
    this.classResolver = classResolver;
    this.commands = commands;
    this.methods = methods;
    this.variables = variables;
    this.classes = classes;

    this.stack = [];
    this.callStack = [];
    this.debug = false;
  }

  interpret(start: number) {
    // Instruction Pointer
    let ip = start;
    while (ip < this.commands.length) {
      const command = this.commands[ip];
      if (this.debug) {
        console.log(command);
      }

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
          const aValue = this.stack.pop();
          const offsetIntoVariables = command.arg;
          const current = this.variables[offsetIntoVariables];
          assume(
            aValue.type === current.type,
            "Assigned from one type to a different type."
          );

          current.value = aValue.value;
          break;
        }
        // ==
        case 8: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          assume(
            a.type == b.type,
            `Tried to compare a ${a.type} to a ${b.type}.`
          );
          const result = V.newInt(b.value === a.value);
          this.stack.push(result);
          break;
        }
        // !=
        case 9: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          assume(
            a.type == b.type,
            `Tried to compare a ${a.type} to a ${b.type}.`
          );
          const result = V.newInt(b.value !== a.value);
          this.stack.push(result);
          break;
        }
        // >
        case 10: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOL":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          switch (b.type) {
            case "STRING":
            case "OBJECT":
            case "BOOL":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          if (this.debug) {
            console.log(`${b.value} > ${a.value}`);
          }
          this.stack.push(V.newInt(b.value > a.value));
          break;
        }
        // >=
        case 11: {
          assume(false, "Unimplimented >= operator");
          break;
        }
        // <
        case 12: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOL":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          switch (b.type) {
            case "STRING":
            case "OBJECT":
            case "BOOL":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          if (this.debug) {
            console.log(`${b.value} < ${a.value}`);
          }

          this.stack.push(V.newInt(b.value < a.value));
          break;
        }
        // <=
        case 13: {
          assume(false, "Unimplimented <= operator");
          break;
        }
        // jumpIf
        case 16: {
          const value = this.stack.pop();
          // This seems backwards. Seems like we're doing a "jump if not"
          if (value) {
            break;
          }
          ip = command.arg - 1;
          break;
        }
        // jumpIfNot
        case 17: {
          const value = this.stack.pop();
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
          const returnType = method.returnType;
          const classesOffset = method.typeOffset;
          methodName = methodName.toLowerCase();

          const guid = this.classes[classesOffset];
          const klass = this.classResolver(guid);
          if (!klass) {
            throw new Error("Need to add a missing class to runtime");
          }
          // This is a bit awkward. Because the variables are stored on the stack
          // before the object, we have to find the number of arguments without
          // actually having access to the object instance.
          if (!klass.prototype[methodName]) {
            throw new Error(
              `Need to add missing method: ${klass.name}.${methodName}: ${returnType}`
            );
          }
          let argCount = klass.prototype[methodName].length;

          const methodArgs = [];
          while (argCount--) {
            const a = this.stack.pop();
            methodArgs.push(a.value);
          }
          const obj = this.stack.pop();
          assert(
            obj.type === "OBJECT",
            "Tried to call a method on a primitive."
          );
          let value = obj.value[methodName](...methodArgs);
          if (value === undefined && returnType !== "NULL") {
            throw new Error(
              `Did not expect ${klass.name}.${methodName}: ${returnType} to return undefined`
            );
          }
          if (value === null) {
            // variables[1] holds global NULL value
            value = this.variables[1];
          }
          if (this.debug) {
            console.log(`Calling method ${methodName}`);
          }
          this.stack.push({ type: returnType, value } as any);
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
          assume(false, "OPCODE: complete");
          break;
        }
        // mov
        case 48: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          assume(
            a.type === b.type,
            `Type mismatch: ${a.type} != ${b.type} at ip: ${ip}`
          );
          b.value = a.value;
          this.stack.push(a);
          break;
        }
        // postinc
        case 56: {
          const a = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOL":
            case "NULL":
              throw new Error("Tried to increment a non-number.");
          }
          const aValue = a.value;
          a.value = aValue + 1;
          this.stack.push({ type: a.type, value: aValue });
          break;
        }
        // postdec
        case 57: {
          const a = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOL":
            case "NULL":
              throw new Error("Tried to decrement a non-number.");
          }
          const aValue = a.value;
          a.value = aValue - 1;
          this.stack.push({ type: a.type, value: aValue });
          break;
        }
        // preinc
        case 58: {
          const a = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOL":
            case "NULL":
              throw new Error("Tried to increment a non-number.");
          }
          a.value++;
          this.stack.push(a);
          break;
        }
        // predec
        case 59: {
          const a = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOL":
            case "NULL":
              throw new Error("Tried to increment a non-number.");
          }
          a.value--;
          this.stack.push(a);
          break;
        }
        // + (add)
        case 64: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOL":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          switch (b.type) {
            case "STRING":
            case "OBJECT":
            case "BOOL":
              throw new Error("Tried to add non-numbers.");
          }
          // TODO: Do we need to round the value if INT?
          this.stack.push({ type: a.type, value: b.value + a.value });
          break;
        }
        // - (subtract)
        case 65: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOL":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          switch (b.type) {
            case "STRING":
            case "OBJECT":
            case "BOOL":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          // TODO: Do we need to round the value if INT?
          this.stack.push({ type: a.type, value: b.value - a.value });
          break;
        }
        // * (multiply)
        case 66: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOL":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          switch (b.type) {
            case "STRING":
            case "OBJECT":
            case "BOOL":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          // TODO: Do we need to round the value if INT?
          this.stack.push({ type: a.type, value: b.value * a.value });
          break;
        }
        // / (divide)
        case 67: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOL":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          switch (b.type) {
            case "STRING":
            case "OBJECT":
            case "BOOL":
              throw new Error("Tried to add non-numbers.");
          }
          // TODO: Do we need to round the value if INT?
          this.stack.push({ type: a.type, value: b.value / a.value });
          break;
        }
        // % (mod)
        case 68: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOL":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          switch (b.type) {
            case "STRING":
            case "OBJECT":
            case "BOOL":
              throw new Error("Tried to add non-numbers.");
            // Need to coerce LHS if not int, RHS is always int (enforced by compiler)
            case "FLOAT":
            case "DOUBLE":
              const value = Math.floor(b.value) % a.value;
              this.stack.push({ type: a.type, value });
              break;
            case "INT":
              this.stack.push({ type: a.type, value: b.value % a.value });
              break;
          }
          break;
        }
        // & (binary and)
        case 72: {
          assume(false, "Unimplimented & operator");
          break;
        }
        // | (binary or)
        case 73: {
          assume(false, "Unimplimented | operator");
          break;
        }
        // ! (not)
        case 74: {
          const a = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
              throw new Error("Tried ! a string or object.");
          }
          this.stack.push(V.newInt(!a.value));
          break;
        }
        // - (negative)
        case 76: {
          const a = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOL":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          this.stack.push({ type: a.type, value: -a.value });
          break;
        }
        // logAnd (&&)
        case 80: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          // Some of these are probably valid, but we'll enable them once we see usage.
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOL":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          switch (b.type) {
            case "STRING":
            case "OBJECT":
            case "BOOL":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          if (b.value && a.value) {
            this.stack.push(a);
          } else {
            this.stack.push(b);
          }
          break;
        }
        // logOr ||
        case 81: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          // Some of these are probably valid, but we'll enable them once we see usage.
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOL":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          switch (b.type) {
            case "STRING":
            case "OBJECT":
            case "BOOL":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          if (b.value) {
            this.stack.push(b);
          } else {
            this.stack.push(a);
          }
          break;
        }
        // <<
        case 88: {
          assume(false, "Unimplimented << operator");
          break;
        }
        // >>
        case 89: {
          assume(false, "Unimplimented >> operator");
          break;
        }
        // new
        case 96: {
          const classesOffset = command.arg;
          const guid = this.classes[classesOffset];
          const Klass = this.classResolver(guid);
          const klassInst = new Klass();
          this.stack.push({ type: "OBJECT", value: klassInst });
          break;
        }
        // delete
        case 97: {
          const aValue = this.stack.pop();
          // TODO: Cleanup the object?
          break;
        }
        default:
          throw new Error(`Unhandled opcode ${command.opcode}`);
      }

      ip++;
    }
  }
}
