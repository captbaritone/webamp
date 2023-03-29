import Group from "./Group";
import * as Utils from "../../utils";
import Container from "./Container";
import { LEFT, RIGHT, TOP, BOTTOM, CURSOR, MOVE } from "../Cursor";
import { px, unimplemented } from "../../utils";
import { UIRoot } from "../../UIRoot";

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
  _canResize: number = 0; // combination of 4 directions: N/E/W/S
  _scale: number = 1.0;
  _opacity: number = 1.0;
  _desktopalpha: boolean = false;
  _movingStartX: number; //container XY
  _movingStartY: number;
  _moving: boolean = false;
  _snap = { left: 0, top: 0, right: 0, bottom: 0 };

  constructor(uiRoot: UIRoot) {
    super(uiRoot);
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

  _renderBackground() {
    super._renderBackground(); //set css
    if (this._background != null && this._w == 0 && this._h == 0) {
      const bitmap = this._uiRoot.getBitmap(this._background);
      if (bitmap != null) {
        this._w = bitmap.getWidth();
        this._h = bitmap.getHeight();
        this._renderSize();
      }
    }
  }

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

  /**
   * Resize the object to the desired size and position.
   *
   * @param  x   The X position where to anchor the object before resize.
   * @param  y   The Y position where to anchor the object before resize.
   * @param  w   The width you wish the object to have.
   * @param  h   The height you wish the object to have.
   */
  resize(x: number, y: number, w: number, h: number) {
    const container = this._parent;
    container.setXmlAttr("x", String(x));
    container.setXmlAttr("y", String(y));

    this._w = w;
    this._h = h;
    this._renderDimensions();
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
    return unimplemented(100);
  }

  clienttoscreenh(h: number): number {
    return unimplemented(h);
  }

  islayoutanimationsafe(): boolean {
    return true;
  }
  istransparencysafe(): boolean {
    return true;
  }

  getscale(): number {
    return this._scale;
  }
  setscale(scalevalue: number) {
    this._scale = scalevalue;
    this.getDiv().style.transform = `scale(${this._scale})`;
  }

  setdesktopalpha(onoff: boolean) {
    this._desktopalpha = unimplemented(onoff);
  }
  getdesktopalpha(): boolean {
    return this._desktopalpha;
  }

  init() {
    super.init();
  }
  afterInited() {
    this._invalidateSize();
    this._uiRoot.vm.dispatch(this, "onstartup");
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
    const container = this._parent;
    const r = this._div.getBoundingClientRect();
    if (cmd == "constraint") {
      this._canResize = dx;
    } else if (cmd == "start") {
      this.bringtofront();
      this._resizing = true;
      this._resizingDiv = document.createElement("div");
      this._resizingDiv.className = "resizing";
      this._resizingDiv.style.cssText = "position:fixed;";
      this._resizingDiv.style.width = px(r.width);
      this._resizingDiv.style.height = px(r.height);
      this._resizingDiv.style.top = px(container.gettop());
      this._resizingDiv.style.left = px(container.getleft());
      this._div.appendChild(this._resizingDiv);
    } else if (dx == CURSOR && dy == CURSOR) {
      this._resizingDiv.style.cursor = cmd;
    } else if (cmd == "move") {
      if (!this._resizing) {
        return;
      }
      // console.log(`resizing dx:${dx} dy:${dy}`);
      if (this._canResize & RIGHT)
        this._resizingDiv.style.width = px(clampW(r.width + dx));
      if (this._canResize & BOTTOM)
        this._resizingDiv.style.height = px(clampH(r.height + dy));

      if (this._canResize & LEFT) {
        this._resizingDiv.style.left = px(container.getleft() + dx);
        this._resizingDiv.style.width = px(clampW(r.width + -dx));
      }
      if (this._canResize & TOP) {
        this._resizingDiv.style.top = px(container.gettop() + dy);
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
        this._resizingDiv /* container._x + */.offsetLeft
          .toString()
      );
      container.setXmlAttr(
        "y",
        this._resizingDiv /* container._y + */.offsetTop
          .toString()
      );
      this._resizingDiv.remove();
      this._resizingDiv = null;
      this._invalidateSize();
    }
  }

  // MOVING THINGS =====================
  setMoving(cmd: string, dx: number, dy: number) {
    const container = this._parent as unknown as Container;
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
      container.setLocation(this._movingStartX + dx, this._movingStartY + dy);
    } else if (cmd == "final") {
      if (!this._moving) {
        return;
      }
      this._invalidateSize();
      this._moving = false;
    }
  }
}
