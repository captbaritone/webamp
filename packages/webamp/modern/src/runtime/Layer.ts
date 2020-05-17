import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";
import Region from "./Region";
import MakiMap from "./MakiMap";

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

  setregion(reg: Region): void {
    unimplementedWarning("setregion");
  }

  setregionfrommap(
    regionmap: MakiMap,
    threshold: number,
    reverse: boolean
  ): void {
    unimplementedWarning("setregion");
  }

  onbeginresize(x: number, y: number, w: number, h: number): void {
    this.js_trigger("onBeginResize", x, y, w, h);
  }

  onendresize(x: number, y: number, w: number, h: number): void {
    this.js_trigger("onEndResize", x, y, w, h);
  }

  fx_oninit(): void {
    return unimplementedWarning("fx_oninit");
  }

  fx_onframe(): void {
    return unimplementedWarning("fx_onframe");
  }

  fx_ongetpixelr(r: number, d: number, x: number, y: number): number {
    return unimplementedWarning("fx_ongetpixelr");
  }

  fx_ongetpixeld(r: number, d: number, x: number, y: number): number {
    return unimplementedWarning("fx_ongetpixeld");
  }

  fx_ongetpixelx(r: number, d: number, x: number, y: number): number {
    return unimplementedWarning("fx_ongetpixelx");
  }

  fx_ongetpixely(r: number, d: number, x: number, y: number): number {
    return unimplementedWarning("fx_ongetpixely");
  }

  fx_ongetpixela(r: number, d: number, x: number, y: number): number {
    return unimplementedWarning("fx_ongetpixela");
  }

  fx_setenabled(onoff: boolean): void {
    return unimplementedWarning("fx_setenabled");
  }

  fx_getenabled(): boolean {
    return unimplementedWarning("fx_getenabled");
  }

  fx_setwrap(onoff: boolean): void {
    return unimplementedWarning("fx_setwrap");
  }

  fx_getwrap(): boolean {
    return unimplementedWarning("fx_getwrap");
  }

  fx_setrect(onoff: boolean): void {
    return unimplementedWarning("fx_setrect");
  }

  fx_getrect(): boolean {
    return unimplementedWarning("fx_getrect");
  }

  fx_setbgfx(onoff: boolean): void {
    return unimplementedWarning("fx_setbgfx");
  }

  fx_getbgfx(): boolean {
    return unimplementedWarning("fx_getbgfx");
  }

  fx_setclear(onoff: boolean): void {
    return unimplementedWarning("fx_setclear");
  }

  fx_getclear(): boolean {
    return unimplementedWarning("fx_getclear");
  }

  fx_setspeed(msperframe: number): void {
    return unimplementedWarning("fx_setspeed");
  }

  fx_getspeed(): number {
    return unimplementedWarning("fx_getspeed");
  }

  fx_setrealtime(onoff: boolean): void {
    return unimplementedWarning("fx_setrealtime");
  }

  fx_getrealtime(): boolean {
    return unimplementedWarning("fx_getrealtime");
  }

  fx_setlocalized(onoff: boolean): void {
    return unimplementedWarning("fx_setlocalized");
  }

  fx_getlocalized(): boolean {
    return unimplementedWarning("fx_getlocalized");
  }

  fx_setbilinear(onoff: boolean): void {
    return unimplementedWarning("fx_setbilinear");
  }

  fx_getbilinear(): boolean {
    return unimplementedWarning("fx_getbilinear");
  }

  fx_setalphamode(onoff: boolean): void {
    return unimplementedWarning("fx_setalphamode");
  }

  fx_getalphamode(): boolean {
    return unimplementedWarning("fx_getalphamode");
  }

  fx_setgridsize(x: number, y: number): void {
    return unimplementedWarning("fx_setgridsize");
  }

  fx_update(): void {
    return unimplementedWarning("fx_update");
  }

  fx_restart(): void {
    return unimplementedWarning("fx_restart");
  }

  isinvalid(): boolean {
    return unimplementedWarning("isinvalid");
  }
}

export default Layer;
