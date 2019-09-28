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

  showcurrentlyplayingentry() {
    Utils.unimplementedWarning("showcurrentlyplayingentry");
    return;
  }

  getnumitems() {
    Utils.unimplementedWarning("getnumitems");
    return;
  }

  getitemname(item: number) {
    Utils.unimplementedWarning("getitemname");
    return;
  }

  refresh() {
    Utils.unimplementedWarning("refresh");
    return;
  }

  renameitem(item: number, name: string) {
    Utils.unimplementedWarning("renameitem");
    return;
  }

  enqueueitem(item: number) {
    Utils.unimplementedWarning("enqueueitem");
    return;
  }

  playitem(item: number) {
    Utils.unimplementedWarning("playitem");
    return;
  }
}
