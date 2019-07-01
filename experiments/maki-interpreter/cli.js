const fs = require("fs");
const path = require("path");
const { parse } = require("./");
const { getClass } = require("./objects");
const interpret = require("./interpreter");

function parseFile(relativePath) {
  const buffer = fs.readFileSync(path.join(__dirname, relativePath));
  return parse(buffer);
}

class GuiObject {}
class Group extends GuiObject {
  findObject(id) {
    throw new Error("Not implemented");
  }
  setXmlParam(id, value) {
    throw new Error("Not implemented");
  }
}
class PopupMenu {}
class Container {}

const onScriptLoadedCallbacks = [];
const onSetXuiParamCallbacks = [];
class System {
  _start() {
    onScriptLoadedCallbacks.forEach(cb => {
      cb();
    });
  }
  onScriptLoaded(cb) {
    onScriptLoadedCallbacks.push(cb);
  }
  onSetXuiParam(cb) {
    onSetXuiParamCallbacks.push(cb);
  }
  getScriptGroup() {
    return new Group();
  }
  getToken(str, separator, tokennum) {
    return "Some Token String";
  }
  getParam() {
    return "Some String";
  }
  messagebox(message, var2, var3, var4) {
    alert(message);
  }
}
const runtime = {
  d6f50f6449b793fa66baf193983eaeef: System,
  "45be95e5419120725fbb5c93fd17f1f9": Group,
  "4ee3e1994becc636bc78cd97b028869c": GuiObject,
  f4787af44ef7b2bb4be7fb9c8da8bea9: PopupMenu,
  e90dc47b4ae7840d0b042cb0fcf775d2: Container
};

function getClassName(klass) {
  return klass
    .toString()
    .split("\n")[0]
    .split(" ")
    .slice(0, 2)
    .join(" ");
}

function main() {
  const relativePath = process.argv[2];
  const { commands, variables, classes, methods, bindings } = parseFile(
    relativePath
  );

  const system = new System();

  // Set the System global
  variables[0].setValue(system);

  // Replace class hashes with those from the runtime
  const resolvedClasses = classes.map(hash => {
    const resolved = runtime[hash];
    if (resolved == null) {
      const klass = getClass(hash);
      console.warn(
        `Class missing from runtime: ${hash} expected ${klass.name}`
      );
    }
    return resolved;
  });

  bindings.forEach(binding => {
    const handler = () => {
      return interpret({
        start: binding.commandOffset,
        commands,
        variables,
        classes: resolvedClasses,
        runtime,
        methods
      });
    };

    if (binding.variableOffset === 0) {
      const obj = variables[binding.variableOffset].getValue();
      const method = methods[binding.methodOffset];
      obj[method.name](handler);
    } else {
      console.log("Not binding to non-system events", binding);
    }
  });

  system._start();
}

main();
