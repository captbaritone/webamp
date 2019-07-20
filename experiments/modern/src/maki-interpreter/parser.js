const { COMMANDS } = require("./constants");
const Variable = require("./variable");
const MAGIC = "FG";

const PRIMITIVE_TYPES = {
  5: "BOOLEAN",
  2: "INT",
  3: "FLOAT",
  4: "DOUBLE",
  6: "STRING",
};

// Holds a buffer and a pointer. Consumers can consume bytesoff the end of the
// file. When we want to run in the browser, we can refactor this class to use a
// typed array: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays
class MakiFile {
  constructor(data) {
    this._arr = new Uint8Array(data);
    this._i = 0;
  }

  readUInt32LE() {
    const int = this.peekUInt32LE();
    this._i += 4;
    return int;
  }

  peekUInt32LE() {
    const offset = this._i >>> 0;

    return (
      (this._arr[offset] |
        (this._arr[offset + 1] << 8) |
        (this._arr[offset + 2] << 16)) +
      this._arr[offset + 3] * 0x1000000
    );
  }

  readUInt16LE() {
    const offset = this._i >>> 0;
    this._i += 2;
    return this._arr[offset] | (this._arr[offset + 1] << 8);
  }

  readUInt8() {
    const int = this._arr[this._i];
    this._i++;
    return int;
  }

  readStringOfLength(length) {
    let ret = "";
    const end = Math.min(this._arr.length, this._i + length);

    for (var i = this._i; i < end; ++i) {
      ret += String.fromCharCode(this._arr[i]);
    }
    this._i += length;
    return ret;
  }

  readString() {
    return this.readStringOfLength(this.readUInt16LE());
  }

  getPosition() {
    return this._i;
  }
}

function readMagic(makiFile) {
  const magic = makiFile.readStringOfLength(MAGIC.length);
  if (magic !== MAGIC) {
    throw new Error("Magic number does not mach. Is this a maki file?");
  }
  return magic;
}

function readVersion(makiFile) {
  // No idea what we're actually expecting here.
  return makiFile.readUInt16LE();
}

function readClasses(makiFile) {
  let count = makiFile.readUInt32LE();
  const classes = [];
  while (count--) {
    let identifier = "";
    let chunks = 4;
    while (chunks--) {
      identifier += makiFile
        .readUInt32LE()
        .toString(16)
        .padStart(8, "0");
    }
    classes.push(identifier);
  }
  return classes;
}

function readMethods(makiFile) {
  let count = makiFile.readUInt32LE();
  const methods = [];
  while (count--) {
    const classCode = makiFile.readUInt16LE();
    // Offset into our parsed types
    const typeOffset = classCode & 0xff;
    // This is probably the second half of a uint32
    makiFile.readUInt16LE();
    const name = makiFile.readString();
    methods.push({ name, typeOffset });
  }
  return methods;
}

function readVariables({ makiFile, classes }) {
  let count = makiFile.readUInt32LE();
  const variables = [];
  while (count--) {
    const typeOffset = makiFile.readUInt8();
    const object = makiFile.readUInt8();
    const subClass = makiFile.readUInt16LE();
    const uinit1 = makiFile.readUInt16LE();
    const uinit2 = makiFile.readUInt16LE();
    const uinit3 = makiFile.readUInt16LE();
    const uinit4 = makiFile.readUInt16LE();
    const global = makiFile.readUInt8();
    const system = makiFile.readUInt8();

    if (object) {
      const klass = classes[typeOffset];
      if (klass == null) {
        throw new Error("Invalid type");
      }
      variables.push(new Variable({ type: klass, typeName: "OBJECT" }));
    } else if (subClass) {
      const variable = variables[typeOffset];
      if (variable == null) {
        throw new Error("Invalid type");
      }
      variables.push(new Variable({ type: variable, typeName: "SUBCLASS" }));
    } else {
      const typeName = PRIMITIVE_TYPES[typeOffset];
      if (typeName == null) {
        throw new Error("Invalid type");
      }
      let value = null;

      switch (typeName) {
        // BOOLEAN
        case PRIMITIVE_TYPES[5]:
          value = uinit1;
          break;
        // INT
        case PRIMITIVE_TYPES[2]:
          value = uinit1;
          break;
        case PRIMITIVE_TYPES[3]:
        case PRIMITIVE_TYPES[4]:
          const exponent = (uinit2 & 0xff80) >> 7;
          const mantisse = ((0x80 | (uinit2 & 0x7f)) << 16) | uinit1;
          value = mantisse * 2.0 ** (exponent - 0x96);
          break;
        case PRIMITIVE_TYPES[6]:
          // This will likely get set by constants later on.
          break;
        default:
          throw new Error("Invalid primitive type");
      }
      const variable = new Variable({ type: typeName, typeName });
      variable.setValue(value);
      variables.push(variable);
    }
  }
  return variables;
}

function readConstants({ makiFile, variables }) {
  let count = makiFile.readUInt32LE();
  while (count--) {
    const i = makiFile.readUInt32LE();
    const variable = variables[i];
    const value = makiFile.readString();
    // TODO: Don't mutate
    variable.setValue(value);
  }
}

function readBindings(makiFile) {
  let count = makiFile.readUInt32LE();
  const bindings = [];
  while (count--) {
    const variableOffset = makiFile.readUInt32LE();
    const methodOffset = makiFile.readUInt32LE();
    const binaryOffset = makiFile.readUInt32LE();
    bindings.push({ variableOffset, binaryOffset, methodOffset });
  }
  return bindings;
}

function decodeCode({ makiFile, classes, variables, methods }) {
  const length = makiFile.readUInt32LE();
  const start = makiFile.getPosition();

  const localFunctions = {};
  const commands = [];
  while (makiFile.getPosition() < start + length) {
    const pos = makiFile.getPosition() - start;
    commands.push(
      parseComand({ start, makiFile, length, pos, localFunctions })
    );
  }

  return { commands, localFunctions };
}

// TODO: Refactor this to consume bytes directly off the end of MakiFile
function parseComand({ start, makiFile, length, pos, localFunctions }) {
  const opcode = makiFile.readUInt8();
  const command = {
    offset: pos,
    start,
    pos,
    opcode,
    arg: null,
    command: COMMANDS[opcode],
  };

  if (command.command == null) {
    throw new Error(`Unknown opcode "${opcode}"`);
  }

  if (command.command.arg == null) {
    return command;
  }

  const argType = command.command.arg;
  let arg = null;
  switch (argType) {
    case "var": {
      arg = makiFile.readUInt32LE();
      break;
    }
    case "line": {
      arg = makiFile.readUInt32LE() + 5 + pos;
      break;
    }
    case "objFunc": {
      // TODO: ClassesOffset
      arg = makiFile.readUInt32LE();
      break;
    }
    case "func": {
      // Note in the perl code here: "todo, something strange going on here..."
      const variable = makiFile.readUInt32LE() + 5;
      const offset = variable + pos;
      arg = {
        name: `func${offset}`,
        code: [],
        offset,
      };
      if (localFunctions[offset] == null) {
        localFunctions[offset] = {
          function: arg,
          offset,
        };
      }
      break;
    }
    case "obj": {
      // Classes Offset
      arg = makiFile.readUInt32LE();
      break;
    }
    default:
      throw new Error("Invalid argType");
  }

  command.arg = arg;

  // From perl: look forward for a stack protection block
  // (why do I have to look FORWARD. stupid nullsoft)
  if (
    // Is there another UInt32 to read?
    length > pos + 5 + 4 &&
    makiFile.peekUInt32LE() >= 0xffff0000
  ) {
    makiFile.readUInt32LE();
  }

  // TODO: What even is this?
  if (opcode === 112) {
    makiFile.readUInt8();
  }
  return command;
}

function parse(buffer) {
  const makiFile = new MakiFile(buffer);

  const magic = readMagic(makiFile);
  // TODO: What format is this? Does it even change between compiler versions?
  // Maybe it's the std.mi version?
  const version = readVersion(makiFile);
  // Not sure what we are skipping over here. Just some UInt 32.
  // Maybe it's additional version info?
  const extraVersion = makiFile.readUInt32LE();
  const classes = readClasses(makiFile);
  const methods = readMethods(makiFile);
  const variables = readVariables({ makiFile: makiFile, classes });
  readConstants({ makiFile: makiFile, variables });
  const bindings = readBindings(makiFile);
  const { commands, localFunctions } = decodeCode({
    makiFile,
    classes,
    variables,
    methods,
  });

  // Map binary offsets to command indexes.
  // Some bindings/functions ask us to jump to a place in the binary data and
  // start executing. However, we want to do all the parsing up front, and just
  // return a list of commands. This map allows anything that mentions a binary
  // offset to find the command they should jump to.
  const offsetToCommand = {};
  commands.forEach((command, i) => {
    if (command.offset != null) {
      offsetToCommand[command.offset] = i;
    }
  });

  const resolvedBindings = bindings.map(binding => {
    return Object.assign({}, binding, {
      commandOffset: offsetToCommand[binding.binaryOffset],
      binaryOffset: undefined,
    });
  });
  return {
    magic,
    classes,
    methods,
    variables,
    bindings: resolvedBindings,
    commands,
    localFunctions,
    version,
    extraVersion,
    offsetToCommand,
  };
}

module.exports = parse;
