import BaseObject from "./BaseObject";
import { assume, px } from "../../utils";
import {
  MenuItem,
  IPopupMenu,
  generatePopupDiv,
  extractCaption,
  ICLoseablePopup,
  destroyActivePopup,
  setActivePopup,
  deactivePopup,
  IMenuItem,
} from "./MenuItem";
import { Skin, UIRoot } from "../../UIRoot";
import { registerAction } from "./menuWa5actions";
// import { sleep } from 'deasync';
// import { deasync } from '@kaciras/deasync';
// import sp from 'synchronized-promise';

// taken from sp test
// const asyncFunctionBuilder =
//   (success) =>
//   (value, timeouts = 1000) => {
//     return new Promise((resolve, reject) => {
//       setTimeout(function () {
//         if (success) {
//           resolve(value);
//         } else {
//           reject(new TypeError(value));
//         }
//       }, timeouts);
//     });
//   };
// const async_sleep = (timeout) => {
// 	// setTimeout(() => done(null, "wake up!"), timeout);
//   const done = () => {}
//   setTimeout(done, timeout)
// };
// const sleep = sp(async_sleep)
// const sleep = sp(asyncFunctionBuilder(true))

function waitPopup(popup: PopupMenu, x = 0, y = 0): Promise<number> {
  // const closePopup = () => div.remove();

  // https://stackoverflow.com/questions/54916739/wait-for-click-event-inside-a-for-loop-similar-to-prompt
  return new Promise((acc) => {
    // let result: number = -1;
    const itemClick = (id: number) => {
      closePopup();
      // result = id;
      acc(id);
    };
    const div = generatePopupDiv(popup, itemClick);
    if (x || y) {
      div.style.left = px(x);
      div.style.top = px(y);
    }
    document.getElementById("web-amp").appendChild(div);
    const closePopup = () => {
      div.remove();
      popup._successPromise = null;
    };
    const outsideClick = (ret: number) => {
      closePopup();
      acc(ret);
    };
    popup._successPromise = outsideClick;

    function handleClick() {
      document.removeEventListener("click", handleClick);
      closePopup();
      acc(-1);
    }
    document.addEventListener("click", handleClick);
  });
  // return 1;
}

export default class PopupMenu
  extends BaseObject
  implements IPopupMenu, ICLoseablePopup
{
  static GUID = "f4787af44ef7b2bb4be7fb9c8da8bea9";
  children: MenuItem[] = [];
  _uiRoot: UIRoot;

  constructor(uiRoot: UIRoot) {
    super();
    this._uiRoot = uiRoot;

    // this._div = document.createElement(
    //   this.getElTag().toLowerCase().replace("_", "")
    // );
  }
  private _addcommand(
    cmdText: string,
    cmd_id: number,
    checked: boolean = false,
    disabled: boolean = false,
    data: { [key: string]: any } = {}
  ) {
    this.children.push({
      type: "menuitem",
      // caption: cmdText,
      ...extractCaption(cmdText),
      id: cmd_id,
      checked,
      disabled,
      data,
    });
  }
  addcommand(
    cmdText: string,
    cmd_id: number,
    checked: boolean,
    disabled: boolean
  ) {
    if (cmd_id == 32767) {
      this._loadSkins();
      return;
    }
    this._addcommand(cmdText, cmd_id, checked, disabled);
  }
  addseparator() {
    this.children.push({ type: "separator" });
  }
  addsubmenu(popup: PopupMenu, submenutext: string) {
    // this.children.push({ type: "popup", popup: popup, caption: submenutext });
    this.children.push({
      type: "popup",
      popup: popup,
      ...extractCaption(submenutext),
    });
    // // TODO:
    // this.addcommand(submenutext, 0, false, false)
  }
  checkcommand(cmd_id: number, check: boolean) {
    const item = this.children.find((item) => {
      return item.type === "menuitem" && item.id === cmd_id;
    });
    assume(item != null, `Could not find item with id "${cmd_id}"`);
    if (item.type !== "menuitem") {
      throw new Error("Expected item to be an item.");
    }
    item.checked = check;
  }
  disablecommand(cmd_id: number, disable: boolean) {
    for (const item of this.children) {
      if (item.type == "menuitem" && item.id == cmd_id) {
        item.disabled = disable;
        break;
      }
    }
  }

  async popatmouse(): Promise<number> {
    console.log("popAtMouse.start...:");
    const mousePos = this._uiRoot._mousePos;
    // const result = await waitPopup(this, mousePos.x, mousePos.y)
    const result = await this.popatxy(mousePos.x, mousePos.y);
    console.log("popAtMouse.return:", result);
    return result;
  }
  async popatxy(x: number, y: number): Promise<number> {
    destroyActivePopup();
    setActivePopup(this);
    const ret = await waitPopup(this, x, y);
    deactivePopup(this);
    // setActivePopup(this)
    // this._showButton(this._elDown);
    // this._div.classList.add("open");

    // ACTIVE_MENU = this;
    return ret;
  }

  /**
   * called by such Menu to close this pupup in favour of
   * that Menu want to show their own popup (user click that Menu)
   */
  doClosePopup() {
    if (this._successPromise) {
      this._successPromise(-1);
    }
  }
  _successPromise: Function = null;

  _loadSkins() {
    let action_id = 32767;
    this._uiRoot._skins.forEach((skin) => {
      const name = typeof skin === "string" ? skin : skin.name;
      const url = typeof skin === "string" ? skin : skin.url;
      const skin_info: Skin = { name, url };
      action_id++;

      registerAction(action_id, {
        //? Skin, checked or not
        onUpdate: (menu: IMenuItem, uiRoot: UIRoot) => {
          menu.checked =
            uiRoot.getSkinName() == menu.caption ||
            uiRoot.getSkinUrl() == menu.data.url;
        },
        onExecute: (uiRoot: UIRoot) => {
          uiRoot.switchSkin(skin_info);
          return true;
        },
      });
      this._addcommand(name, action_id, false, false, skin_info);
    });
  }

  // popatmouse(): number {
  //   const message = this.children.map((item) => {
  //     switch (item.type) {
  //       case "separator":
  //         return "------";
  //       case "item":
  //         return `(${item.id}) ${item.text}${item.checked ? " ✔" : ""}`;
  //     }
  //   });
  //   message.unshift("Pick the number matching your choice:\n");
  //   let choice: number | null = null;
  //   while (
  //     !this.children.some((item) => item.type === "item" && item.id === choice)
  //   ) {
  //     choice = Number(window.prompt(message.join("\n")));
  //     if (choice == 0) break;
  //   }
  //   // TODO: Validate

  //   return choice;
  // }
  // popatxy(x: number, y: number): number {
  //   return this.popatmouse();
  // }
  getnumcommands() {
    return this.children.length;
  }

  hideMenu(cmd_id: number) {
    for (const item of this.children) {
      if (item.type == "menuitem" && item.id == cmd_id) {
        item.invisible = true;
        break;
      }
    }
  }
}
