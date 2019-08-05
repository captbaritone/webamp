const Group = require("./Group");

// Needs to behavve like a group to work with top level scripts that call `getScriptGroup`
class WinampAbstractionLayer extends Group {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassaname() {
    return "WinampAbstractionLayer";
  }
}

module.exports = WinampAbstractionLayer;
