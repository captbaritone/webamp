import { Skin, UIRoot } from "../../UIRoot";
import PopupMenu from "./PopupMenu";
import { IMenuItem, IPopupMenu, MenuItem } from "./MenuItem";

type MenuActionEvent = (menu: MenuItem, uiRoot: UIRoot) => void;
type MenuActionExecution = (uiRoot: UIRoot) => boolean | void;

type MenuAction = {
    onUpdate?: MenuActionEvent;     //? attemp to update disability, checkmark, visiblity, etc
    onExecute?: MenuActionExecution;    //? function to run when menu is clicked
}
const dummyAction: MenuAction = {
    onUpdate: (menu: MenuItem) => { },
    onExecute: (uiRoot: UIRoot) => false,
}

export const actions: { [key: number]: MenuAction } = {};
export const findAction = (menuId:number): MenuAction => {
    const registeredAction = actions[menuId] || {}
    return {...dummyAction, ...registeredAction}
}
export async function updateActions(popup: IPopupMenu, uiRoot: UIRoot) {
    return await Promise.all(
        popup.children.map(async (menuItem) => {
            if (menuItem.type == 'menuitem') {
                const action = findAction(menuItem.id);
                action.onUpdate(menuItem, uiRoot)
            } else if (menuItem.type == 'popup') {
                await updateActions(menuItem.popup, uiRoot)
            }
        })
    );
}

export const registerAction = (menuId: number, action: MenuAction) => {
    actions[menuId] = action;
}

registerAction(40037, { //? Time elapsed
    onUpdate: (menu: IMenuItem, uiRoot: UIRoot) => { menu.checked = !uiRoot.audio._timeRemaining },
    onExecute: (uiRoot: UIRoot) => { uiRoot.audio._timeRemaining = false; return true },
})

registerAction(40038, { //? Time remaining
    onUpdate: (menu: IMenuItem, uiRoot: UIRoot) => { menu.checked = uiRoot.audio._timeRemaining },
    onExecute: (uiRoot: UIRoot) => { uiRoot.audio._timeRemaining = true; return true },
})

registerAction(40039, { //? Time remaining
    onExecute: (uiRoot: UIRoot) => { uiRoot.audio.toggleRemainingTime(); return true },
})

registerAction(40044, { //? Previous
    onExecute: (uiRoot: UIRoot) => uiRoot.dispatch('prev')
})

registerAction(40045, { //? Play
    onExecute: (uiRoot: UIRoot) => uiRoot.dispatch('play')
})

registerAction(40046, { //? Pause
    onExecute: (uiRoot: UIRoot) => uiRoot.dispatch('pause')
})

registerAction(40047, { //? Stop
    onExecute: (uiRoot: UIRoot) => uiRoot.dispatch('stop')
})

registerAction(40048, { //? Next
    onExecute: (uiRoot: UIRoot) => uiRoot.dispatch('next')
})


registerAction(11111140038, { //? 
    onUpdate: (menu: MenuItem) => { }
})

registerAction(40244, { //? Equalizer Enabled
    onUpdate: (menu: IMenuItem, uiRoot: UIRoot) => { menu.checked = uiRoot.audio._eqEnabled },
    onExecute: (uiRoot: UIRoot) => { uiRoot.eq_toggle(); return true },
})

registerAction(40040, { //? View/ Playlist Editor
    onUpdate: (menu: IMenuItem, uiRoot: UIRoot) => {menu.checked = uiRoot.getActionState('toggle', 'guid:pl')},
    onExecute: (uiRoot: UIRoot) => { uiRoot.dispatch('toggle', 'guid:pl'); return true },
})

// registerAction(32767, { //? Skin, checked or not
//     onUpdate: (menu: IMenuItem, uiRoot: UIRoot) => {menu.checked = uiRoot.getSkinName() == menu.caption},
//     onExecute: (uiRoot: UIRoot) => { uiRoot.switchSkin(menu.data as Skin); return true },
// })

