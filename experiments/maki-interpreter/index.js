const { COMMANDS } = require("./constants");
const Command = require("./command");
const { getClass, getObjectFunction } = require("./objects");
const MAGIC = "FG";
const ENCODING = "binary";

class Parser {
  _readMagic() {
    const magic = this._readStringOfLength(MAGIC.length);
    if (magic !== MAGIC) {
      throw new Error("Magic number does not mach. Is this a maki file?");
    }
    return magic;
  }

  _readVersion() {
    // No idea what we're actually expecting here.
    this._i += 2;
  }

  _readTypes() {
    let count = this._readUInt32LE();
    const types = [];
    while (count--) {
      let identifier = "";
      let chunks = 4;
      while (chunks--) {
        identifier += this._readUInt32LE()
          .toString(16)
          .padStart(8, "0");
      }
      const klass = getClass(identifier);
      if (klass == null) {
        throw new Error(`Could not find class for id: ${identifier}`);
      }
      types.push(klass);
    }
    return types;
  }

  _readFunctionsNames({ types }) {
    let count = this._readUInt32LE();
    const functionNames = [];
    while (count--) {
      const classCode = this._readUInt16LE();
      // Offset into our parsed types
      const typeOffset = classCode & 0xff;
      const dummy2 = this._readUInt16LE();
      const name = this._readString();
      const klass = types[typeOffset];
      functionNames.push({
        dummy2,
        name,
        class: klass,
        function: getObjectFunction(klass, name)
      });
    }
    return functionNames;
  }

  _readVariables() {
    let count = this._readUInt32LE();
    const variables = [];
    while (count--) {
      const type = this._readUInt8();
      const object = this._readUInt8();
      const subClass = this._readUInt16LE();
      const uinit1 = this._readUInt16LE();
      const uinit2 = this._readUInt16LE();
      const uinit3 = this._readUInt16LE();
      const uinit4 = this._readUInt16LE();
      const global = this._readUInt8();
      const system = this._readUInt8();
      const variable = {
        type,
        object,
        subClass,
        uinit1,
        uinit2,
        uinit3,
        uinit4,
        global,
        system
      };
      variables.push(variable);
    }
    return variables;
  }

  _readConstants() {
    let count = this._readUInt32LE();
    const constants = [];
    while (count--) {
      const varNum = this._readUInt32LE();
      const value = this._readString();
      constants.push({ varNum, value });
    }
    return constants;
  }

  _readFunctions() {
    let count = this._readUInt32LE();
    const functions = [];
    while (count--) {
      const varNum = this._readUInt32LE();
      const funcNum = this._readUInt32LE();
      const offset = this._readUInt32LE();
      functions.push({ varNum, offset, funcNum });
    }
    return functions;
  }

  _readCommands(code) {
    let i = 0;
    while (i < code.length) {
      const opCode = code.charCodeAt(i);
      const command = COMMANDS[opCode];
      if (command == null) {
        // console.warn(`Missing command opCode: ${opCode}`);
        i++;
        continue;
      }
      if (command.arg == null) {
        i++;
        continue;
      }
      switch (command.arg) {
        case "var":
          // This is the index into this._debug.variables
          // this._readUInt32LE();
          i += 5;
          break;
        default:
          i += 5;
      }
      // console.log({ command });
    }
  }

  _readUInt32LE() {
    const int = this._buffer.readUInt32LE(this._i);
    this._i += 4;
    return int;
  }

  _readUInt16LE() {
    const int = this._buffer.readUInt16LE(this._i);
    this._i += 2;
    return int;
  }

  _readUInt8() {
    const int = this._buffer.readUInt8(this._i);
    this._i++;
    return int;
  }

  _readStringOfLength(length) {
    const str = this._buffer.toString(ENCODING, this._i, this._i + length);
    this._i += length;
    return str;
  }

  _readString() {
    return this._readStringOfLength(this._readUInt16LE());
  }

  _decodeCode({ types, variables, functionNames, functions }) {
    const length = this._readUInt32LE();
    const commandsBuffer = this._buffer.slice(this._i, this._i + length);
    this._i += length;

    let pos = 0;
    const localFunctions = {};
    const results = [];
    while (pos < commandsBuffer.length) {
      const command = new Command({
        commandsBuffer,
        pos,
        types,
        variables,
        functionNames,
        localFunctions
      });
      pos += command.size;
      results.push(command);
    }
    // TODO: Don't mutate
    Object.values(localFunctions).forEach(localFunction => {
      functions.push(localFunction);
    });

    functions.sort((a, b) => {
      // TODO: Confirm that I have this the right way round
      return a.offset - b.offset;
    });

    return results;
  }

  parse(buffer) {
    this._buffer = buffer;
    this._i = 0;

    const magic = this._readMagic();
    this._readVersion();
    this._readUInt32LE(); // Not sure what we are skipping over here. Just some UInt 32.
    const types = this._readTypes();
    const functionNames = this._readFunctionsNames({ types });
    const variables = this._readVariables();
    const constants = this._readConstants();
    const functions = this._readFunctions();
    const commands = this._decodeCode({
      types,
      variables,
      functionNames,
      functions
    });
    return {
      magic,
      types,
      functionNames,
      variables,
      constants,
      functions,
      commands
    };
  }
}

function parse(buffer) {
  const parser = new Parser();
  return parser.parse(buffer);
}

module.exports = { parse };
