import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

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

  setregion(reg) {
    unimplementedWarning("setregion");
  }

  setregionfrommap(regionmap, threshold, reverse) {
    unimplementedWarning("setregion");
  }

  onbeginresize(x, y, w, h) {
    unimplementedWarning("onbeginresize");
    return;
  }

  onendresize(x, y, w, h) {
    unimplementedWarning("onendresize");
    return;
  }

  fx_oninit() {
    unimplementedWarning("fx_oninit");
    return;
  }

  fx_onframe() {
    unimplementedWarning("fx_onframe");
    return;
  }

  fx_ongetpixelr(r, d, x, y) {
    unimplementedWarning("fx_ongetpixelr");
    return;
  }

  fx_ongetpixeld(r, d, x, y) {
    unimplementedWarning("fx_ongetpixeld");
    return;
  }

  fx_ongetpixelx(r, d, x, y) {
    unimplementedWarning("fx_ongetpixelx");
    return;
  }

  fx_ongetpixely(r, d, x, y) {
    unimplementedWarning("fx_ongetpixely");
    return;
  }

  fx_ongetpixela(r, d, x, y) {
    unimplementedWarning("fx_ongetpixela");
    return;
  }

  fx_setenabled(onoff) {
    unimplementedWarning("fx_setenabled");
    return;
  }

  fx_getenabled() {
    unimplementedWarning("fx_getenabled");
    return;
  }

  fx_setwrap(onoff) {
    unimplementedWarning("fx_setwrap");
    return;
  }

  fx_getwrap() {
    unimplementedWarning("fx_getwrap");
    return;
  }

  fx_setrect(onoff) {
    unimplementedWarning("fx_setrect");
    return;
  }

  fx_getrect() {
    unimplementedWarning("fx_getrect");
    return;
  }

  fx_setbgfx(onoff) {
    unimplementedWarning("fx_setbgfx");
    return;
  }

  fx_getbgfx() {
    unimplementedWarning("fx_getbgfx");
    return;
  }

  fx_setclear(onoff) {
    unimplementedWarning("fx_setclear");
    return;
  }

  fx_getclear() {
    unimplementedWarning("fx_getclear");
    return;
  }

  fx_setspeed(msperframe) {
    unimplementedWarning("fx_setspeed");
    return;
  }

  fx_getspeed() {
    unimplementedWarning("fx_getspeed");
    return;
  }

  fx_setrealtime(onoff) {
    unimplementedWarning("fx_setrealtime");
    return;
  }

  fx_getrealtime() {
    unimplementedWarning("fx_getrealtime");
    return;
  }

  fx_setlocalized(onoff) {
    unimplementedWarning("fx_setlocalized");
    return;
  }

  fx_getlocalized() {
    unimplementedWarning("fx_getlocalized");
    return;
  }

  fx_setbilinear(onoff) {
    unimplementedWarning("fx_setbilinear");
    return;
  }

  fx_getbilinear() {
    unimplementedWarning("fx_getbilinear");
    return;
  }

  fx_setalphamode(onoff) {
    unimplementedWarning("fx_setalphamode");
    return;
  }

  fx_getalphamode() {
    unimplementedWarning("fx_getalphamode");
    return;
  }

  fx_setgridsize(x, y) {
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
}

export default Layer;
