import MakiObject from "./MakiObject";
import { unimplementedWarning } from "../utils";

class Wac extends MakiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Wac";
  }

  getguid() {
    unimplementedWarning("getguid");
    return;
  }

  getname() {
    unimplementedWarning("getname");
    return;
  }

  sendcommand(cmd: string, param1: number, param2: number, param3: string) {
    unimplementedWarning("sendcommand");
    return;
  }

  show() {
    unimplementedWarning("show");
    return;
  }

  hide() {
    unimplementedWarning("hide");
    return;
  }

  isvisible() {
    unimplementedWarning("isvisible");
    return;
  }

  onnotify(notifstr: string, a: number, b: number): void {
    this.js_trigger("onNotify", notifstr, a, b);
  }

  onshow(): void {
    this.js_trigger("onShow");
  }

  onhide(): void {
    this.js_trigger("onHide");
  }

  setstatusbar(onoff: boolean) {
    unimplementedWarning("setstatusbar");
    return;
  }

  getstatusbar() {
    unimplementedWarning("getstatusbar");
    return;
  }
}

export default Wac;
