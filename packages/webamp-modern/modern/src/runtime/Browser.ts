import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

class Browser extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Browser";
  }

  navigateurl(url: string): void {
    return unimplementedWarning("navigateurl");
  }

  back(): void {
    return unimplementedWarning("back");
  }

  forward(): void {
    return unimplementedWarning("forward");
  }

  stop(): void {
    return unimplementedWarning("stop");
  }

  refresh(): void {
    return unimplementedWarning("refresh");
  }

  home(): void {
    return unimplementedWarning("home");
  }

  settargetname(targetname: string): void {
    return unimplementedWarning("settargetname");
  }

  onbeforenavigate(url: string, flags: number, targetframename: string): void {
    this.js_trigger("onBeforeNavigate", url, flags, targetframename);
  }

  ondocumentcomplete(url: string): void {
    this.js_trigger("onDocumentComplete", url);
  }

  ondocumentready(url: string): void {
    return unimplementedWarning("ondocumentready");
  }

  getdocumenttitle(): string {
    return unimplementedWarning("getdocumenttitle");
  }

  onnavigateerror(url: string, code: number): void {
    return unimplementedWarning("onnavigateerror");
  }

  setcancelieerrorpage(cancel: boolean): void {
    return unimplementedWarning("setcancelieerrorpage");
  }

  scrape(): void {
    return unimplementedWarning("scrape");
  }

  onmedialink(url: string): string {
    return unimplementedWarning("onmedialink");
  }
}

export default Browser;
