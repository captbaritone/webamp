/**
 Object Class.

 @short    This is the base class from which all other classes inherit.
 @author   Nullsoft Inc.
 @ver  1.0
*/
export default class BaseObject {
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
}
