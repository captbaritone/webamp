import Group from "./Group";

// Needs to behavve like a group to work with top level scripts that call `getScriptGroup`
class JsWinampAbstractionLayer extends Group {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "JsWinampAbstractionLayer";
  }
}

export default JsWinampAbstractionLayer;
