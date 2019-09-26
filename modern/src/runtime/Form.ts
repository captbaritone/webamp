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

  getcontentsheight() {
    Utils.unimplementedWarning("getcontentsheight");
    return;
  }

  newcell(groupname: string) {
    Utils.unimplementedWarning("newcell");
    return;
  }

  nextrow() {
    Utils.unimplementedWarning("nextrow");
    return;
  }

  deleteall() {
    Utils.unimplementedWarning("deleteall");
    return;
  }
}
