import { COMMANDS } from "./constants";
import { DataType, Variable } from "./v";
import MakiFile from "./MakiFile";
import { getReturnType } from "./objects";
import { assert } from "../utils";

export type Command = {
  opcode: number;
  arg: number;
};

export type Method = {
  name: string;
  typeOffset: number;
  returnType: DataType;
};

export type ParsedMaki = {
  commands: Command[];
  methods: Method[];
  variables: Variable[];
  classes: string[];
  bindings: Binding[];
  version: number;
};

export type Binding = {
  commandOffset: number;
  methodOffset: number;
  variableOffset: number;
  binaryOffset: number;
};

const MAGIC = "FG";

const PRIMITIVE_TYPES = {
  5: "BOOLEAN",
  2: "INT",
  3: "FLOAT",
  4: "DOUBLE",
  6: "STRING",
};

export function parse(data: ArrayBuffer): ParsedMaki {
  const makiFile = new MakiFile(data);

  const magic = readMagic(makiFile);
  // TODO: What format is this? Does it even change between compiler versions?
  // Maybe it's the std.mi version?
  const version = readVersion(makiFile);
  // Not sure what we are skipping over here. Just some UInt 32.
  // Maybe it's additional version info?
  const extraVersion = makiFile.readUInt32LE();
  const classes = readClasses(makiFile);
  const methods = readMethods(makiFile, classes);
  const variables = readVariables({ makiFile, classes });
  readConstants({ makiFile, variables });
  const bindings = readBindings(makiFile);
  const commands = decodeCode({ makiFile });

  // TODO: Assert that we are at the end of the maki file

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

  const resolvedBindings = bindings.map(
    (binding): Binding => {
      return Object.assign({}, binding, {
        commandOffset: offsetToCommand[binding.binaryOffset],
      });
    }
  );

  const resolvedCommands = commands.map(
    (command): Command => {
      if (command.argType === "COMMAND_OFFSET") {
        return Object.assign({}, command, {
          arg: offsetToCommand[command.arg],
        });
      }
      return command;
    }
  );
  return {
    classes,
    methods,
    variables,
    bindings: resolvedBindings,
    commands: resolvedCommands,
    version,
  };
}

// TODO: Don't depend upon COMMANDS
function opcodeToArgType(opcode: number) {
  const command = COMMANDS[opcode];
  if (command == null) {
    throw new Error(`Unknown opcode ${opcode}`);
  }

  switch (command.arg) {
    case "func":
    case "line":
      return "COMMAND_OFFSET";
    case "var":
    case "objFunc":
    case "obj":
      return "VARIABLE_OFFSET";
    default:
      return "NONE";
  }
}

function readMagic(makiFile: MakiFile): string {
  const magic = makiFile.readStringOfLength(MAGIC.length);
  if (magic !== MAGIC) {
    throw new Error(
      `Magic "${magic}" does not mach "${MAGIC}". Is this a maki file?`
    );
  }
  return magic;
}

function readVersion(makiFile: MakiFile): number {
  // No idea what we're actually expecting here.
  return makiFile.readUInt16LE();
}

function readClasses(makiFile: MakiFile): string[] {
  let count = makiFile.readUInt32LE();
  const classes = [];
  while (count--) {
    let identifier = "";
    let chunks = 4;
    while (chunks--) {
      identifier += makiFile.readUInt32LE().toString(16).padStart(8, "0");
    }
    classes.push(identifier);
  }
  return classes;
}

function readMethods(makiFile: MakiFile, classes: string[]): Method[] {
  let count = makiFile.readUInt32LE();
  const methods: Method[] = [];
  while (count--) {
    const classCode = makiFile.readUInt16LE();
    // Offset into our parsed types
    const typeOffset = classCode & 0xff;
    // This is probably the second half of a uint32
    makiFile.readUInt16LE();
    const name = makiFile.readString().toLowerCase();

    const className = classes[typeOffset];

    const returnType = getReturnType(className, name);

    methods.push({ name, typeOffset, returnType });
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
    makiFile.readUInt16LE(); // uinit3
    makiFile.readUInt16LE(); //uinit4
    const global = makiFile.readUInt8();
    makiFile.readUInt8(); // system

    if (subClass) {
      const variable = variables[typeOffset];
      if (variable == null) {
        throw new Error("Invalid type");
      }

      // assume(false, "Unimplemented subclass variable type");
      variables.push({
        type: "OBJECT",
        value: null,
        global,
        guid: variable.guid,
      });
    } else if (object) {
      const klass = classes[typeOffset];
      if (klass == null) {
        throw new Error("Invalid type");
      }
      variables.push({ type: "OBJECT", value: null, global, guid: klass });
    } else {
      const typeName = PRIMITIVE_TYPES[typeOffset];
      if (typeName == null) {
        throw new Error("Invalid type");
      }
      let value = null;

      switch (typeName) {
        // BOOL
        case PRIMITIVE_TYPES[5]:
          value = uinit1;
          assert(
            value === 1 || value === 0,
            "Expected boolean value to be initialized as zero or one"
          );
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
      const variable = {
        global,
        type: typeName,
        value,
      };
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
    // TODO: Assert this is of type string.
    const value = makiFile.readString();
    // TODO: Don't mutate
    variable.value = value;
  }
}

function readBindings(makiFile: MakiFile): Binding[] {
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

function decodeCode({ makiFile }) {
  const length = makiFile.readUInt32LE();
  const start = makiFile.getPosition();

  const commands = [];
  while (makiFile.getPosition() < start + length) {
    commands.push(parseComand({ start, makiFile, length }));
  }

  return commands;
}

// TODO: Refactor this to consume bytes directly off the end of MakiFile
function parseComand({ start, makiFile, length }) {
  const pos = makiFile.getPosition() - start;
  const opcode = makiFile.readUInt8();
  const command = {
    offset: pos,
    start,
    opcode,
    arg: null,
    argType: opcodeToArgType(opcode),
  };

  if (command.argType === "NONE") {
    return command;
  }

  let arg = null;
  switch (command.argType) {
    case "COMMAND_OFFSET":
      // Note in the perl code here: "todo, something strange going on here..."
      arg = makiFile.readInt32LE() + 5 + pos;
      break;
    case "VARIABLE_OFFSET":
      arg = makiFile.readUInt32LE();
      break;
    default:
      throw new Error("Invalid argType");
  }

  command.arg = arg;

  // From perl: look forward for a stack protection block
  // (why do I have to look FORWARD. stupid nullsoft)
  if (
    // Is there another UInt32 to read?
    length > pos + 5 + 4 &&
    makiFile.peekUInt32LE() >= 0xffff0000 &&
    makiFile.peekUInt32LE() <= 0xffff000f
  ) {
    makiFile.readUInt32LE();
  }

  // TODO: What even is this?
  if (opcode === 112 /* strangeCall */) {
    makiFile.readUInt8();
  }
  return command;
}
