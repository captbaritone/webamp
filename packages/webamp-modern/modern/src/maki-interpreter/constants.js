const COMMANDS = {
  "1": { name: "push", short: "", arg: "var", in: "0", out: "1" },
  "2": { name: "pop", short: "pop", in: "1", out: "0" },
  "3": {
    name: "popTo",
    short: "popTo",
    arg: "var",
    in: "0",
    out: "0",
    // note in fact popTo takes one
    // argument but it is not visible to the parser because popTo
    // is always at the start of a function
  },
  "8": { name: "eq", short: "==", in: "2", out: "1" },
  "9": { name: "heq", short: "!=", in: "2", out: "1" },
  "10": { name: "gt", short: ">", in: "2", out: "1" },
  "11": { name: "gtq", short: ">=", in: "2", out: "1" },
  "12": { name: "le", short: "<", in: "2", out: "1" },
  "13": { name: "leq", short: "<=", in: "2", out: "1" },

  "16": { name: "jumpIf", short: "if", arg: "line", in: "1", out: "0" },
  "17": { name: "jumpIfNot", arg: "line", in: "1", out: "0" },
  "18": { name: "jump", arg: "line", in: "0", out: "0" },

  "24": { name: "call", arg: "objFunc", in: "0", out: "1" },
  "25": { name: "callGlobal", arg: "func", in: "0", out: "1" },

  "33": {
    name: "ret",
    short: "return",
    in: "1",
    out: "0", // note: we claim that return
    // pops one argument from the stack, which ist not the full truth.
  },

  "40": { name: "complete", short: "complete", in: "0", out: "0" },

  "48": { name: "mov", short: "=", in: "2", out: "1" },

  "56": { name: "postinc", short: "++", post: 1, in: "1", out: "1" },
  "57": { name: "postdec", short: "--", post: 1, in: "1", out: "1" },
  "58": { name: "preinc", short: "++", in: "1", out: "1" },
  "59": { name: "predec", short: "--", in: "1", out: "1" },

  "64": { name: "add", short: "+", in: "2", out: "1" },
  "65": { name: "sub", short: "-", in: "2", out: "1" },
  "66": { name: "mul", short: "*", in: "2", out: "1" },
  "67": { name: "div", short: "/", in: "2", out: "1" },
  "68": { name: "mod", short: "%", in: "2", out: "1" },

  "72": { name: "and", short: "&", in: "2", out: "1" },
  "73": { name: "or", short: "|", in: "2", out: "1" },
  "74": { name: "not", short: "!", in: "1", out: "1" },
  "76": { name: "negative", short: "-", in: "1", out: "1" },

  "80": { name: "logAnd", short: "&&", in: "2", out: "1" },
  "81": { name: "logOr", short: "||", in: "2", out: "1" },

  // The decompiler has these next two as 90 and 91.
  "88": { name: "lshift", short: "<<", in: "2", out: "1" },
  "89": { name: "rshift", short: ">>", in: "2", out: "1" },

  "90": { name: "lshift", short: "<<", in: "2", out: "1" },
  "91": { name: "rshift", short: ">>", in: "2", out: "1" },

  "96": { name: "new", arg: "obj", in: "0", out: "1" },
  "97": { name: "delete", short: "delete", in: "1", out: "1" },

  "112": { name: "strangeCall", arg: "objFunc", in: "0", out: "1" },

  // Mystery opcode
  // "255": { name: "MYSTERY", short: "WAT", in: "0", out: "0" },

  "300": { name: "blockStart", short: "{", in: "0", out: "0" },

  "301": { name: "blockEnd", short: "}", in: "0", out: "0" },
};

module.exports = { COMMANDS };
