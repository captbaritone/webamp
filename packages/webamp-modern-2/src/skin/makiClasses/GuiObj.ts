import UI_ROOT from "../../UIRoot";
import { assert, num, toBool, px, assume, relat } from "../../utils";
import Bitmap from "../Bitmap";
import Group from "./Group";
import XmlObj from "../XmlObj";
import Layout from "./Layout";
import { LEFT, RIGHT, TOP, BOTTOM, CURSOR, MOVE } from "../Cursor";

let BRING_LEAST: number = -1;
let BRING_MOST_TOP: number = 1;

// http://wiki.winamp.com/wiki/XML_GUI_Objects#GuiObject_.28Global_params.29
export default class GuiObj extends XmlObj {
  static GUID = "4ee3e1994becc636bc78cd97b028869c";
  _parent: Group;
  _id: string;
  _width: number;
  _height: number;
  _x: number = 0;
  _y: number = 0;
  _minimumHeight: number = 0;
  _maximumHeight: number = 0;
  _minimumWidth: number = 0;
  _maximumWidth: number = 0;
  _relatx: string;
  _relaty: string;
  _relatw: string;
  _relath: string;
  _resize: string;
  _droptarget: string;
  _visible: boolean = true;
  _alpha: number = 255;
  _ghost: boolean = false;
  _movable: boolean = false;
  _resizable: number = 0;
  _tooltip: string = "";
  _targetX: number | null = null;
  _targetY: number | null = null;
  _targetWidth: number | null = null;
  _targetHeight: number | null = null;
  _targetAlpha: number | null = null;
  _targetSpeed: number | null = null;
  _goingToTarget: boolean = false;
  _div: HTMLDivElement = document.createElement("div");
  _backgroundBitmap: Bitmap | null = null;
  _resizingEventsRegisterd: boolean = false;
  _movingEventsRegisterd: boolean = false;

  constructor() {
    super();

    this._div.addEventListener("mousedown", (e) => {
      /*
      if (this._backgroundBitmap != null) {
        const { clientX, clientY } = e;
        const { x, y } = this._div.getBoundingClientRect();
        const canvasX = clientX - x;
        const canvasY = clientY - y;
        const canvas = this._backgroundBitmap.getCanvas();
        const ctx = canvas.getContext("2d");

        const opacity = ctx.getImageData(canvasX, canvasY, 1, 1).data[3];
        if (opacity === 0) {
          this._div.style.pointerEvents = "none";
          const newTarget = document.elementFromPoint(clientX, clientY);
          this._div.style.pointerEvents = "auto";
          var newEvent = new MouseEvent("click", {
            clientX,
            clientY,
            bubbles: true,
          });
          newTarget.dispatchEvent(newEvent);
          return;
        }
      }
     */
      this.onLeftButtonDown(e.clientX, e.clientY);

      const mouseUpHandler = (e) => {
        this.onLeftButtonUp(e.clientX, e.clientY);
        this._div.removeEventListener("mouseup", mouseUpHandler);
      };
      this._div.addEventListener("mouseup", mouseUpHandler);
    });
    this._div.addEventListener("mouseenter", (e) => {
      this.onEnterArea();
    });

    this._div.addEventListener("mouseleave", (e) => {
      this.onLeaveArea();
    });
  }

  setParent(group: Group) {
    this._parent = group;
  }

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    switch (key) {
      case "id":
        this._id = value.toLowerCase();
        break;
      case "w":
      case "default_w":
        this._width = num(value);
        this._renderWidth();
        break;
      case "h":
      case "default_h":
        this._height = num(value);
        this._renderHeight();
        break;
      case "x":
      case "default_x":
        this._x = num(value) ?? 0;
        this._renderX();
        break;
      case "y":
      case "default_y":
        this._y = num(value) ?? 0;
        this._renderY();
        break;
      case "minimum_h":
        this._minimumHeight = num(value);
        break;
      case "minimum_w":
        this._minimumWidth = num(value);
        break;
      case "maximum_h":
        this._maximumHeight = num(value);
        break;
      case "maximum_w":
        this._maximumWidth = num(value);
        break;
      case "relatw":
        this._relatw = value;
        break;
      case "relath":
        this._relath = value;
        break;
      case "relatx":
        this._relatx = value;
        break;
      case "relaty":
        this._relaty = value;
        break;
      case "droptarget":
        this._droptarget = value;
        break;
      case "ghost":
        this._ghost = toBool(value);
        break;
      case "visible":
        this._visible = toBool(value);
        this._renderVisibility();
        break;
      case "move":
        this._movable = toBool(value);
        this._renderCssCursor();
        break;
      case "resize":
        this._resize = value == "0" ? "" : value;
        this._renderCssCursor();
        break;
      case "tooltip":
        this._tooltip = value;
        break;
      // (int) An integer [0,255] specifying the alpha blend mode of the object (0 is transparent, 255 is opaque). Default is 255.
      case "alpha":
        this._alpha = num(value);
      default:
        return false;
    }
    return true;
  }

  init() {
    // pass
  }

  getDiv(): HTMLDivElement {
    return this._div;
  }

  getId(): string {
    return this._id;
  }

  /**
   * Trigger the show event.
   */
  show() {
    this._visible = true;
    this._renderVisibility();
  }

  /**
   * Trigger the hide event.
   */
  hide() {
    this._visible = false;
    this._renderVisibility();
  }

  /**
   * Get the Y position, in the screen, of the
   * top edge of the object.
   *
   * @ret The top edge's position (in screen coordinates).
   */
  gettop(): number {
    return this._y;
  }

  /**
   * Get the X position, in the screen, of the
   * left edge of the object.
   *
   * @ret The left edge's position (in screen coordinates).
   */
  getleft(): number {
    return this._x;
  }

  /**
   * Get the height of the object, in pixels.
   *
   * @ret The height of the object.
   */
  getheight(): number {
    if (this._height || this._minimumHeight || this._maximumHeight) {
      let h = Math.max(this._height || 0, this._minimumHeight);
      h = Math.min(h, this._maximumHeight || h);
      return h;
    }
    return this._height;
  }

  /**
   * Get the width of the object, in pixels.
   *
   * @ret The width of the object.
   */
  getwidth(): number {
    if (this._width || this._minimumWidth || this._maximumWidth) {
      let w = Math.max(this._width || 0, this._minimumWidth);
      if (this._maximumHeight) {
        w = Math.min(w, this._maximumWidth || w);
      }
      return w;
    }
    return this._width;
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
    this._x = x;
    this._y = y;
    this._width = w;
    this._height = h;
    this._renderDimensions();
  }

  _renderCssCursor() {
    this._resizable = 0; //flag. replace soon
    switch (this._resize) {
      case "right":
        this._div.style.cursor = "e-resize";
        this._resizable = RIGHT;
        break;
      case "left":
        this._div.style.cursor = "w-resize";
        this._resizable = LEFT;
        break;
      case "top":
        this._div.style.cursor = "n-resize";
        this._resizable = TOP;
        break;
      case "bottom":
        this._div.style.cursor = "s-resize";
        this._resizable = BOTTOM;
        break;
      case "topleft":
        this._div.style.cursor = "nw-resize";
        this._resizable = TOP | LEFT;
        break;
      case "topright":
        this._div.style.cursor = "ne-resize";
        this._resizable = TOP | RIGHT;
        break;
      case "bottomleft":
        this._div.style.cursor = "sw-resize";
        this._resizable = BOTTOM | LEFT;
        break;
      case "bottomright":
        this._div.style.cursor = "se-resize";
        this._resizable = BOTTOM | RIGHT;
        break;
      default:
        // this._div.style.removeProperty('cursor');
        this._resizable = 0;
    }
    if (this._movable) {
      // this._div.style.cursor = "move";
      this._resizable = MOVE;
      this._registerMovingEvents();
    } else if (this._resizable == 0) {
      this._div.style.removeProperty("cursor");
    } else {
      this._div.style.pointerEvents = "auto";
      this._registerResizingEvents();
    }
  }

  _registerResizingEvents() {
    if (this._resizingEventsRegisterd) {
      return;
    }
    this._resizingEventsRegisterd = true;
    this._div.addEventListener("mousedown", this._handleResizing.bind(this));
  }

  _unregisterResizingEvents() {
    if (this._resizingEventsRegisterd) {
      this._div.removeEventListener("mousedown", this._handleResizing);
      this._resizingEventsRegisterd = false;
    }
  }

  _handleResizing(downEvent: MouseEvent) {
    if (downEvent.button != 0) return; // only care LeftButton
    downEvent.stopPropagation();
    const layout = this.getparentlayout() as Layout;
    layout.setResizing("constraint", this._resizable, 0);
    layout.setResizing("start", 0, 0);
    layout.setResizing(
      this._div.style.getPropertyValue("cursor"),
      CURSOR,
      CURSOR
    );
    const startX = downEvent.clientX;
    const startY = downEvent.clientY;

    const handleMove = (moveEvent: MouseEvent) => {
      const newMouseX = moveEvent.clientX;
      const newMouseY = moveEvent.clientY;
      const deltaY = newMouseY - startY;
      const deltaX = newMouseX - startX;
      layout.setResizing("move", deltaX, deltaY);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      if (upEvent.button != 0) return; // only care LeftButton
      upEvent.stopPropagation();
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleMouseUp);
      const newMouseX = upEvent.clientX;
      const newMouseY = upEvent.clientY;
      const deltaY = newMouseY - startY;
      const deltaX = newMouseX - startX;
      layout.setResizing("final", deltaX, deltaY);
    };
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  _registerMovingEvents() {
    if (this._movingEventsRegisterd) {
      return;
    }
    this._movingEventsRegisterd = true;
    this._div.addEventListener("mousedown", this._handleMoving.bind(this));
  }

  _unregisterMovingEvents() {
    if (this._movingEventsRegisterd) {
      this._div.removeEventListener("mousedown", this._handleMoving);
      this._movingEventsRegisterd = false;
    }
  }

  _handleMoving(downEvent: MouseEvent) {
    if (downEvent.button != 0) return; // only care LeftButton
    downEvent.stopPropagation();
    const layout = this.getparentlayout() as Layout;
    layout.setMoving("start", 0, 0);
    const startX = downEvent.clientX;
    const startY = downEvent.clientY;

    const handleMove = (moveEvent: MouseEvent) => {
      const newMouseX = moveEvent.clientX;
      const newMouseY = moveEvent.clientY;
      const deltaY = newMouseY - startY;
      const deltaX = newMouseX - startX;
      layout.setMoving("move", deltaX, deltaY);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      if (upEvent.button != 0) return; // only care LeftButton
      upEvent.stopPropagation();
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleMouseUp);
      const newMouseX = upEvent.clientX;
      const newMouseY = upEvent.clientY;
      const deltaY = newMouseY - startY;
      const deltaX = newMouseX - startX;
      layout.setMoving("final", deltaX, deltaY);
    };
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  /**
   * Hookable. Event happens when the left mouse
   * button was previously down and is now up.
   *
   * @param  x   The X position in the screen where the cursor was when the event was triggered.
   * @param  y   The Y position in the screen where the cursor was when the event was triggered.
   */
  onLeftButtonUp(x: number, y: number) {
    UI_ROOT.vm.dispatch(this, "onleftbuttonup", [
      { type: "INT", value: x },
      { type: "INT", value: y },
    ]);
  }

  /**
   * Hookable. Event happens when the left mouse button
   * is pressed.
   *
   * @param  x   The X position in the screen where the cursor was when the event was triggered.
   * @param  y   The Y position in the screen where the cursor was when the event was triggered.
   */
  onLeftButtonDown(x: number, y: number) {
    assert(
      x >= this.getleft(),
      "Expected click to be to the right of the component's left"
    );
    assert(
      y >= this.gettop(),
      "Expected click to be below the component's top"
    );
    UI_ROOT.vm.dispatch(this, "onleftbuttondown", [
      { type: "INT", value: x },
      { type: "INT", value: y },
    ]);
  }

  /**
   * Hookable. Event happens when the right mouse button
   * was previously down and is now up.
   *
   * @param  x   The X position in the screen where the cursor was when the event was triggered.
   * @param  y   The Y position in the screen where the cursor was when the event was triggered.
   */
  onRightButtonUp(x: number, y: number) {
    UI_ROOT.vm.dispatch(this, "onrightbuttonup", [
      { type: "INT", value: x },
      { type: "INT", value: y },
    ]);
  }

  /**
   * Hookable. Event happens when the right mouse button
   * is pressed.
   *
   * @param  x   The X position in the screen where the cursor was when the event was triggered.
   * @param  y   The Y position in the screen where the cursor was when the event was triggered.
   */
  onRightButtonDown(x: number, y: number) {
    UI_ROOT.vm.dispatch(this, "onrightbuttondown", [
      { type: "INT", value: x },
      { type: "INT", value: y },
    ]);
  }

  /**
   * Hookable. Event happens when the mouse
   * enters the objects area.
   */
  onEnterArea() {
    UI_ROOT.vm.dispatch(this, "onenterarea");
  }

  /**
   * Hookable. Event happens when the mouse
   * leaves the objects area.
   */
  onLeaveArea() {
    UI_ROOT.vm.dispatch(this, "onleavearea");
  }

  /**
   * Set a target X position, in the screen, for
   * the object.
   *
   * @param  x   The target X position of the object.
   */
  settargetx(x: number) {
    this._targetX = x;
  }

  /**
   * Set a target Y position, in the screen, for
   * the object.
   *
   * @param  y   The target Y position of the object.
   */
  settargety(y: number) {
    this._targetY = y;
  }

  /**
   * Set a target width, in pixels, for the object.
   *
   * @param  w   The target width of the object.
   */
  settargetw(w: number) {
    this._targetWidth = w;
  }

  /**
   * Set a target height, in pixels, for the object.
   *
   * @param  h   The target height of the object.
   */
  settargeth(h: number) {
    this._targetHeight = h;
  }

  /**
   * Set a target alphablending value for the object.
   * The value range is from 0 (totally transparent)
   * to 255 (totally opaque).
   *
   * @param  alpha   The target alpha value.
   */
  settargeta(alpha: number) {
    this._targetAlpha = alpha;
  }

  /**
   * The amount of time in which you wish to arrive at
   * the target(s) previously set, in seconds.
   *
   * @param  insecond    The number of seconds in which to reach the target.
   */
  settargetspeed(insecond: number) {
    this._targetSpeed = insecond;
  }

  /**
   * Begin transition to previously set target.
   */
  gototarget() {
    this._goingToTarget = true;
    const duration = this._targetSpeed * 1000;
    const startTime = performance.now();

    const pairs = [
      ["_x", "_targetX", "_renderX"],
      ["_y", "_targetY", "_renderY"],
      ["_width", "_targetWidth", "_renderWidth"],
      ["_height", "_targetHeight", "_renderHeight"],
      ["_alpha", "_targetAlpha", "_renderAlpha"],
    ];

    const changes: {
      [key: string]: {
        start: number;
        delta: number;
        renderKey: string;
        target: number;
        positive: boolean;
      };
    } = {};

    for (const [key, targetKey, renderKey] of pairs) {
      const target = this[targetKey];
      if (target != null) {
        const start = this[key];
        const positive = target > start;
        const delta = target - start;
        changes[key] = { start, delta, renderKey, target, positive };
      }
    }

    const clamp = (current, target, positive) => {
      if (positive) {
        return Math.min(current, target);
      } else {
        return Math.max(current, target);
      }
    };

    const update = (time: number) => {
      const timeDiff = time - startTime;
      const progress = timeDiff / duration;
      for (const [
        key,
        { start, delta, renderKey, target, positive },
      ] of Object.entries(changes)) {
        this[key] = clamp(start + delta * progress, target, positive);
        this[renderKey]();
      }
      if (timeDiff < duration) {
        window.requestAnimationFrame(update);
      } else {
        this._goingToTarget = false;
        // TODO: Clear targets?
        UI_ROOT.vm.dispatch(this, "ontargetreached");
      }
    };

    window.requestAnimationFrame(update);
  }

  /**
   * Experimental/unused
   */
  __gototargetWebAnimationApi() {
    const duration = this._targetSpeed * 1000;

    const start = {
      left: px(this._x ?? 0),
      top: px(this._y ?? 0),
      width: px(this._width),
      height: px(this._height),
      opacity: this._alpha / 255,
    };
    const end = {
      left: px(this._targetX ?? this._x ?? 0),
      top: px(this._targetY ?? this._y ?? 0),
      width: px(this._targetWidth ?? this._width),
      height: px(this._targetHeight ?? this._height),
      opacity: (this._targetAlpha ?? this._alpha) / 255,
    };

    const frames = [start, end];

    const animation = this._div.animate(frames, { duration });
    animation.addEventListener("finish", () => {
      this._x = this._targetX ?? this._x;
      this._y = this._targetY ?? this._y;
      this._width = this._targetWidth ?? this._width;
      this._height = this._targetHeight ?? this._height;
      this._alpha = this._targetAlpha ?? this._alpha;
      this._renderDimensions();
      this._renderAlpha();
      UI_ROOT.vm.dispatch(this, "ontargetreached");
    });
  }
  /**
   * Hookable. Event happens when the object has reached
   * it's previously set target.
   */
  ontargetreached() {
    assume(false, "Unimplemented");
  }

  canceltarget() {
    assume(false, "Unimplemented");
  }

  /**
   * isGoingToTarget()
   */

  // [WHERE IS THIS?]

  // modifies the x/y targets so that they compensate for gained width/height. useful to make drawers that open up without jittering
  reversetarget(reverse: number) {
    assume(false, "Unimplemented");
  }

  onStartup() {
    assume(false, "Unimplemented");
  }

  /**
   * Set the alphablending value of the object.
   * Value ranges from 0 (fully transparent) to
   * 255 (fully opaque).
   *
   * @param  alpha   The alpha value.
   */
  setalpha(alpha: number) {
    this._alpha = alpha;
    this._renderAlpha();
  }

  /**
   * Get the current alphablending value of
   * the object. Value ranges from 0 (fully
   * transparent) to 255 (fully opaque).
   *
   * @ret The alpha value.
   */
  getalpha(): number {
    return this._alpha;
  }

  getparentlayout(): Group {
    if (this._parent) {
      return this._parent.getparentlayout();
    }
  }

  bringtofront() {
    BRING_MOST_TOP += 1;
    this._div.style.zIndex = String(BRING_MOST_TOP);
  }

  bringtoback() {
    BRING_LEAST -= 1;
    this._div.style.zIndex = String(BRING_LEAST);
  }

  handleAction(
    action: string,
    param: string | null,
    actionTarget: string | null
  ): boolean {
    return false;
  }

  // Sends an action up the UI heirarchy
  dispatchAction(
    action: string,
    param: string | null,
    actionTarget: string | null
  ) {
    const handled = this.handleAction(action, param, actionTarget);
    if (!handled && this._parent != null) {
      this._parent.dispatchAction(action, param, actionTarget);
    }
  }

  _renderAlpha() {
    this._div.style.opacity = `${this._alpha / 255}`;
  }
  _renderVisibility() {
    this._div.style.display = this._visible ? "inline-block" : "none";
  }
  _renderTransate() {
    this._div.style.transform = `translate(${px(this._x ?? 0)}, ${px(
      this._y ?? 0
    )})`;
  }
  _renderX() {
    this._div.style.left =
      this._relatx == "1" ? relat(this._x ?? 0) : px(this._x ?? 0);
  }

  _renderY() {
    this._div.style.top =
      this._relaty == "1" ? relat(this._y ?? 0) : px(this._y ?? 0);
  }

  _renderWidth() {
    // if(this._autowidthsource) return;
    this._div.style.width =
      this._relatw == "1" ? relat(this._width ?? 0) : px(this.getwidth());
  }

  _renderHeight() {
    this._div.style.height =
      this._relath == "1" ? relat(this._height ?? 0) : px(this.getheight());
  }

  _renderDimensions() {
    this._renderX();
    this._renderY();
    this._renderWidth();
    this._renderHeight();
  }

  setBackgroundImage(bitmap: Bitmap | null) {
    this._backgroundBitmap = bitmap;
    if (bitmap != null) {
      bitmap.setAsBackground(this._div);
    } else {
      this._div.style.setProperty(`--background-image`, "none");
      this._div.style.setProperty(`--background-position`, "none");
    }
  }

  // JS Can't set the :active pseudo selector. Instead we have a hard-coded
  // pseduo-selector in our stylesheet which references a CSS variable and then
  // we control the value of that variable from JS.
  setActiveBackgroundImage(bitmap: Bitmap | null) {
    if (bitmap != null) {
      bitmap.setAsActiveBackground(this._div);
    }
  }

  draw() {
    this._div.setAttribute("data-id", this.getId());
    this._div.setAttribute("data-obj-name", "GuiObj");
    this._renderVisibility();
    this._div.style.position = "absolute";
    this._renderAlpha();
    if (this._tooltip) {
      this._div.setAttribute("title", this._tooltip);
    }
    if (this._ghost) {
      this._div.style.pointerEvents = "none";
    } else {
      this._div.style.pointerEvents = "auto";
    }
    this._renderDimensions();
  }
}
