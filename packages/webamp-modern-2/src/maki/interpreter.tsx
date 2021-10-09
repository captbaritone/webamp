import { V, Variable } from "./v";
import { assert, assume } from "../utils";
import { ParsedMaki, Command, Method } from "./parser";
import { getClass, getMethod } from "./objects";
import { classResolver } from "../skin/resolver";

function validateMaki(program: ParsedMaki) {
  /*
  for (const v of program.variables) {
    validateVariable(v);
  }
  */
  return; // Comment this out to get warnings about missing methods
  for (const method of program.methods) {
    if (method.name.startsWith("on")) {
      continue;
    }
    const guid = program.classes[method.typeOffset];
    const methodDefinition = getMethod(guid, method.name);
    const klass = classResolver(guid);
    const impl = klass.prototype[method.name];
    if (!impl) {
      const classDefinition = getClass(guid);
      console.warn(`Expected to find ${classDefinition.name}.${method.name}`);
    } else if (impl.length != methodDefinition.parameters.length) {
      throw new Error("Arity Error");
    }
  }
}

export function interpret(
  start: number,
  program: ParsedMaki,
  stack: Variable[],
  classResolver: (guid: string) => any
) {
  validateMaki(program);
  const interpreter = new Interpreter(program, classResolver);
  interpreter.stack = stack;
  return interpreter.interpret(start);
}

function validateVariable(v: Variable) {
  if (v.type === "OBJECT" && typeof v.value !== "object") {
    debugger;
  }
}

class Interpreter {
  stack: Variable[];
  callStack: number[];
  classes: string[];
  variables: Variable[];
  methods: Method[];
  commands: Command[];
  debug: boolean = false;
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
    /*
    for (const v of this.variables) {
      validateVariable(v);
    }
    */
  }

  push(variable: Variable) {
    this.stack.push(variable);
  }

  interpret(start: number) {
    for (const v of this.variables) {
      validateVariable(v);
    }
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
          this.push(this.variables[offsetIntoVariables]);
          break;
        }
        // pop
        case 2: {
          this.stack.pop();
          break;
        }
        // popTo
        case 3: {
          const a = this.stack.pop();
          const offsetIntoVariables = command.arg;
          const current = this.variables[offsetIntoVariables];
          assume(
            typeof a.value === typeof current.value || current.value == null,
            `Assigned from one type to a different type ${typeof a.value}, ${typeof current.value}.`
          );

          current.value = a.value;
          break;
        }
        // ==
        case 8: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          assume(
            typeof a.value == typeof b.value,
            `Tried to compare a ${a.type} to a ${b.type}.`
          );
          const result = V.newInt(b.value === a.value);
          this.push(result);
          break;
        }
        // !=
        case 9: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          /* It's fine to compare objects to null
          assume(
            a.type == b.type,
            `Tried to compare a ${a.type} to a ${b.type}.`
          );
          */
          const result = V.newInt(b.value !== a.value);
          this.push(result);
          break;
        }
        // >
        case 10: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOLEAN":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          switch (b.type) {
            case "STRING":
            case "OBJECT":
            case "BOOLEAN":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          if (this.debug) {
            console.log(`${b.value} > ${a.value}`);
          }
          this.push(V.newInt(b.value > a.value));
          break;
        }
        // >=
        case 11: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOLEAN":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          switch (b.type) {
            case "STRING":
            case "OBJECT":
            case "BOOLEAN":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          if (this.debug) {
            console.log(`${b.value} >= ${a.value}`);
          }
          this.push(V.newInt(b.value >= a.value));
          break;
          break;
        }
        // <
        case 12: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOLEAN":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          switch (b.type) {
            case "STRING":
            case "OBJECT":
            case "BOOLEAN":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          if (this.debug) {
            console.log(`${b.value} < ${a.value}`);
          }

          this.push(V.newInt(b.value < a.value));
          break;
        }
        // <=
        case 13: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOLEAN":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          switch (b.type) {
            case "STRING":
            case "OBJECT":
            case "BOOLEAN":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          if (this.debug) {
            console.log(`${b.value} < ${a.value}`);
          }

          this.push(V.newInt(b.value <= a.value));
          break;
        }
        // jumpIf
        case 16: {
          const value = this.stack.pop();
          // This seems backwards. Seems like we're doing a "jump if not"
          if (value.value) {
            break;
          }
          ip = command.arg - 1;
          break;
        }
        // jumpIfNot
        case 17: {
          const value = this.stack.pop();
          // This seems backwards. Same as above
          if (!value.value) {
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
          let argCount: number = klass.prototype[methodName].length;

          const methodDefinition = getMethod(guid, methodName);
          assert(
            argCount === (methodDefinition.parameters.length ?? 0),
            `Arg count mismatch. Expected ${
              methodDefinition.parameters.length ?? 0
            } arguments, but found ${argCount} for ${klass.name}.${methodName}`
          );

          const methodArgs = [];
          while (argCount--) {
            const a = this.stack.pop();
            methodArgs.push(a.value);
          }
          const obj = this.stack.pop();
          assert(
            (obj.type === "OBJECT" && typeof obj.value) === "object" &&
              obj.value != null,
            `Guru Meditation: Tried to call method ${klass.name}.${methodName} on null object`
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
          if (returnType === "BOOLEAN") {
            assert(typeof value === "boolean", "BOOL should return a boolean");
            value = value ? 1 : 0;
          }
          if (returnType === "OBJECT") {
            assert(
              typeof value === "object",
              `Expected the returned value of ${klass.name}.${methodName} to be an object, but it was "${value}"`
            );
          }
          if (this.debug) {
            console.log(`Calling method ${methodName}`);
          }
          this.push({ type: returnType, value } as any);
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
          // assume(false, "OPCODE: complete");
          break;
        }
        // mov
        case 48: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          /*
          assume(
            a.type === b.type,
            `Type mismatch: ${a.type} != ${b.type} at ip: ${ip}`
          );
          */
          b.value = a.value;
          this.push(a);
          break;
        }
        // postinc
        case 56: {
          const a = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOLEAN":
            case "NULL":
              throw new Error("Tried to increment a non-number.");
          }
          const aValue = a.value;
          a.value = aValue + 1;
          this.push({ type: a.type, value: aValue });
          break;
        }
        // postdec
        case 57: {
          const a = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOLEAN":
            case "NULL":
              throw new Error("Tried to decrement a non-number.");
          }
          const aValue = a.value;
          a.value = aValue - 1;
          this.push({ type: a.type, value: aValue });
          break;
        }
        // preinc
        case 58: {
          const a = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOLEAN":
            case "NULL":
              throw new Error("Tried to increment a non-number.");
          }
          a.value++;
          this.push(a);
          break;
        }
        // predec
        case 59: {
          const a = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOLEAN":
            case "NULL":
              throw new Error("Tried to increment a non-number.");
          }
          a.value--;
          this.push(a);
          break;
        }
        // + (add)
        case 64: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          switch (a.type) {
            case "OBJECT":
            case "BOOLEAN":
            case "NULL":
              throw new Error(
                `Tried to add non-numbers: ${b.type} + ${a.type}.`
              );
            case "STRING":
              if (b.type !== "STRING") {
                throw new Error(
                  `Tried to add string and a non-string: ${b.type} + ${a.type}.`
                );
              }
          }
          switch (b.type) {
            case "OBJECT":
            case "BOOLEAN":
              throw new Error("Tried to add non-numbers.");
          }
          // TODO: Do we need to round the value if INT?
          this.push({ type: a.type, value: b.value + a.value });
          break;
        }
        // - (subtract)
        case 65: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOLEAN":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          switch (b.type) {
            case "STRING":
            case "OBJECT":
            case "BOOLEAN":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          // TODO: Do we need to round the value if INT?
          this.push({ type: a.type, value: b.value - a.value });
          break;
        }
        // * (multiply)
        case 66: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOLEAN":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          switch (b.type) {
            case "STRING":
            case "OBJECT":
            case "BOOLEAN":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          // TODO: Do we need to round the value if INT?
          this.push({ type: a.type, value: b.value * a.value });
          break;
        }
        // / (divide)
        case 67: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOLEAN":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          switch (b.type) {
            case "STRING":
            case "OBJECT":
            case "BOOLEAN":
              throw new Error("Tried to add non-numbers.");
          }
          // TODO: Do we need to round the value if INT?
          this.push({ type: a.type, value: b.value / a.value });
          break;
        }
        // % (mod)
        case 68: {
          const a = this.stack.pop();
          const b = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOLEAN":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          switch (b.type) {
            case "STRING":
            case "OBJECT":
            case "BOOLEAN":
              throw new Error("Tried to add non-numbers.");
            // Need to coerce LHS if not int, RHS is always int (enforced by compiler)
            case "FLOAT":
            case "DOUBLE":
              const value = Math.floor(b.value) % a.value;
              this.push({ type: a.type, value });
              break;
            case "INT":
              this.push({ type: a.type, value: b.value % a.value });
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
          this.push(V.newInt(!a.value));
          break;
        }
        // - (negative)
        case 76: {
          const a = this.stack.pop();
          switch (a.type) {
            case "STRING":
            case "OBJECT":
            case "BOOLEAN":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          this.push({ type: a.type, value: -a.value });
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
            case "BOOLEAN":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          switch (b.type) {
            case "STRING":
            case "OBJECT":
            case "BOOLEAN":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          if (b.value && a.value) {
            this.push(a);
          } else {
            this.push(b);
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
            case "BOOLEAN":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          switch (b.type) {
            case "STRING":
            case "OBJECT":
            case "BOOLEAN":
            case "NULL":
              throw new Error("Tried to add non-numbers.");
          }
          if (b.value) {
            this.push(b);
          } else {
            this.push(a);
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
          this.push({ type: "OBJECT", value: klassInst });
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
      /*
      for (const v of this.variables) {
        validateVariable(v);
      }
      */
    }
  }
}
