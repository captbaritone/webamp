import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

export default class Menu extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Menu";
  }

  setmenugroup(groupId: string) {
    unimplementedWarning("setmenugroup");
    return;
  }

  getmenugroup() {
    unimplementedWarning("getmenugroup");
    return;
  }

  setmenu(menuId: string) {
    unimplementedWarning("setmenu");
    return;
  }

  getmenu() {
    unimplementedWarning("getmenu");
    return;
  }

  spawnmenu(monitor: number) {
    unimplementedWarning("spawnmenu");
    return;
  }

  cancelmenu() {
    unimplementedWarning("cancelmenu");
    return;
  }

  setnormalid(id: string) {
    unimplementedWarning("setnormalid");
    return;
  }

  setdownid(id: string) {
    unimplementedWarning("setdownid");
    return;
  }

  sethoverid(id: string) {
    unimplementedWarning("sethoverid");
    return;
  }

  onopenmenu() {
    unimplementedWarning("onopenmenu");
    return;
  }

  onclosemenu() {
    unimplementedWarning("onclosemenu");
    return;
  }

  nextmenu() {
    unimplementedWarning("nextmenu");
    return;
  }

  previousmenu() {
    unimplementedWarning("previousmenu");
    return;
  }
}
