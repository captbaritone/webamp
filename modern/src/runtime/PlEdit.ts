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

  getnumtracks() {
    unimplementedWarning("getnumtracks");
    return;
  }

  getcurrentindex() {
    unimplementedWarning("getcurrentindex");
    return;
  }

  getnumselectedtracks() {
    unimplementedWarning("getnumselectedtracks");
    return;
  }

  getnextselectedtrack(i: number) {
    unimplementedWarning("getnextselectedtrack");
    return;
  }

  showcurrentlyplayingtrack() {
    unimplementedWarning("showcurrentlyplayingtrack");
    return;
  }

  showtrack(item: number) {
    unimplementedWarning("showtrack");
    return;
  }

  enqueuefile(file: string) {
    unimplementedWarning("enqueuefile");
    return;
  }

  clear() {
    unimplementedWarning("clear");
    return;
  }

  removetrack(item: number) {
    unimplementedWarning("removetrack");
    return;
  }

  swaptracks(item1: number, item2: number) {
    unimplementedWarning("swaptracks");
    return;
  }

  moveup(item: number) {
    unimplementedWarning("moveup");
    return;
  }

  movedown(item: number) {
    unimplementedWarning("movedown");
    return;
  }

  moveto(item: number, pos: number) {
    unimplementedWarning("moveto");
    return;
  }

  playtrack(item: number) {
    unimplementedWarning("playtrack");
    return;
  }

  getrating(item: number) {
    unimplementedWarning("getrating");
    return;
  }

  setrating(item: number, rating: number) {
    unimplementedWarning("setrating");
    return;
  }

  gettitle(item: number) {
    unimplementedWarning("gettitle");
    return;
  }

  getlength(item: number) {
    unimplementedWarning("getlength");
    return;
  }

  getmetadata(item: number, metadatastring: string) {
    unimplementedWarning("getmetadata");
    return;
  }

  getfilename(item: number) {
    unimplementedWarning("getfilename");
    return;
  }

  onpleditmodified() {
    unimplementedWarning("onpleditmodified");
    return;
  }
}
