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

  getguid(): string {
    return unimplementedWarning("getguid");
  }

  getname(): string {
    return unimplementedWarning("getname");
  }

  sendcommand(
    cmd: string,
    param1: number,
    param2: number,
    param3: string
  ): number {
    return unimplementedWarning("sendcommand");
  }

  show(): void {
    return unimplementedWarning("show");
  }

  hide(): void {
    return unimplementedWarning("hide");
  }

  isvisible(): boolean {
    return unimplementedWarning("isvisible");
  }

  onnotify(command: string, param: string, a: number, b: number): number {
    this.js_trigger("onNotify", command, param, a, b);
    return unimplementedWarning("onnotify");
  }

  onshow(): void {
    this.js_trigger("onShow");
  }

  onhide(): void {
    this.js_trigger("onHide");
  }

  setstatusbar(onoff: boolean): void {
    return unimplementedWarning("setstatusbar");
  }

  getstatusbar(): boolean {
    return unimplementedWarning("getstatusbar");
  }
}

export default Wac;
