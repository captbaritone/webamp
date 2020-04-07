import MakiObject from "./MakiObject";
import { unimplementedWarning } from "../utils";
import { XmlNode } from "../types";
import Group from "./Group";

type Command =
  | {
      name: string;
      id: number;
      checked: boolean;
      disabled: boolean;
    }
  | {
      id: "separator";
    };

class PopupMenu extends MakiObject {
  _commands: Command[];
  _guiParent: Group;
  parent: MakiObject;
  js_selectCommand: (id: number) => void;

  constructor(node: XmlNode, parent: MakiObject, annotations: Object) {
    super(node, parent, annotations);
    this.parent = parent;

    if (!(parent instanceof Group)) {
      throw new Error(
        "Tried to create a PopupMenu with a parent that is not a GuiObject"
      );
    }
    // MakiOjbect.parent is just a MakiObject, but we expect the parent to have GuiObject properties/methods.
    this._guiParent = parent;

    this._commands = [];
    this.js_selectCommand = (id: number) => {};
  }

  js_getCommands(): Command[] {
    return this._commands;
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
    this._commands.push({ name: txt, id, checked, disabled });
  }

  addseparator(): void {
    this._commands.push({ id: "separator" });
  }

  checkcommand(id: number, check: boolean): void {
    unimplementedWarning("checkcommand");
  }

  popatmouse(): Promise<number> {
    this.attributes.x = this._guiParent.getmouseposx();
    this.attributes.y = this._guiParent.getmouseposy();
    return new Promise((resolve) => {
      this.js_selectCommand = (id) => {
        this.parent.js_removeChild(this);
        this.parent.js_trigger("js_update");
        resolve(id);
      };

      this.parent.js_addChild(this);
      this.parent.js_trigger("js_update");
    });
  }

  addsubmenu(submenu: PopupMenu, submenutext: string): void {
    return unimplementedWarning("addsubmenu");
  }

  popatxy(x: number, y: number): number {
    return unimplementedWarning("popatxy");
  }

  getnumcommands(): number {
    return unimplementedWarning("getnumcommands");
  }

  disablecommand(cmd_id: number, disable: boolean): void {
    return unimplementedWarning("disablecommand");
  }
}

export default PopupMenu;
