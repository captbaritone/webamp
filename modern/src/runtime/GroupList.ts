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
    return unimplementedWarning("instantiate");
  }

  getnumitems(): number {
    return unimplementedWarning("getnumitems");
  }

  enumitem(num: number) {
    return unimplementedWarning("enumitem");
  }

  removeall(): void {
    return unimplementedWarning("removeall");
  }

  scrolltopercent(percent: number): void {
    return unimplementedWarning("scrolltopercent");
  }

  setredraw(redraw: number): void {
    return unimplementedWarning("setredraw");
  }
}

export default GroupList;
