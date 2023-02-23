/**
 * this file is needed to workaround of button-moving-layout issue
 */

import { throttle, toBool } from "../../utils";
import GuiObj from "./GuiObj";

import Layout from "./Layout";
import { LEFT, RIGHT, TOP, BOTTOM, CURSOR, MOVE } from "../Cursor";

export default abstract class Movable extends GuiObj {
  _movable: boolean = false;
  _canResize: number = 0;
  _resize: string;
  _resizingEventsRegistered: boolean = false;
  _movingEventsRegistered: boolean = false;

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "move":
        this._movable = toBool(value);
        this._renderCssCursor();
        break;
      case "resize":
        this._resize = value == "0" ? "" : value;
        this._renderCssCursor();
        break;

      default:
        return false;
    }
    return true;
  }

  _renderCssCursor() {
    // only one of this possible: movable or resizable. not both
    if (this._movable) {
      this._unregisterResizingEvents();
      // winamp cursor for movable area is default/arrow.
      this._div.style.removeProperty("cursor");
      this._canResize = MOVE; // = left + top - (width, height)
      this._registerMovingEvents();
    } else {
      this._unregisterMovingEvents();

      switch (this._resize) {
        case "right":
          this._div.style.cursor = "e-resize";
          this._canResize = RIGHT;
          break;
        case "left":
          this._div.style.cursor = "w-resize";
          this._canResize = LEFT;
          break;
        case "top":
          this._div.style.cursor = "n-resize";
          this._canResize = TOP;
          break;
        case "bottom":
          this._div.style.cursor = "s-resize";
          this._canResize = BOTTOM;
          break;
        case "topleft":
          this._div.style.cursor = "nw-resize";
          this._canResize = TOP | LEFT;
          break;
        case "topright":
          this._div.style.cursor = "ne-resize";
          this._canResize = TOP | RIGHT;
          break;
        case "bottomleft":
          this._div.style.cursor = "sw-resize";
          this._canResize = BOTTOM | LEFT;
          break;
        case "bottomright":
          this._div.style.cursor = "se-resize";
          this._canResize = BOTTOM | RIGHT;
          break;
        default:
          this._div.style.removeProperty("cursor");
          this._canResize = 0;
      }

      if (this._canResize != 0) {
        this._registerResizingEvents();
      } else {
        this._unregisterResizingEvents();
      }
    }
  }

  _registerResizingEvents() {
    if (this._resizingEventsRegistered) {
      return;
    }
    this._resizingEventsRegistered = true;
    this._div.addEventListener("mousedown", this._handleResizing);
  }

  _unregisterResizingEvents() {
    if (this._resizingEventsRegistered) {
      this._div.removeEventListener("mousedown", this._handleResizing);
      this._resizingEventsRegistered = false;
    }
  }

  _handleResizing = (downEvent: MouseEvent) => {
    downEvent.stopPropagation();
    if (downEvent.button != 0) return; // only care LeftButton
    const layout = this.getparentlayout() as Layout;
    layout.setResizing("constraint", this._canResize, 0);
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
      upEvent.stopPropagation();
      if (upEvent.button != 0) return; // only care LeftButton
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleMouseUp);
      const newMouseX = upEvent.clientX;
      const newMouseY = upEvent.clientY;
      const deltaY = newMouseY - startY;
      const deltaX = newMouseX - startX;
      layout.setResizing("final", deltaX, deltaY);
    };
    document.addEventListener("mousemove", throttle(handleMove, 75));
    document.addEventListener("mouseup", handleMouseUp);
  };

  _registerMovingEvents() {
    if (this._movingEventsRegistered) {
      return;
    }
    this._movingEventsRegistered = true;
    this._div.addEventListener("mousedown", this._handleMoving);
  }

  _unregisterMovingEvents() {
    if (this._movingEventsRegistered) {
      this._div.removeEventListener("mousedown", this._handleMoving);
      this._movingEventsRegistered = false;
    }
  }

  _handleMoving = (downEvent: MouseEvent) => {
    downEvent.stopPropagation();
    if (downEvent.button != 0) return; // only care LeftButton
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
    document.addEventListener("mousemove", throttle(handleMove, 10));
    document.addEventListener("mouseup", handleMouseUp);
  };

  draw() {
    super.draw();
    if (this._ghost || this._sysregion == -2) {
      this._div.style.pointerEvents = "none";
    } else if (this._movable || this._canResize) {
      this._div.style.pointerEvents = "auto";
    } else if (this._ghost) {
      this._div.style.pointerEvents = "none";
    }
  }
}
