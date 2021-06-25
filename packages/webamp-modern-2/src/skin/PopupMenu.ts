import BaseObject from "./BaseObject";

export default class PopupMenu extends BaseObject {
  addcommand(
    cmdText: string,
    cmd_id: number,
    checked: boolean,
    disabled: boolean
  ) {}
  addseparator() {}
  checkcommand(cmd_id: number, check: boolean) {
    // TODO
  }
  /*
extern PopupMenu.addSubMenu(PopupMenu submenu, String submenutext);
extern Int PopupMenu.popAtXY(int x, int y);
extern Int PopupMenu.popAtMouse();
extern Int PopupMenu.getNumCommands();
extern PopupMenu.disableCommand(int cmd_id, boolean disable);
  */
}
