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

  navigateurl(url: string) {
    unimplementedWarning("navigateurl");
    return;
  }

  back() {
    unimplementedWarning("back");
    return;
  }

  forward() {
    unimplementedWarning("forward");
    return;
  }

  stop() {
    unimplementedWarning("stop");
    return;
  }

  refresh() {
    unimplementedWarning("refresh");
    return;
  }

  home() {
    unimplementedWarning("home");
    return;
  }

  settargetname(targetname: string) {
    unimplementedWarning("settargetname");
    return;
  }

  onbeforenavigate(url: string, flags: number, targetframename: string): void {
    this.js_trigger("onBeforeNavigate", url, flags, targetframename);
  }

  ondocumentcomplete(url: string): void {
    this.js_trigger("onDocumentComplete", url);
  }
}

export default Browser;
