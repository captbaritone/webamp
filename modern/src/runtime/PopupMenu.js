import MakiObject from "./MakiObject";
import { unimplementedWarning } from "../utils";

class PopupMenu extends MakiObject {
  constructor(node, parent) {
    super(node, parent);

    this.commands = [];
    this.js_selectCommand = null;
  }

  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "PopupMenu";
  }

  addcommand(txt, id, checked, disabled) {
    this.commands.push({
      name: txt,
      id,
      checked,
      disabled,
    });
  }

  addseparator() {
    this.commands.push({ id: "separator" });
  }

  checkcommand(id, check) {
    unimplementedWarning("checkcommand");
  }

  popatmouse() {
    return new Promise(resolve => {
      this.js_selectCommand = value => {
        this.parent.js_removeChild(this);
        this.parent.js_trigger("js_update");
        resolve(value);
      };

      this.parent.js_addChild(this);
      this.parent.js_trigger("js_update");
    });
  }

  addsubmenu(submenu, submenutext) {
    unimplementedWarning("addsubmenu");
    return;
  }

  popatxy(x, y) {
    unimplementedWarning("popatxy");
    return;
  }

  getnumcommands() {
    unimplementedWarning("getnumcommands");
    return;
  }

  disablecommand(cmd_id, disable) {
    unimplementedWarning("disablecommand");
    return;
  }
}

export default PopupMenu;
