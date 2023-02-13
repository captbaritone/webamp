import BaseObject from "./BaseObject";
import { assume } from "../../utils";
// import { sleep } from 'deasync';
// import { deasync } from '@kaciras/deasync';
// import sp from 'synchronized-promise';

// taken from sp test
const asyncFunctionBuilder = (success) => (value, timeouts = 1000) => {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      if (success) {
        resolve(value)
      } else {
        reject(new TypeError(value))
      }
    }, timeouts)
  })
}
// const async_sleep = (timeout) => {
// 	// setTimeout(() => done(null, "wake up!"), timeout);
//   const done = () => {}
//   setTimeout(done, timeout)
// };
// const sleep = sp(async_sleep)
// const sleep = sp(asyncFunctionBuilder(true))

type MenuItem =
  | {
      type: "item";
      text: string;
      id: number;
      checked: boolean;
      disabled: boolean;
    }
  | { type: "separator" }
  | { 
      type: "submenu"; 
      text: string;
      popup: PopupMenu; 
    };

function waitPopup(popup: PopupMenu): number {
  let result: number = -1;
  const itemClick = (id:number) => {
    result = id
  }
  const div = generatePopupDiv(popup, itemClick)
  document.getElementById('web-amp').appendChild(div);


  // const sleep = asyncFunctionBuilder(true)
  // while (result < 0){
  //   sleep(100);
  // }
  // return result;

  // https://stackoverflow.com/questions/54916739/wait-for-click-event-inside-a-for-loop-similar-to-prompt
  // return new Promise(acc => {
  //   function handleClick() {
  //     document.removeEventListener('click', handleClick);
  //     acc(result);
  //   }
  //   document.addEventListener('click', handleClick);
  // });
  return 1
}

function generatePopupDiv(popup: PopupMenu, callback: Function): HTMLElement {
  const root = document.createElement('ul');
  root.style.zIndex = '1000';
  for( const menu of popup._items){
    const item = document.createElement('li')
    root.appendChild(item)
    if(menu.type=='item'){
      item.textContent = menu.text;
      item.onclick = (e) => callback(item.id)
    }
    else if(menu.type=='submenu'){
      item.textContent = menu.text
    }
    else if(menu.type=='separator'){
      item.textContent = '-----'
    }
  }
  return root
}

export default class PopupMenu extends BaseObject {
  static GUID = "f4787af44ef7b2bb4be7fb9c8da8bea9";
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
  addsubmenu(submenu: PopupMenu, submenutext: string){
    this._items.push({ type: "submenu", popup: submenu, text: submenutext });
    // // TODO:
    // this.addcommand(submenutext, 0, false, false)
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
  disablecommand(cmd_id:number, disable: boolean){
    for (const item of this._items) {
      if(item.type == 'item' && item.id == cmd_id){
        item.disabled = disable;
        break;
      }
    }
  }
  // async popatmouse(): Promise<number> {
  //   return await waitPopup(this)
  // }
  // popatxy(x:number, y:number):number{
  //   return waitPopup(this)

  // }
  popatmouse(): number {
    const message = this._items.map((item) => {
      switch (item.type) {
        case "separator":
          return "------";
        case "item":
          return `(${item.id}) ${item.text}${item.checked ? " ✔" : ""}`;
      }
    });
    message.unshift("Pick the number matching your choice:\n");
    let choice: number | null = null;
    while (
      !this._items.some((item) => item.type === "item" && item.id === choice)
    ) {
      choice = Number(window.prompt(message.join("\n")));
      if(choice==0) break;
    }
    // TODO: Validate

    return choice;
  }
  popatxy(x:number, y:number):number{
    return this.popatmouse()
  }
  getnumcommands(){
    return this._items.length;
  }

}
