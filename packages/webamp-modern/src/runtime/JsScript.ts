import MakiObject from "./MakiObject";
import System from "./System";

class JsScript extends MakiObject {
  system: System | undefined;

  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Script";
  }

  getScriptPath(): string | null {
    const { file } = this.attributes;
    return file == null ? null : String(file);
  }
}

export default JsScript;
