import MakiObject from "./MakiObject";
import { unimplementedWarning } from "../utils";

export default class PlEdit extends MakiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "PlEdit";
  }

  getnumtracks(): number {
    return unimplementedWarning("getnumtracks");
  }

  getcurrentindex(): number {
    return unimplementedWarning("getcurrentindex");
  }

  getnumselectedtracks(): number {
    return unimplementedWarning("getnumselectedtracks");
  }

  getnextselectedtrack(i: number): number {
    return unimplementedWarning("getnextselectedtrack");
  }

  showcurrentlyplayingtrack(): void {
    return unimplementedWarning("showcurrentlyplayingtrack");
  }

  showtrack(item: number): void {
    return unimplementedWarning("showtrack");
  }

  enqueuefile(file: string): void {
    return unimplementedWarning("enqueuefile");
  }

  clear(): void {
    return unimplementedWarning("clear");
  }

  removetrack(item: number): void {
    return unimplementedWarning("removetrack");
  }

  swaptracks(item1: number, item2: number): void {
    return unimplementedWarning("swaptracks");
  }

  moveup(item: number): void {
    return unimplementedWarning("moveup");
  }

  movedown(item: number): void {
    return unimplementedWarning("movedown");
  }

  moveto(item: number, pos: number): void {
    return unimplementedWarning("moveto");
  }

  playtrack(item: number): void {
    return unimplementedWarning("playtrack");
  }

  getrating(item: number): number {
    return unimplementedWarning("getrating");
  }

  setrating(item: number, rating: number): void {
    return unimplementedWarning("setrating");
  }

  gettitle(item: number): string {
    return unimplementedWarning("gettitle");
  }

  getlength(item: number): string {
    return unimplementedWarning("getlength");
  }

  getmetadata(item: number, metadatastring: string): string {
    return unimplementedWarning("getmetadata");
  }

  getfilename(item: number): string {
    return unimplementedWarning("getfilename");
  }

  onpleditmodified(): void {
    return unimplementedWarning("onpleditmodified");
  }
}
