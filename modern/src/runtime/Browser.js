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

  navigateurl(url) {
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

  settargetname(targetname) {
    unimplementedWarning("settargetname");
    return;
  }

  onbeforenavigate(url, flags, targetframename) {
    unimplementedWarning("onbeforenavigate");
    return;
  }

  ondocumentcomplete(url) {
    unimplementedWarning("ondocumentcomplete");
    return;
  }
}

export default Browser;
