import { COMMANDS } from "./constants";
import { DataType, Variable } from "./v";
import MakiFile from "./MakiFile";
import { getReturnType } from "./objects";
import { assert } from "../utils";
import { classResolver } from "../skin/resolver";
import BaseObject from "../skin/makiClasses/BaseObject";

export type Command = {
  opcode: number;
  arg: number;
};

export type Method = {
  name: string;
  typeOffset: number;
  returnType: DataType;
  className?: string;
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
  methodName?: string;
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
const knownContainerGuids = {
  "{0000000a-000c-0010-ff7b-01014263450c}": "[VIS]", // visualization
  "{45f3f7c1-a6f3-4ee6-a15e-125e92fc3f8d}": "[PL]", // playlist editor
  "{6b0edf80-c9a5-11d3-9f26-00c04f39ffc6}": "[ML]", // media library
  "{7383a6fb-1d01-413b-a99a-7e6f655f4591}": "[CON]", // config?
  "{7a8b2d76-9531-43b9-91a1-ac455a7c8242}": "[LIR]", // lyric?
  "{a3ef47bd-39eb-435a-9fb3-a5d87f6f17a5}": "[DL]", // download??
  "{f0816d7b-fffc-4343-80f2-e8199aa15cc3}": "[VIDEO]", // independent video window
};

function getClassId(guid: string): string {
  const known = knownContainerGuids[guid];
  if (known) {
    return known;
  }
  try {
    const cls: Function = classResolver(guid);
    return cls.prototype.constructor.name;
  } catch (e) {
    return "--unknown--";
  }
}

let methods: Method[] = [];
let variables: Variable[] = [];
let constants: any[] = [];
let classes: string[] = [];
let bindings: Binding[] = [];
let classAliases: { [key: string]: string } = {};
export function parse(data: ArrayBuffer): ParsedMaki {
  const makiFile = new MakiFile(data);

  const magic = readMagic(makiFile);
  // TODO: What format is this? Does it even change between compiler versions?
  // Maybe it's the std.mi version?
  const version = readVersion(makiFile);
  // Not sure what we are skipping over here. Just some UInt 32.
  // Maybe it's additional version info?
  const extraVersion = makiFile.readUInt32LE();
  /* const */ classes = readClasses(makiFile);
  /* const */ methods = readMethods(makiFile, classes);
  /* const */ variables = readVariables({ makiFile, classes });
  readConstants({ makiFile, variables });
  /* const */ bindings = readBindings(makiFile);
  const commands = decodeCode({ makiFile });

  // TODO: Assert that we are at the end of the maki file
  if (!makiFile.isEof()) {
    console.warn("EOF not reached!");
  }

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

  const resolvedBindings = bindings.map((binding): Binding => {
    return Object.assign({}, binding, {
      commandOffset: offsetToCommand[binding.binaryOffset],
    });
  });

  const resolvedCommands = commands.map((command): Command => {
    if (command.argType === "COMMAND_OFFSET") {
      return Object.assign({}, command, {
        arg: offsetToCommand[command.arg],
      });
    }
    return command;
  });

  // RESOLVE THE BINDING OF "CLASS"
  // it is because we can't mutate the variable.value at runtime
  /*
  	{
			"type": "CLASS",
			"value": null,
			"global": 0,
			"guid": "4ee3e1994becc636bc78cd97b028869c",
			"className": "GuiObj",
			"isObject": 1,
			"_index_": 11,
			"isClass": true,
			"newClassName": "NEW_CLASS_NAME-1",
			"members": [
				13,
				14,
				15,
				16,
				17,
				18,
				19,
				20,
				21,
				22
			],
			"events": [
				13,
				14
			]
		},
  */
  for (const ivar of variables) {
    if (ivar.isClass == true) {
      for (const ivarOffset of ivar.members) {
        const variable = variables[ivarOffset];
        for (const methodOffset of ivar.events) {
          const binding = resolvedBindings[methodOffset];
          const method = methods[binding.methodOffset];
          const methodName = `${variable.className}.${method.name}`;
          resolvedBindings.push({
            ...binding,
            methodName,
            variableOffset: ivarOffset,
            // binaryOffset,
            // methodOffset,
            // variable: clone1level(variables[variableOffset])
            bindingOnClass: true,
          });
        }
      }
    }
  }

  return {
    version,
    extraVersion,
    classes,
    classAliases,
    variables,
    methods,
    bindings: resolvedBindings,
    commands: resolvedCommands,
    // _commands: commands,
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
  const classesAlias = {}; //['.. -- ..'];
  while (count--) {
    let identifier = "";
    let chunks = 4;
    while (chunks--) {
      identifier += makiFile.readUInt32LE().toString(16).padStart(8, "0");
    }
    classes.push(identifier);
    // classesAlias.push(`${getClassId(identifier)} = ${identifier}`);
    classesAlias[identifier] = getClassId(identifier);
  }
  classAliases = classesAlias;
  return classes;
  // return classes.concat(classesAlias);
}

function readMethods(makiFile: MakiFile, guids: string[]): Method[] {
  let count = makiFile.readUInt32LE();
  const methods: Method[] = [];
  while (count--) {
    const classCode = makiFile.readUInt16LE();
    // Offset into our parsed types
    const typeOffset = classCode & 0xff;
    // This is probably the second half of a uint32
    const unknown1 = makiFile.readUInt16LE();
    const name = makiFile.readString(); //.toLowerCase();

    const classGuid = guids[typeOffset];
    const className = getClassId(classGuid);

    const returnType = getReturnType(classGuid, name.toLowerCase());

    methods.push({
      name,
      typeOffset,
      returnType,
      className,
      unknown1,
      classCode,
    });
  }
  return methods;
}

function readVariables({ makiFile, classes }) {
  let count = makiFile.readUInt32LE();
  const variables = [];
  let newClass = 0;
  while (count--) {
    const typeOffset = makiFile.readUInt8();
    const object = makiFile.readUInt8();
    const subClass = makiFile.readUInt16LE();
    const uinit1 = makiFile.readUInt16LE();
    const uinit2 = makiFile.readUInt16LE();
    const uinit3 = makiFile.readUInt16LE(); // uinit3
    const uinit4 = makiFile.readUInt16LE(); //uinit4
    const global = makiFile.readUInt8();
    const isSystem = makiFile.readUInt8(); // system

    if (subClass) {
      const variable = variables[typeOffset];
      if (variable == null) {
        throw new Error("Invalid type");
      } else {
        if (!variable.members) {
          variables[typeOffset].isClass = true;
          variable.isClass = true;
          // if (!variable.newClassName) {
          variable.newClassName = `NEW_CLASS_NAME-${++newClass}`;
          // variable.type0 = variable.type;
          variable.type = "CLASS";
          variable.members = [];
          variable.events = []; //method indexes
        }
      }

      // assume(false, "Unimplemented subclass variable type");
      variables.push({
        // type: variable.newClassName? "CLASS" : "OBJECT",
        type: "OBJECT",
        value: null,
        global,
        guid: variable.guid,
        isSubClass: true,
        inheritFrom: variable.newClassName || variable.className,
        isObject: object,
        // newClassDeclaration: true,
        className: getClassId(variable.guid) || "^UNKNOWN^",
      });
      const index = variables.length - 1;

      if (!variable.members.includes(index)) {
        variable.members.push(index);
      }
    } else if (object) {
      const klass = classes[typeOffset];
      if (klass == null) {
        throw new Error("Invalid type");
      }
      variables.push({
        type: "OBJECT",
        value: null,
        global,
        guid: klass,
        className: getClassId(klass),
        isObject: object,
      });
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
        isObject: object,
      };
      variables.push(variable);
    }
    if (isSystem) {
      variables[variables.length - 1].isSystem = true;
    }
    variables[variables.length - 1]._index_ = variables.length - 1;
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
    variable.constantData = value;
  }
}

function clone1level(o: object): object {
  const ret = [];
  for (const [key, value] of Object.entries(o)) {
    if (
      !(typeof value === "object" && !Array.isArray(value) && value !== null)
    ) {
      ret[key] = value;
    }
  }
  return ret;
}

function readBindings(makiFile: MakiFile): Binding[] {
  let count = makiFile.readUInt32LE();
  const bindings = [];
  while (count--) {
    const variableOffset = makiFile.readUInt32LE();
    const methodOffset = makiFile.readUInt32LE();
    const binaryOffset = makiFile.readUInt32LE();
    const method = methods[methodOffset];
    // const methodName = `${method.newClassName || method.className}.${method.name}`
    const methodName = `${method.className}.${method.name}`;
    bindings.push({
      methodName,
      variableOffset,
      binaryOffset,
      methodOffset,
      variable: clone1level(variables[variableOffset]),
    });
    const aclass = variables[variableOffset];
    if (!aclass.events) {
      aclass.events = [];
    }
    aclass.events.push(bindings.length - 1);
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
  const Command = COMMANDS[opcode] || { name: "UNKNOWN", short: "-???-" };
  const description = `${Command.short || Command.name} (${Command.name})`;
  const command = {
    description,
    opcode,
    offset: pos,
    start,
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
    const strangeFlag = makiFile.readUInt8();
    command.strangeFlag = strangeFlag;
  }
  return command;
}
