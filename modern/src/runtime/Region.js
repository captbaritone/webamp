import MakiObject from "./MakiObject";
import { unimplementedWarning } from "../utils";

class Region extends MakiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Region";
  }

  loadfrommap(regionmap, threshold, reversed) {
    unimplementedWarning("loadFromMap");
  }

  offset(x, y) {
    unimplementedWarning("offset");
  }

  add(reg) {
    unimplementedWarning("add");
    return;
  }

  sub(reg) {
    unimplementedWarning("sub");
    return;
  }

  stretch(r) {
    unimplementedWarning("stretch");
    return;
  }

  copy(reg) {
    unimplementedWarning("copy");
    return;
  }

  loadfrombitmap(bitmapid) {
    unimplementedWarning("loadfrombitmap");
    return;
  }

  getboundingboxx() {
    unimplementedWarning("getboundingboxx");
    return;
  }

  getboundingboxy() {
    unimplementedWarning("getboundingboxy");
    return;
  }

  getboundingboxw() {
    unimplementedWarning("getboundingboxw");
    return;
  }

  getboundingboxh() {
    unimplementedWarning("getboundingboxh");
    return;
  }
}

export default Region;
