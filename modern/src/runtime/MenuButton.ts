import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

class MenuButton extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "MenuButton";
  }

  onopenmenu() {
    unimplementedWarning("onopenmenu");
    return;
  }

  onclosemenu() {
    unimplementedWarning("onclosemenu");
    return;
  }

  onselectitem(item) {
    unimplementedWarning("onselectitem");
    return;
  }

  openmenu() {
    unimplementedWarning("openmenu");
    return;
  }

  closemenu() {
    unimplementedWarning("closemenu");
    return;
  }
}

export default MenuButton;
