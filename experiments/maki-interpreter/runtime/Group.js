const GuiObject = require("./GuiObject");

class Group extends GuiObject {
  findObject(id) {
    throw new Error("Not implemented");
  }
  setXmlParam(id, value) {
    throw new Error("Not implemented");
  }
}

module.exports = Group;
