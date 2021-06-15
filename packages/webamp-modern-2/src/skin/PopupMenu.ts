import BaseObject from "./BaseObject";

export default class PopupMenu extends BaseObject {
  addcommand(
    cmdText: string,
    cmd_id: number,
    checked: boolean,
    disabled: boolean
  ) {}
  addseparator() {}
  /*
extern PopupMenu.addSubMenu(PopupMenu submenu, String submenutext);
extern Int PopupMenu.popAtXY(int x, int y);
extern Int PopupMenu.popAtMouse();
extern Int PopupMenu.getNumCommands();
extern PopupMenu.checkCommand(int cmd_id, boolean check);
extern PopupMenu.disableCommand(int cmd_id, boolean disable);
  */
}
