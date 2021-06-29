import BaseObject from "./BaseObject";
import { assume } from "../utils";

type MenuItem =
  | {
      type: "item";
      text: string;
      id: number;
      checked: boolean;
      disabled: boolean;
    }
  | { type: "separator" };

export default class PopupMenu extends BaseObject {
  _items: MenuItem[] = [];
  addcommand(
    cmdText: string,
    cmd_id: number,
    checked: boolean,
    disabled: boolean
  ) {
    this._items.push({
      type: "item",
      text: cmdText,
      id: cmd_id,
      checked,
      disabled,
    });
  }
  addseparator() {
    this._items.push({ type: "separator" });
  }
  checkcommand(cmd_id: number, check: boolean) {
    const item = this._items.find((item) => {
      return item.type === "item" && item.id === cmd_id;
    });
    assume(item != null, `Could not find item with id "${cmd_id}"`);
    if (item.type !== "item") {
      throw new Error("Expected item to be an item.");
    }
    item.checked = check;
  }
  /*
extern PopupMenu.addSubMenu(PopupMenu submenu, String submenutext);
extern Int PopupMenu.popAtXY(int x, int y);
extern Int PopupMenu.popAtMouse();
extern Int PopupMenu.getNumCommands();
extern PopupMenu.disableCommand(int cmd_id, boolean disable);
  */
}
