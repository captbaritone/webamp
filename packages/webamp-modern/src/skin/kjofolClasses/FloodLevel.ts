import { UIRoot } from "../../UIRoot";
import { assume, throttle } from "../../utils";
import GuiObj from "../makiClasses/GuiObj";
import MakiMap from "../makiClasses/MakiMap";

export default class FloodLevel extends GuiObj {
  _canvas: HTMLCanvasElement = document.createElement("canvas");
  _mapImage: string;
  _frontImage: string;
  _map: MakiMap;
  _mouseIsDown: boolean;
  _value: number; //0..255

  constructor(uiRoot: UIRoot) {
    super(uiRoot);
    this._map = new MakiMap(uiRoot);
  }

  getElTag(): string {
    return "layer";
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
      case "frontimage":
        this._frontImage = value;
        break;
      default:
        return false;
    }
    return true;
  }

  init() {
    super.init();
    this._map = new MakiMap(this._uiRoot);
    this._map.loadmap(this._mapImage);
    this._registerDragEvents();
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

      const throttleMouseMove = throttle(handleMove, 10);

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
      console.log("flood:", val);
      this._value = val;
      this._renderFlood();
      // this.stop();
      // this.setstartframe(this.getcurframe());
      // this.setendframe(Math.round((val / 255) * (this._frameCount - 1)));
      // this.play();
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

  _renderFlood() {
    const [w, h] = [this.getwidth(), this.getheight()];
    const ctx = this._canvas.getContext("2d"); // destination
    ctx.clearRect(0, 0, w, h);
    // ctx.fillStyle='fuchsia'
    // ctx.fillRect(0, 0, w, h);

    const img = ctx.getImageData(0, 0, w, h);
    const data = img.data;

    const bitmap = this._uiRoot.getBitmap(this._frontImage); // source pixel
    const canvasb = bitmap.getCanvas(true);
    const ctxb = canvasb.getContext("2d");
    const imgb = ctxb.getImageData(this.getleft(), this.gettop(), w, h);
    const datab = imgb.data;

    assume(img.width==imgb.width && img.height==imgb.height, 'mismatch size of source vs dest')

    // const dataa = this.alphaData;
    // const bw = bitmap.getWidth();
    // const bh = bitmap.getHeight();

    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        // // for (var i = 3; i < dataa.length; i += 4) {
        const val = this._map.getUnsafeValue(x, y);
        if (val != null && val <= this._value) {
          const b = (y * w + x) * 4;
          data[b + 0] = datab[b + 0];
          data[b + 1] = datab[b + 1];
          data[b + 2] = datab[b + 2];
          data[b + 3] = datab[b + 3];
        }
        // //? ignore transparent
        // if (datab[b * 4 + 3] != 0) {
        //   const a = (y + dy) * aw + dx + x;
        //   datab[b * 4 + 3] = dataa[a * 4 + 3];
        //   // anyPixelChanged = true;
        // }
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  _renderWidth() {
    super._renderWidth();
    this._canvas.style.width = this._div.style.width;
    this._canvas.setAttribute("width", `${parseInt(this._div.style.width)}`);
  }

  _renderHeight() {
    super._renderHeight();
    this._canvas.style.height = this._div.style.height;
    this._canvas.setAttribute("height", `${parseInt(this._div.style.height)}`);
  }

  draw() {
    super.draw();
    this._div.appendChild(this._canvas);
    // this.update();
  }
}
