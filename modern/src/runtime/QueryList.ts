import GuiObject from "./GuiObject";

class QueryList extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "QueryList";
  }

  onresetquery(): void {
    this.js_trigger("onResetQuery");
  }
}

export default QueryList;
