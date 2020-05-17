import MakiObject from "./MakiObject";
import * as Utils from "../utils";

export default class PlDir extends MakiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "PlDir";
  }

  showcurrentlyplayingentry(): void {
    return Utils.unimplementedWarning("showcurrentlyplayingentry");
  }

  getnumitems(): number {
    return Utils.unimplementedWarning("getnumitems");
  }

  getitemname(item: number): string {
    return Utils.unimplementedWarning("getitemname");
  }

  refresh(): void {
    return Utils.unimplementedWarning("refresh");
  }

  renameitem(item: number, name: string): void {
    return Utils.unimplementedWarning("renameitem");
  }

  enqueueitem(item: number): void {
    return Utils.unimplementedWarning("enqueueitem");
  }

  playitem(item: number): void {
    return Utils.unimplementedWarning("playitem");
  }
}
