const fs = require("fs");
const path = require("path");
const run = require("./index");

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

function main() {
  const relativePath = process.argv[2];
  const buffer = fs.readFileSync(path.join(__dirname, relativePath));
  const system = new System();
  run({ runtime, buffer, system });
}

main();
