import Group from "./Group";
import * as Utils from "../../utils";
import Container from "./Container";
import { LEFT, RIGHT, TOP, BOTTOM, CURSOR, MOVE } from "../Cursor";
import { px } from "../../utils";

// > A layout is a special kind of group, which shown inside a container. Each
// > layout represents an appearance for that window. Layouts give you the ability
// > to design different looks for the same container (or window). However, only
// > one layout can be visible at a time. You must toggle among layouts you
// > defined. An example is the normal mode and windowshade mode in the Default
// > skin.
//
// -- http://wiki.winamp.com/wiki/Modern_Skin:_Container
export default class Layout extends Group {
  static GUID = "60906d4e482e537e94cc04b072568861";
  _resizingDiv: HTMLDivElement = null;
  _resizing: boolean = false;
  _resizable: number = 0; // combination of 4 directions: N/E/W/S
  _movingStartX: number; //container XY
  _movingStartY: number;
  _moving: boolean = false;
  _snap = { left: 0, top: 0, right: 0, bottom: 0 };

  constructor() {
    super();
    this._isLayout = true;
  }

  setXmlAttr(key: string, value: string): boolean {
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "desktopalpha":
        this._desktopAlpha = Utils.toBool(value);
        break;
      default:
        return false;
    }
    return true;
  }

  // setParent(container: Container) {
  //   this._parent = container;
  // }

  getcontainer(): Container {
    return this._parent as unknown as Container;
  }

  gettop(): number {
    return this._parent._y;
  }

  /**
   * Get the X position, in the screen, of the
   * left edge of the object.
   *
   * @ret The left edge's position (in screen coordinates).
   */
  getleft(): number {
    return this._parent._x;
  }

  dispatchAction(
    action: string,
    param: string | null,
    actionTarget: string | null
  ) {
    // TODO: Maybe this should move to the container?
    if (actionTarget != null) {
      const target = this.findobject(actionTarget);
      if (target != null) {
        target.handleAction(action, param, actionTarget);
      }
      return;
    }
    switch (action) {
      default:
        if (this._parent != null) {
          this._parent.dispatchAction(action, param, actionTarget);
        }
    }
  }

  snapadjust(left: number, top: number, right: number, bottom: number) {
    this._snap.left = left;
    this._snap.top = top;
    this._snap.right = right;
    this._snap.bottom = bottom;
  }

  beforeredock() {
    // TODO:
  }

  redock() {
    // TODO:
  }

  getsnapadjustbottom(): number {
    return 100;
  }

  clienttoscreenh(h: number): number {
    return h;
  }

  islayoutanimationsafe(): boolean {
    return true;
  }

  init() {
    super.init();
    this.doResize();
  }


  setResizing(cmd: string, dx: number, dy: number) {
    const clampW = (w): number => {
      w = this._maximumWidth ? Math.min(w, this._maximumWidth) : w;
      w = this._minimumWidth ? Math.max(w, this._minimumWidth) : w;
      return w;
    };
    const clampH = (h): number => {
      h = this._maximumHeight ? Math.min(h, this._maximumHeight) : h;
      h = this._minimumHeight ? Math.max(h, this._minimumHeight) : h;
      return h;
    };
    const r = this._div.getBoundingClientRect();
    if (cmd == "constraint") {
      this._resizable = dx;
    } else if (cmd == "start") {
      this.bringtofront();
      this._resizing = true;
      this._resizingDiv = document.createElement("div");
      this._resizingDiv.className = "resizing";
      this._resizingDiv.style.cssText = "position:absolute; top:0; left:0;";
      this._resizingDiv.style.width = px(r.width);
      this._resizingDiv.style.height = px(r.height);
      this._div.appendChild(this._resizingDiv);
    } else if (dx == CURSOR && dy == CURSOR) {
      this._resizingDiv.style.cursor = cmd;
    } else if (cmd == "move") {
      if (!this._resizing) {
        return;
      }
      // console.log(`resizing dx:${dx} dy:${dy}`);
      if (this._resizable & RIGHT)
        this._resizingDiv.style.width = px(clampW(r.width + dx));
      if (this._resizable & BOTTOM)
        this._resizingDiv.style.height = px(clampH(r.height + dy));
      if (this._resizable & LEFT) {
        this._resizingDiv.style.left = px(dx);
        this._resizingDiv.style.width = px(clampW(r.width + -dx));
      }
      if (this._resizable & TOP) {
        this._resizingDiv.style.top = px(dy);
        this._resizingDiv.style.height = px(clampH(r.height + -dy));
      }
    } else if (cmd == "final") {
      if (!this._resizing) {
        return;
      }
      this._resizing = false;
      this.setXmlAttr("w", this._resizingDiv.offsetWidth.toString());
      this.setXmlAttr("h", this._resizingDiv.offsetHeight.toString());
      const container = this._parent;
      container.setXmlAttr(
        "x",
        (container._x + this._resizingDiv.offsetLeft).toString()
      );
      container.setXmlAttr(
        "y",
        (container._y + this._resizingDiv.offsetTop).toString()
      );
      this._resizingDiv.remove();
      this._resizingDiv = null;
    }
  }

  // MOVING THINGS =====================
  setMoving(cmd: string, dx: number, dy: number) {
    const container = this._parent;
    if (cmd == "start") {
      this._moving = true;
      this._movingStartX = container._x;
      this._movingStartY = container._y;
      this.bringtofront();
    } else if (dx == CURSOR && dy == CURSOR) {
    } else if (cmd == "move") {
      if (!this._moving) {
        return;
      }
      // console.log(`moving dx:${dx} dy:${dy}`);
      container.setXmlAttr("x", (this._movingStartX + dx).toString());
      container.setXmlAttr("y", (this._movingStartY + dy).toString());
    } else if (cmd == "final") {
      if (!this._moving) {
        return;
      }
      this._moving = false;
    }
  }
}
