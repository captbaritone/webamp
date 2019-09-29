import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";
import Region from "./Region";
import MakiMap from "./Map";

class Layer extends GuiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Layer";
  }

  setregion(reg: Region) {
    unimplementedWarning("setregion");
  }

  setregionfrommap(regionmap: MakiMap, threshold: number, reverse: boolean) {
    unimplementedWarning("setregion");
  }

  onbeginresize(x: number, y: number, w: number, h: number): void {
    this.js_trigger("onBeginResize", x, y, w, h);
  }

  onendresize(x: number, y: number, w: number, h: number): void {
    this.js_trigger("onEndResize", x, y, w, h);
  }

  fx_oninit() {
    unimplementedWarning("fx_oninit");
    return;
  }

  fx_onframe() {
    unimplementedWarning("fx_onframe");
    return;
  }

  fx_ongetpixelr(r: number, d: number, x: number, y: number) {
    unimplementedWarning("fx_ongetpixelr");
    return;
  }

  fx_ongetpixeld(r: number, d: number, x: number, y: number) {
    unimplementedWarning("fx_ongetpixeld");
    return;
  }

  fx_ongetpixelx(r: number, d: number, x: number, y: number) {
    unimplementedWarning("fx_ongetpixelx");
    return;
  }

  fx_ongetpixely(r: number, d: number, x: number, y: number) {
    unimplementedWarning("fx_ongetpixely");
    return;
  }

  fx_ongetpixela(r: number, d: number, x: number, y: number) {
    unimplementedWarning("fx_ongetpixela");
    return;
  }

  fx_setenabled(onoff: boolean) {
    unimplementedWarning("fx_setenabled");
    return;
  }

  fx_getenabled() {
    unimplementedWarning("fx_getenabled");
    return;
  }

  fx_setwrap(onoff: boolean) {
    unimplementedWarning("fx_setwrap");
    return;
  }

  fx_getwrap() {
    unimplementedWarning("fx_getwrap");
    return;
  }

  fx_setrect(onoff: boolean) {
    unimplementedWarning("fx_setrect");
    return;
  }

  fx_getrect() {
    unimplementedWarning("fx_getrect");
    return;
  }

  fx_setbgfx(onoff: boolean) {
    unimplementedWarning("fx_setbgfx");
    return;
  }

  fx_getbgfx() {
    unimplementedWarning("fx_getbgfx");
    return;
  }

  fx_setclear(onoff: boolean) {
    unimplementedWarning("fx_setclear");
    return;
  }

  fx_getclear() {
    unimplementedWarning("fx_getclear");
    return;
  }

  fx_setspeed(msperframe: number) {
    unimplementedWarning("fx_setspeed");
    return;
  }

  fx_getspeed() {
    unimplementedWarning("fx_getspeed");
    return;
  }

  fx_setrealtime(onoff: boolean) {
    unimplementedWarning("fx_setrealtime");
    return;
  }

  fx_getrealtime() {
    unimplementedWarning("fx_getrealtime");
    return;
  }

  fx_setlocalized(onoff: boolean) {
    unimplementedWarning("fx_setlocalized");
    return;
  }

  fx_getlocalized() {
    unimplementedWarning("fx_getlocalized");
    return;
  }

  fx_setbilinear(onoff: boolean) {
    unimplementedWarning("fx_setbilinear");
    return;
  }

  fx_getbilinear() {
    unimplementedWarning("fx_getbilinear");
    return;
  }

  fx_setalphamode(onoff: boolean) {
    unimplementedWarning("fx_setalphamode");
    return;
  }

  fx_getalphamode() {
    unimplementedWarning("fx_getalphamode");
    return;
  }

  fx_setgridsize(x: number, y: number) {
    unimplementedWarning("fx_setgridsize");
    return;
  }

  fx_update() {
    unimplementedWarning("fx_update");
    return;
  }

  fx_restart() {
    unimplementedWarning("fx_restart");
    return;
  }

  isinvalid() {
    unimplementedWarning("isinvalid");
    return;
  }
}

export default Layer;
