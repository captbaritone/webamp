import GuiObject from "./GuiObject";
import * as Utils from "../utils";

export default class Form extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Form";
  }

  getcontentsheight(): number {
    return Utils.unimplementedWarning("getcontentsheight");
  }

  newcell(groupname: string): void {
    return Utils.unimplementedWarning("newcell");
  }

  nextrow(): void {
    return Utils.unimplementedWarning("nextrow");
  }

  deleteall(): void {
    return Utils.unimplementedWarning("deleteall");
  }
}
