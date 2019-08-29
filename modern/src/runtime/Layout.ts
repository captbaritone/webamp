import Group from "./Group";
import { findParentNodeOfType, unimplementedWarning } from "../utils";

class Layout extends Group {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Layout";
  }

  getcontainer() {
    return findParentNodeOfType(this, new Set(["container"]));
  }

  ondock() {
    unimplementedWarning("ondock");
    return;
  }

  onundock() {
    unimplementedWarning("onundock");
    return;
  }

  onscale(newscalevalue: number) {
    unimplementedWarning("onscale");
    return;
  }

  getscale() {
    unimplementedWarning("getscale");
    return;
  }

  setscale(scalevalue: number) {
    unimplementedWarning("setscale");
    return;
  }

  setdesktopalpha(onoff: boolean) {
    unimplementedWarning("setdesktopalpha");
    return;
  }

  getdesktopalpha() {
    unimplementedWarning("getdesktopalpha");
    return;
  }

  center() {
    unimplementedWarning("center");
    return;
  }

  onmove() {
    unimplementedWarning("onmove");
    return;
  }

  onendmove() {
    unimplementedWarning("onendmove");
    return;
  }

  onuserresize(x: number, y: number, w: number, h: number) {
    unimplementedWarning("onuserresize");
    return;
  }

  snapadjust(left: number, top: number, right: number, bottom: number) {
    unimplementedWarning("snapadjust");
    return;
  }

  getsnapadjusttop() {
    unimplementedWarning("getsnapadjusttop");
    return;
  }

  getsnapadjustright() {
    unimplementedWarning("getsnapadjustright");
    return;
  }

  getsnapadjustleft() {
    unimplementedWarning("getsnapadjustleft");
    return;
  }

  getsnapadjustbottom() {
    unimplementedWarning("getsnapadjustbottom");
    return;
  }

  setredrawonresize(wantredrawonresize: number) {
    unimplementedWarning("setredrawonresize");
    return;
  }

  beforeredock() {
    unimplementedWarning("beforeredock");
    return;
  }

  redock() {
    unimplementedWarning("redock");
    return;
  }

  istransparencysafe() {
    unimplementedWarning("istransparencysafe");
    return;
  }

  islayoutanimationsafe() {
    unimplementedWarning("islayoutanimationsafe");
    return;
  }

  onmouseenterlayout() {
    unimplementedWarning("onmouseenterlayout");
    return;
  }

  onmouseleavelayout() {
    unimplementedWarning("onmouseleavelayout");
    return;
  }

  onsnapadjustchanged() {
    unimplementedWarning("onsnapadjustchanged");
    return;
  }
}

export default Layout;
