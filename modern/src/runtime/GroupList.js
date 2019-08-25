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

  instantiate(group_id, num_groups) {
    unimplementedWarning("instantiate");
    return;
  }

  getnumitems() {
    unimplementedWarning("getnumitems");
    return;
  }

  enumitem(num) {
    unimplementedWarning("enumitem");
    return;
  }

  removeall() {
    unimplementedWarning("removeall");
    return;
  }

  scrolltopercent(percent) {
    unimplementedWarning("scrolltopercent");
    return;
  }
}

export default GroupList;
