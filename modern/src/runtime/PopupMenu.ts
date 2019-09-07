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

  addcommand(
    txt: string,
    id: number,
    checked: boolean,
    disabled: boolean
  ): void {
    this.commands.push({
      name: txt,
      id,
      checked,
      disabled,
    });
  }

  addseparator(): void {
    this.commands.push({ id: "separator" });
  }

  checkcommand(id: number, check: boolean) {
    unimplementedWarning("checkcommand");
  }

  popatmouse() {
    this.attributes.x = this.parent.getmouseposx();
    this.attributes.y = this.parent.getmouseposy();
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

  addsubmenu(submenu, submenutext: string) {
    unimplementedWarning("addsubmenu");
    return;
  }

  popatxy(x: number, y: number) {
    unimplementedWarning("popatxy");
    return;
  }

  getnumcommands() {
    unimplementedWarning("getnumcommands");
    return;
  }

  disablecommand(cmd_id: number, disable: boolean) {
    unimplementedWarning("disablecommand");
    return;
  }
}

export default PopupMenu;
