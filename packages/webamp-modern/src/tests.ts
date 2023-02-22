import "./maki/parser";
import { Binding, parse as parseMaki, ParsedMaki } from "./maki/parser";
import { getMethod, getClass } from "./maki/objects";

import JSZip from "jszip";
// This module is imported early here in order to avoid a circular dependency.
import { classResolver } from "./skin/resolver";
import { Variable } from "./maki/v";
import { getCaseInsensitiveFile } from "./utils";

function hack() {
  // Without this Snowpack will try to treeshake out resolver causing a circular
  // dependency.
  classResolver("A funny joke about why this is needed.");
}

type Ast =
  | {
      kind: "VARIABLE_DEFINITION";
      typeName: string;
      name: string;
    }
  | {
      kind: "HOOK";
      body: Ast[];
      variableName: string;
      hookName: string;
      binding?: Binding;
      // TODO: make this Ast[]
      args: string;
    }
  | {
      kind: "CALL";
      objectName: string;
      methodName: string;
      args: Ast[];
      body: Ast[];
      comment?: string;
    }
  | {
      kind: "ASSIGNMENT";
      variableName: string;
      expression: Ast;
      a?: Ast;
      b?: Ast;
    }
  | { kind: "IDENTIFIER"; value: string; variable?: Variable }
  | {
      kind: "BINARY_EXPRESSION";
      left: Ast;
      right: Ast;
      operator: "<" | ">" | "||";
    }
  | { kind: "CONDITIONAL"; test: Ast };

function whiteSpace(indent: number): string {
  let white = "";
  for (let i = 0; i < indent; i++) {
    white += "  ";
  }
  return white;
}
function indented(code: string, depth: number): string {
  return code
    .split("\n")
    .map((str) => whiteSpace(depth) + str)
    .join("\n");
}

function prettyPrint(ast: Ast, indent: number = 0): string {
  switch (ast.kind) {
    case "VARIABLE_DEFINITION":
      return `Global ${ast.typeName} ${ast.name}`;
    case "HOOK":
      const body = ast.body.map((statement) => {
        // Lazy indenting
        return indented(prettyPrint(statement, indent + 1), indent + 1);
      });
      const name = `${ast.variableName}.${ast.hookName}`;
      return `${name}(${ast.args}){//${JSON.stringify(
        ast.binding
      )}\n${body.join("\n")}\n}`;
    case "CALL":
      return `${ast.objectName}.${ast.methodName}(${ast.args.map(
        prettyPrint
      )}) /*${ast.comment}*/ `;
    case "ASSIGNMENT":
      return `${ast.variableName} = ${prettyPrint(ast.expression)};`;
    case "IDENTIFIER":
      return `${ast.value}`;
    case "BINARY_EXPRESSION":
      return `(${prettyPrint(ast.left)} ${ast.operator} ${prettyPrint(
        ast.right
      )})`;
    case "CONDITIONAL":
      return `if(${prettyPrint(ast.test)}) {\n  // SOME BODY\n}\n`;
    default:
      throw new Error(`Unhandled ast kind "${ast.kind}"`);
  }
}

class Decompiler {
  _program: ParsedMaki;
  constructor(program: ParsedMaki) {
    this._program = program;
  }

  decompile(): string {
    const sections = [...this.variables(), ...this.bindings()];

    return sections.map((node) => prettyPrint(node)).join("\n");
  }

  variableTypeName(offset: number): string {
    const variable = this._program.variables[offset];
    let type = variable.type;
    switch (variable.type) {
      case "OBJECT": {
        const guid = variable.guid;
        const klass = getClass(guid);
        return klass.name;
      }
      case "INT":
        return "int";
      case "DOUBLE":
      case "FLOAT":
        return "double";
      case "STRING":
        return "string";
      case "BOOLEAN":
        return "boolean";
      default:
        throw new Error(`Unexpected type: ${type}`);
    }
  }

  variables(): Ast[] {
    const output = [];

    // TODO: We could try to do the style of declaration where you do multiple
    // names of the same type all at once.
    for (const [i, variable] of this._program.variables.entries()) {
      if (i == 0 || i == 1) {
        // 0 = Global system object
        // 1 = Global null
        continue;
      }
      if (variable.global) {
        output.push({
          kind: "VARIABLE_DEFINITION",
          typeName: this.variableTypeName(i),
          name: this.variableName(i),
        });
      }
    }
    return output;
  }

  // TODO: Include type in variable name
  variableName(offset: number) {
    switch (offset) {
      case 0:
        return "System";
      default:
        return `${this.variableTypeName(offset).toLowerCase()}${offset}`;
    }
  }

  bindings() {
    const output = [];

    for (const binding of this._program.bindings) {
      const method = this._program.methods[binding.methodOffset];
      const guid = this._program.classes[method.typeOffset];
      const methodDefinition = getMethod(guid, method.name);
      output.push({
        kind: "HOOK",
        binding,
        variableName: this.variableName(binding.variableOffset),
        hookName: method.name,
        args: methodDefinition.parameters
          // TODO: What if names collide with outer scope?
          // Ensure type names are correct.
          .map(([type, name]) => `${type} ${name}`)
          .join(", "),
        body: this.code(
          binding.commandOffset,
          methodDefinition.parameters
            // TODO: What if names collide with outer scope?
            // Ensure type names are correct.
            .map(
              ([type, name]) =>
                ({
                  kind: "IDENTIFIER",
                  value: name,
                } as const)
            )
        ),
      });
    }

    return output;
  }

  code(commandOffset: number, args: Ast[]): Ast[] {
    const nodes: Ast[] = [];
    let ip = commandOffset;
    const callStack = [];
    const stack = args;
    outer: while (ip < this._program.commands.length) {
      const command = this._program.commands[ip];
      switch (command.opcode) {
        // push
        case 1: {
          stack.push({
            kind: "IDENTIFIER",
            value: this.variableName(command.arg),
            variable: this._program.variables[command.arg],
          });
          break;
        }
        // pop
        case 2: {
          stack.pop();
          break;
        }
        // popTo
        case 3: {
          const value = stack.pop();
          if (value == null) {
            throw new Error("Unexpected empty stack");
          }
          nodes.push({
            kind: "ASSIGNMENT",
            variableName: this.variableName(command.arg),
            expression: value,
          });
          break;
        }
        // ==
        case 8:
        // !=
        case 9:
        // >
        case 10:
        // <
        case 12:
        // +
        case 64:
        /*
        // -
        case 65:
          */
        // *
        case 66:
        // divide
        case 67:
        // ||
        case 81: {
          const operatorMap = {
            8: "==",
            9: "!=",
            10: ">",
            12: "<",
            64: "+",
            65: "-",
            66: "*",
            67: "/",
            81: "||",
          };
          const a = stack.pop();
          const b = stack.pop();
          stack.push({
            kind: "BINARY_EXPRESSION",
            left: b,
            right: a,
            operator: operatorMap[command.opcode],
          });
          break;
        }
        // jumpIf
        case 16: {
          const test = stack.pop();
          nodes.push({ kind: "CONDITIONAL", test });
          ip = command.arg - 1;
          break;
        }

        // jumpIfNot
        case 17: {
          const test = stack.pop();
          // TODO: NOT
          nodes.push({ kind: "CONDITIONAL", test });
          ip = command.arg - 1;
          break;
        }
        // call
        case 24: // call
          const methodOffset24 = command.arg;
          const method24 = this._program.methods[methodOffset24];
          let methodName24 = method24.name;
          // methodName24 = methodName24.toLowerCase();
          const guid24 = this._program.classes[method24.typeOffset];
          const methodDefinition24 = getMethod(guid24, method24.name);
          const obj24 = stack.pop();
          if (obj24.kind !== "IDENTIFIER") {
            throw new Error("Expectd ident");
          }
          const args24 = methodDefinition24.parameters.map((param) => {
            return stack.pop();
          });
          nodes.push({
            kind: "CALL",
            objectName: obj24.value,
            methodName: methodName24,
            args: args24,
            body: [],
            comment: "call",
          });
          stack.push({
            kind: "CALL",
            objectName: obj24.value,
            methodName: methodName24,
            args: args24,
            body: [],
            comment: "call",
          });
          break;
        // case 25: // call Global
        // const methodOffset25 = command.arg;
        // const method25 = this._program.methods[methodOffset25];
        // let methodName25 = method25.name;
        // methodName25 = methodName25.toLowerCase();
        // const guid25 = this._program.classes[method25.typeOffset];
        // const methodDefinition25 = getMethod(guid25, method25.name);
        // const obj25 = stack.pop();
        // if (obj25.kind !== "IDENTIFIER") {
        //   throw new Error("Expectd ident");
        // }
        // const args25 = methodDefinition25.parameters.map((param) => {
        //   return stack.pop();
        // });
        // nodes.push({
        //   kind: "CALL",
        //   objectName: obj25.value,
        //   methodName:methodName25,
        //   args: args25,
        //   body: [],
        //   comment: 'call-Global'
        // });
        // stack.push({
        //   kind: "CALL",
        //   objectName: obj25.value,
        //   methodName:methodName25,
        //   args: args25,
        //   body: [],
        //   comment: 'call-GollBall'
        // })
        // break;
        case 112: // strangeCall
          const methodOffset = command.arg;
          const method = this._program.methods[methodOffset];
          let methodName = method.name;
          // methodName = methodName.toLowerCase();
          const guid = this._program.classes[method.typeOffset];
          const methodDefinition = getMethod(guid, method.name);
          const obj = stack.pop();
          if (obj.kind !== "IDENTIFIER") {
            throw new Error("Expectd ident");
          }
          const args = methodDefinition.parameters.map((param) => {
            return stack.pop();
          });
          nodes.push({
            kind: "CALL",
            objectName: obj.value,
            methodName,
            args,
            body: [],
            comment:
              "STRANGECALL:" + JSON.stringify({ methodOffset, method, obj }),
          });
          stack.push({
            kind: "CALL",
            objectName: obj.value,
            methodName: methodName,
            args: args,
            body: [],
            comment: "stack-call",
          });
          break;
        case 33: {
          ip = callStack.pop();
          // TODO: Stack protection?
          break;
        }
        case 40:
          // What should we do here?
          return nodes;
          break;
        // mov
        case 48:
          const a = stack.pop();
          const b = stack.pop();
          stack.push({
            kind: "ASSIGNMENT",
            variableName: a.name,
            expression: b,
          });
          nodes.push({
            kind: "ASSIGNMENT",
            variableName: JSON.stringify(a),
            expression: b,
            a,
            b,
          });
          break;
        case 25:
          callStack.push(ip);
          ip = command.arg - 1;
          break;
        default:
          console.log(`Missing support for opcode ${command.opcode}`);
          break outer;
      }
      ip++;
    }
    return nodes;
  }
}

async function main() {
  // const skin = "assets/CornerAmp_Redux.wal";
  // const script = "scripts/corner.maki";

  const skin = "assets/WinampModern566.wal";
  const script = "scripts/eq.maki";

  const response = await fetch(skin);
  const data = await response.blob();
  const zip = await JSZip.loadAsync(data);

  // const makiFile = zip.file(script);
  const makiFile = getCaseInsensitiveFile(zip, script);
  const scriptContents = await makiFile.async("arraybuffer");
  // TODO: Try catch?
  const parsedScript = parseMaki(scriptContents);

  const decompiler = new Decompiler(parsedScript);

  const decompiled = decompiler.decompile();

  // const textarea = document.createElement("pre");
  // textarea.style.display = "flex";
  // textarea.style.width = "100%";
  // textarea.style.height = "100vh";
  // textarea.innerHTML = decompiled;
  // document.body.appendChild(textarea);
  document.getElementById("editor").innerHTML = decompiled;
  window.loaded();
}

main();

// https://stackoverflow.com/questions/65915371/how-do-i-make-the-program-wait-for-a-button-click-to-go-to-the-next-loop-iterati
// const btn = document.querySelector('button1');
const btn1 = document.getElementById("btn1");
const btn2 = document.getElementById("btn2");
const btn3 = document.getElementById("btn3");

let successCallback;

// function getNumber() {
async function getNumber(): Promise<number> {
  return new Promise((resolve) => (successCallback = resolve));
}

function btn1Click() {
  if (successCallback) successCallback(1);
}
function btn2Click() {
  if (successCallback) successCallback(2);
}
function btn3Click() {
  if (successCallback) successCallback(-1);
}

async function doIt() {
  console.log("wait for clic....");
  btn1.addEventListener("click", btn1Click);
  btn2.addEventListener("click", btn2Click);
  btn3.addEventListener("click", btn3Click);

  for (let c = 1; c < 10; c += 1) {
    const ret = await getNumber();
    console.log(c, "result=", ret);
    if (ret < 0) break;
  }

  btn1.removeEventListener("click", btn1Click);
  btn2.removeEventListener("click", btn2Click);
  btn3.removeEventListener("click", btn3Click);
  console.log("Finished");
}

doIt();
