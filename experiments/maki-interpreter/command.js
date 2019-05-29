const { COMMANDS } = require("./constants");

class Variable {
  constructor(a, b, name) {
    this.a = a;
    this.b = b;
    this.name = name;
  }
}

function decodeUInt32(code) {
  // prettier-ignore
  return (
    (code.charCodeAt(3) << 24) +
    (code.charCodeAt(2) << 16) +
    (code.charCodeAt(1) << 8) +
    code.charCodeAt(0)
  );
}

function decodeInt32(code) {
  let num = decodeUInt32(code);
  if (num > 0x7fffffff) {
    num = num - 0xffffffff - 1;
  }
  return num;
}

class Command {
  constructor({
    functionsCode,
    pos,
    types,
    variables,
    functionNames,
    localFunctions
  }) {
    const opcode = functionsCode.charCodeAt(pos);
    this.pos = pos;
    this.opcode = opcode;
    this.arguments = [];
    this.command = COMMANDS[opcode];

    if (this.command == null) {
      this.command = {
        name: `unknown ${opcode}`,
        in: 0,
        out: 0
      };
      return;
    }

    if (this.command.arg == null) {
      this.size = 1;
      return;
    }

    const argType = this.command.arg;
    let arg = null;
    switch (argType) {
      case "var": {
        const variable = decodeInt32(functionsCode.substr(pos + 1, 4));
        if (variables[variable] != null) {
          arg = variables[variable];
        } else {
          arg = new Variable(-1, -0, "unknown");
        }
        this.name = `Unknown ${variable}`;
        break;
      }
      case "line": {
        const variable = decodeInt32(functionsCode.substr(pos + 1, 4)) + 5;
        arg = { name: variable, line: variable };
        break;
      }
      case "objFunc": {
        const variable = decodeInt32(functionsCode.substr(pos + 1, 4));
        if (functionNames[variable] != null) {
          arg = functionNames[variable].function;
        } else {
          arg = {
            name: `unknown Object function ${variable}`,
            parameters: [],
            return: "unknown"
          };
        }
        break;
      }
      case "func": {
        // Note in the perl code here: "todo, something strange going on here..."
        const variable = decodeInt32(functionsCode.substr(pos + 1, 4)) + 5;
        const s = functionsCode.substr(pos + 1, 1);
        console.log(functionsCode.length);
        console.log(s.charCodeAt(0));
        arg = {
          name: `func${variable + pos}`,
          code: [],
          offset: variable + pos
        };
        if (opcode === 25) {
          // console.log(variable);
        }
        if (localFunctions[variable + pos] == null) {
          localFunctions[variable + pos] = {
            function: arg,
            offset: variable + pos
          };
        }
        break;
      }
      case "obj": {
        const variable = decodeInt32(functionsCode.substr(pos + 1, 4));
        arg = types[variable];
        break;
      }
    }

    this.arguments = [arg];
    this.size = 5;

    /*
    # look forward for a stack protection block
    # (why do I have to look FORWARD. stupid nullsoft)
    if( length($code) > $pos+5+4 &&
        decodeUInt32( substr( $code, $pos+5, 4 ) ) >= 0xffff0000 ) {
      $self->{size} += 4;
    }
    */

    if (opcode === 112) {
      this.size += 1;
    }
  }
}

module.exports = Command;
