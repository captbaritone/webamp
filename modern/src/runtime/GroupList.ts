import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

class GroupList extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "GroupList";
  }

  instantiate(group_id: string, num_groups: number) {
    unimplementedWarning("instantiate");
    return;
  }

  getnumitems() {
    unimplementedWarning("getnumitems");
    return;
  }

  enumitem(num: number) {
    unimplementedWarning("enumitem");
    return;
  }

  removeall() {
    unimplementedWarning("removeall");
    return;
  }

  scrolltopercent(percent: number) {
    unimplementedWarning("scrolltopercent");
    return;
  }

  setredraw(redraw: number) {
    unimplementedWarning("setredraw");
    return;
  }
}

export default GroupList;
