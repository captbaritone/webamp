import MakiObject from "./MakiObject";
import { unimplementedWarning } from "../utils";
import { XmlNode } from "../types";

type Command =
  | {
      name: string;
      id: number;
      checked: boolean;
      disabled: boolean;
    }
  | {
      name: "separator";
    };

class PopupMenu extends MakiObject {
  _commands: Command[];
  js_selectCommand: (id: number) => void;
  constructor(node: XmlNode, parent: MakiObject, annotations: Object) {
    super(node, parent, annotations);

    this._commands = [];
    this.js_selectCommand = (id: number) => {};
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
    this._commands.push({
      name: txt,
      id,
      checked,
      disabled,
    });
  }

  addseparator(): void {
    this._commands.push({ id: "separator" });
  }

  checkcommand(id: number, check: boolean) {
    unimplementedWarning("checkcommand");
  }

  popatmouse(): Promise<number> {
    this.attributes.x = this.parent.getmouseposx();
    this.attributes.y = this.parent.getmouseposy();
    return new Promise(resolve => {
      this.js_selectCommand = id => {
        this.parent.js_removeChild(this);
        this.parent.js_trigger("js_update");
        resolve(id);
      };

      this.parent.js_addChild(this);
      this.parent.js_trigger("js_update");
    });
  }

  addsubmenu(submenu: PopupMenu, submenutext: string) {
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
