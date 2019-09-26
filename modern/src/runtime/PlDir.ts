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
}
