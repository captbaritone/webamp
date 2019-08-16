import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

class PopupMenu extends GuiObject {
  constructor(node, parent) {
    super(node, parent);

    this.commands = [];
    this.resolveCmdSelection = null;
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
      this.resolveCmdSelection = value => {
        this.parent.js_removeChild(this);
        this.parent.js_trigger("js_update");
        resolve(value);
      };

      this.parent.js_addChild(this);
      this.parent.js_trigger("js_update");
    });
  }
}

export default PopupMenu;
