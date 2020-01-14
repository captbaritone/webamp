import MakiObject from "./MakiObject";
import { unimplementedWarning } from "../utils";
import MakiMap from "./MakiMap";

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

  loadfrommap(regionmap: MakiMap, threshold: number, reversed: boolean) {
    unimplementedWarning("loadFromMap");
  }

  offset(x: number, y: number) {
    unimplementedWarning("offset");
  }

  add(reg: Region) {
    unimplementedWarning("add");
    return;
  }

  sub(reg: Region) {
    unimplementedWarning("sub");
    return;
  }

  stretch(r: number) {
    unimplementedWarning("stretch");
    return;
  }

  copy(reg: Region) {
    unimplementedWarning("copy");
    return;
  }

  loadfrombitmap(bitmapid: string) {
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
