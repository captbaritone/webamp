/**
 * This is the base class from which all other classes inherit.
 */
export default class BaseObject {
  static GUID = "516549714a510d87b5a6e391e7f33532";

  /**
   * Returns the class name for the object.
   *
   * @ret The class name.
   */
  getclassname(): string {
    return this.constructor.name;
  }

  getId() {
    throw new Error("Unimplemented");
  }

  dispose() {
    // Pass
  }
}
