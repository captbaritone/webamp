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

  ondock(side: number): void {
    this.js_trigger("onDock");
  }

  onundock(): void {
    this.js_trigger("onUnDock");
  }

  onscale(newscalevalue: number): void {
    this.js_trigger("onScale", newscalevalue);
  }

  getscale(): number {
    return unimplementedWarning("getscale");
  }

  setscale(scalevalue: number): void {
    return unimplementedWarning("setscale");
  }

  setdesktopalpha(onoff: boolean): void {
    return unimplementedWarning("setdesktopalpha");
  }

  getdesktopalpha(): boolean {
    return unimplementedWarning("getdesktopalpha");
  }

  center(): void {
    return unimplementedWarning("center");
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

  snapadjust(left: number, top: number, right: number, bottom: number): void {
    return unimplementedWarning("snapadjust");
  }

  getsnapadjusttop(): number {
    return unimplementedWarning("getsnapadjusttop");
  }

  getsnapadjustright(): number {
    return unimplementedWarning("getsnapadjustright");
  }

  getsnapadjustleft(): number {
    return unimplementedWarning("getsnapadjustleft");
  }

  getsnapadjustbottom(): number {
    return unimplementedWarning("getsnapadjustbottom");
  }

  setredrawonresize(wantredrawonresize: number): void {
    return unimplementedWarning("setredrawonresize");
  }

  beforeredock(): void {
    return unimplementedWarning("beforeredock");
  }

  redock(): void {
    return unimplementedWarning("redock");
  }

  istransparencysafe(): boolean {
    return unimplementedWarning("istransparencysafe");
  }

  islayoutanimationsafe(): boolean {
    return unimplementedWarning("islayoutanimationsafe");
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
