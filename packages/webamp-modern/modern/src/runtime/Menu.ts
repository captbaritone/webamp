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

  setmenugroup(groupId: string): void {
    return unimplementedWarning("setmenugroup");
  }

  getmenugroup(): string {
    return unimplementedWarning("getmenugroup");
  }

  setmenu(menuId: string): void {
    return unimplementedWarning("setmenu");
  }

  getmenu(): string {
    return unimplementedWarning("getmenu");
  }

  spawnmenu(monitor: number): void {
    return unimplementedWarning("spawnmenu");
  }

  cancelmenu(): void {
    return unimplementedWarning("cancelmenu");
  }

  setnormalid(id: string): void {
    return unimplementedWarning("setnormalid");
  }

  setdownid(id: string): void {
    return unimplementedWarning("setdownid");
  }

  sethoverid(id: string): void {
    return unimplementedWarning("sethoverid");
  }

  onopenmenu(): void {
    return unimplementedWarning("onopenmenu");
  }

  onclosemenu(): void {
    return unimplementedWarning("onclosemenu");
  }

  nextmenu(): void {
    return unimplementedWarning("nextmenu");
  }

  previousmenu(): void {
    return unimplementedWarning("previousmenu");
  }
}
