import UI_ROOT from "../../UIRoot";

/**
 * This is the base class from which all other classes inherit.
 */
export default class BaseObject {
  constructor() {
    UI_ROOT.addObject(this);
  }
  /**
   * Returns the class name for the object.
   *
   * @ret The class name.
   */
  getClassName(): string {
    throw new Error("Unimplemented");
  }

  getId() {
    throw new Error("Unimplemented");
  }

  dispose() {
    // Pass
  }
}
