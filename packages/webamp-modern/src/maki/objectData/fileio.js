export default {
  "836F8B2EE0D14db4937F0D0A04C8DCD1": {
    parent: "Object",
    functions: [
      {
        result: "",
        name: "load",
        parameters: [["String", "path"]],
      },
      {
        result: "boolean",
        name: "exists",
        parameters: [],
      },
      {
        result: "int",
        name: "getSize",
        parameters: [],
      },
    ],
    name: "File",
  },
  "417FFB69987F4be88D87D9965EEEC868": {
    parent: "File",
    functions: [
      {
        result: "",
        name: "parser_addCallback",
        parameters: [["String", "section"]],
      },
      {
        result: "",
        name: "parser_start",
        parameters: [],
      },
      {
        result: "String",
        name: "parser_onCallback",
        parameters: [
          ["String", "xmlpath"],
          ["String", "xmltag"],
          ["list", "paramname"],
          ["list", "paramvalue"],
        ],
      },
      {
        result: "String",
        name: "parser_onCloseCallback",
        parameters: [
          ["String", "xmlpath"],
          ["String", "xmltag"],
        ],
      },
      {
        result: "String",
        name: "parser_onError",
        parameters: [
          ["String", "filename"],
          ["int", "linenum"],
          ["String", "incpath"],
          ["int", "errcode"],
          ["String", "errstr"],
        ],
      },
      {
        result: "String",
        name: "parser_destroy",
        parameters: [],
      },
    ],
    name: "XmlDoc",
  },
};
