import { UIRoot } from "../../UIRoot";
import { throttle } from "../../utils";
import AnimatedLayer from "../makiClasses/AnimatedLayer";
import MakiMap from "../makiClasses/MakiMap";

export default class DialKnob extends AnimatedLayer {
  _mapImage: string;
  _map: MakiMap;
  _frameCount: number;
  _mouseIsDown: boolean = false;

  constructor(uiRoot: UIRoot) {
    super(uiRoot);
    this._map = new MakiMap(uiRoot);
    this._speed = 20;
    this._autoReplay = false;
  }

  getElTag(): string {
    return "animatedlayer";
  }

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "mapimage":
        this._mapImage = value;
        break;
      default:
        return false;
    }
    return true;
  }

  init() {
    super.init();
    this._frameCount = this.getlength(); // because getLength seem as expensive
    this._registerDragEvents();
    this._map.loadmap(this._mapImage);
  }

  _registerDragEvents() {
    this._div.addEventListener("mousedown", (downEvent: MouseEvent) => {
      downEvent.stopPropagation();
      if (downEvent.button != 0) return; // only care LeftButton
      //TODO: change client/offset into pageX/Y
      const startX = downEvent.clientX;
      const startY = downEvent.clientY;
      const innerX = downEvent.offsetX;
      const innerY = downEvent.offsetY;
      // this._checkMouseDownInThumb(downEvent.offsetX, downEvent.offsetY);
      this.doLeftMouseDown(downEvent.offsetX, downEvent.offsetY);

      const handleMove = (moveEvent: MouseEvent) => {
        moveEvent.stopPropagation();
        const newMouseX = moveEvent.clientX;
        const newMouseY = moveEvent.clientY;
        const deltaX = newMouseX - startX;
        const deltaY = newMouseY - startY;

        //below is mousePosition conversion relative to inner _div
        this.doMouseMove(innerX + deltaX, innerY + deltaY);
      };

      const throttleMouseMove = throttle(handleMove, 50);

      const handleMouseUp = (upEvent: MouseEvent) => {
        upEvent.stopPropagation();
        if (upEvent.button != 0) return; // only care LeftButton

        document.removeEventListener("mousemove", throttleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        this.doLeftMouseUp(upEvent.offsetX, upEvent.offsetY);
      };
      document.addEventListener("mousemove", throttleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    });
  }

  doLeftMouseDown(x: number, y: number) {
    this._mouseIsDown = true;
    const val = this._map.getUnsafeValue(x, y);
    if (val != null && !isNaN(val)) {
      console.log("knob:", val);
      this.stop();
      this.setstartframe(this.getcurframe());
      this.setendframe(Math.round((val / 255) * (this._frameCount-1)));
      this.play();
    }
  }
  doMouseMove(x: number, y: number) {
    if (this._mouseIsDown) {
      this.doLeftMouseDown(x, y);
    }
  }
  doLeftMouseUp(x: number, y: number) {
    this._mouseIsDown = false;
  }
}
