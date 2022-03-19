/**
 * this file is needed to workaround of button-moving-layout issue
 */

import { toBool } from "../../utils";
import GuiObj from "./GuiObj";

import Layout from "./Layout";
import { LEFT, RIGHT, TOP, BOTTOM, CURSOR, MOVE } from "../Cursor";


export default class Movable extends GuiObj {
  _movable: boolean = false;
  _resizable: number = 0;
  _resize: string;
  _resizingEventsRegisterd: boolean = false;
  _movingEventsRegisterd: boolean = false;

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
    // this._resizable = 0; //flag. replace soon
    this._div.style.cursor = "none"; //flag. replace soon
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
      this._div.style.removeProperty("cursor");
      this._resizable = MOVE;
      this._registerMovingEvents();

      // } else if (this._resizable == 0) {
    } else if (this._div.style.cursor == "none") {
      this._div.style.removeProperty("cursor");
    } else {
    //   this._div.style.pointerEvents = "auto";
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
    downEvent.stopPropagation();
    if (downEvent.button != 0) return; // only care LeftButton
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
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  draw() {
      super.draw()
    //   this._div.style.pointerEvents = this._movable || this._resizable? "auto": "none";
    if(this._movable || this._resizable){
        // this._div.style.removeProperty('pointer-events');
        this._div.style.pointerEvents = 'auto'
    } else if (this._ghost) {
        this._div.style.pointerEvents = "none";
        this._div.style.setProperty('--pointer-events-by', "movable");
    }
     
  }
}
