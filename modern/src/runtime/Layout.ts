import Group from "./Group";
import { findParentNodeOfType, unimplementedWarning } from "../utils";
import MakiObject from "./MakiObject";

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
    const self: MakiObject = this;
    return findParentNodeOfType(self, new Set(["container"]));
  }

  ondock(): void {
    this.js_trigger("onDock");
  }

  onundock(): void {
    this.js_trigger("onUnDock");
  }

  onscale(newscalevalue: number): void {
    this.js_trigger("onScale", newscalevalue);
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

  onmove(): void {
    this.js_trigger("onMove");
  }

  onendmove(): void {
    this.js_trigger("onEndMove");
  }

  onuserresize(x: number, y: number, w: number, h: number): void {
    this.js_trigger("onUserResize", x, y, w, h);
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

  onmouseenterlayout(): void {
    this.js_trigger("onMousEenterLayout");
  }

  onmouseleavelayout(): void {
    this.js_trigger("onMouseLeaveLayout");
  }

  onsnapadjustchanged(): void {
    this.js_trigger("onSnapAdjustChanged");
  }
}

export default Layout;
