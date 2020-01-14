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

  loadfrommap(regionmap: MakiMap, threshold: number, reversed: boolean): void {
    unimplementedWarning("loadFromMap");
  }

  offset(x: number, y: number): void {
    unimplementedWarning("offset");
  }

  add(reg: Region): void {
    return unimplementedWarning("add");
  }

  sub(reg: Region): void {
    return unimplementedWarning("sub");
  }

  stretch(r: number): void {
    return unimplementedWarning("stretch");
  }

  copy(reg: Region): void {
    return unimplementedWarning("copy");
  }

  loadfrombitmap(bitmapid: string): void {
    return unimplementedWarning("loadfrombitmap");
  }

  getboundingboxx(): number {
    return unimplementedWarning("getboundingboxx");
  }

  getboundingboxy(): number {
    return unimplementedWarning("getboundingboxy");
  }

  getboundingboxw(): number {
    return unimplementedWarning("getboundingboxw");
  }

  getboundingboxh(): number {
    return unimplementedWarning("getboundingboxh");
  }
}

export default Region;
